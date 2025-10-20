import { useEffect, useMemo, useRef, useState } from "react";
import "../../../styles/virtualNurseyStyles/ShapesActivity.css";
import confetti from "canvas-confetti";
// optional sound effects (comment out if not used)
 import yaySfx from "../../../assets/audios/yay.mp3";
import trySfx from "../../../assets/audios/keeptrying.mp3";

const ALL_SHAPES = ["circle", "square", "rectangle", "triangle", "oval", "diamond"];

const CONFETTI_DEFAULTS = {
  spread: 360,
  ticks: 60,
  gravity: 0.35,
  decay: 0.92,
  startVelocity: 28,
  colors: ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C", "#FDFFB8"],
  shapes: ["circle"], 
};

function triggerStars() {
  const shoot = (count, scalar, originY) => {
    confetti({
      ...CONFETTI_DEFAULTS,
      particleCount: count,
      scalar, // size of pieces (1.0 is baseline)
      origin: { y: originY }, // where on the screen (0 = top, 1 = bottom)
    });
  };

  // one main + two follow-ups for depth
  shoot(60, 1.0, 0.35);
  setTimeout(() => shoot(40, 0.9, 0.32), 100);
  setTimeout(() => shoot(30, 0.8, 0.3), 200);
}


function shuffle(a) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function play(ref) {
  const a = ref?.current;
  if (!a) return;
  try {
    a.pause();
    a.currentTime = 0;
    a.play().catch(() => {});
  } catch {}
}


function makeItems(target, countTarget = 4, total = 8) {
  const items = [];
  // add correct items
  for (let i = 0; i < countTarget; i++) {
    items.push({ id: `${target}-${i}-${Math.random()}`, type: target });
  }
  // add distractors
  const others = shuffle(ALL_SHAPES.filter((s) => s !== target));
  let k = 0;
  while (items.length < total) {
    const t = others[k % others.length];
    items.push({ id: `${t}-${k}-${Math.random()}`, type: t });
    k++;
  }
  return shuffle(items);
}

export default function ShapesActivity({
  target = "circle",       // you can pass a specific one, or keep random
  countTarget = 4,         // how many correct shapes must be collected
  totalChoices = 8,        // total number of tokens shown
  persistKey = "shapes_sort_progress_v1",
}) {
  const [roundTarget, setRoundTarget] = useState(target === "random" ? randomTarget() : target);
  const [items, setItems] = useState(makeItems(roundTarget, countTarget, totalChoices));
  const [collected, setCollected] = useState([]);
  const [disabledIds, setDisabledIds] = useState(new Set()); // temporarily disables wrong pieces after shake
  const [message, setMessage] = useState("");
  const [finished, setFinished] = useState(false);

   const yayRef = useRef(null);
   const tryRef = useRef(null);

  useEffect(() => {
    // restore (optional)
    const saved = localStorage.getItem(persistKey);
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      if (data.roundTarget && Array.isArray(data.items)) {
        setRoundTarget(data.roundTarget);
        setItems(data.items);
        setCollected(data.collected || []);
        setFinished(Boolean(data.finished));
      }
    } catch {}
  }, [persistKey]);

  useEffect(() => {
    localStorage.setItem(
      persistKey,
      JSON.stringify({ roundTarget, items, collected, finished })
    );
  }, [persistKey, roundTarget, items, collected, finished]);

  const progress = Math.round((collected.length / countTarget) * 100);

  function onDragStart(e, item) {
    if (disabledIds.has(item.id)) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("text/plain", item.id);
    e.dataTransfer.effectAllowed = "move";
  }

  function onDragOver(e) {
    e.preventDefault(); // allow drop
    e.dataTransfer.dropEffect = "move";
  }

  function onDrop(e) {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const piece = items.find((it) => it.id === id);
    if (!piece) return;
    handleAttempt(piece);
  }

  function handleAttempt(piece) {
    if (finished) return;

    if (piece.type === roundTarget) {
      if (collected.find((c) => c.id === piece.id)) return; // already collected
      setCollected((prev) => {
        const next = [...prev, piece];
        if (next.length >= countTarget) {
          setFinished(true);
           triggerStars();
          setMessage("🎉 Great job! All matched!");
           if (yayRef.current) play(yayRef);
        } else {
          setMessage("✅ Nice! Keep going…");
           if (yayRef.current) play(yayRef);
        }
        return next;
      });
    } else {
      // wrong: shake + temporary disable
      setMessage("❌ Not this one. Try another!");
       if (tryRef.current) play(tryRef);
      setDisabledIds((prev) => new Set(prev).add(piece.id));
      // remove disabled after short delay
      setTimeout(() => {
        setDisabledIds((prev) => {
          const n = new Set(prev);
          n.delete(piece.id);
          return n;
        });
      }, 600);
      // attach a quick CSS shake to the token
      const el = document.getElementById(`shape-token-${piece.id}`);
      if (el) {
        el.classList.add("shake");
        setTimeout(() => el.classList.remove("shake"), 400);
      }
    }
  }

  function resetRound(newTarget = randomTarget()) {
    setRoundTarget(newTarget);
    setItems(makeItems(newTarget, countTarget, totalChoices));
    setCollected([]);
    setDisabledIds(new Set());
    setMessage("");
    setFinished(false);
    localStorage.removeItem(persistKey);
  }

  const targetLabel = toLabel(roundTarget);

  return (
    <main className="ss-wrap">
       <audio ref={yayRef} src={yaySfx} preload="auto" playsInline />
      <audio ref={tryRef} src={trySfx} preload="auto" playsInline /> 

      <header className="ss-header">
        <button className="nursery-bp-back" onClick={() => window.history.back()} aria-label="Go back">
          ← Back
        </button>

        <h2 className="ss-instruction">
          Drag and drop <strong>all the {targetLabel}s</strong> into the basket.
        </h2>

        <div className="ss-progress" aria-label="Progress">
          <div className="ss-progress-inner" style={{ width: `${progress}%` }} />
        </div>
        <div className="ss-meta">
          Collected: {collected.length}/{countTarget}
        </div>
      </header>

      {/* Target board */}
      <section className="ss-target-board" aria-hidden="true">
        <div className="ss-target-card">
          <div className="ss-target-title">Find this shape:</div>
          <div className="ss-target-visual">
            <Shape type={roundTarget} size={58} />
          </div>
          <div className="ss-target-name">{targetLabel}</div>
        </div>
      </section>

      {/* Palette */}
      <section className="ss-palette">
        {items.map((it) => {
          const isUsed = collected.some((c) => c.id === it.id);
          return (
            <button
              key={it.id}
              id={`shape-token-${it.id}`}
              className={`ss-token ${isUsed ? "used" : ""} ${disabledIds.has(it.id) ? "disabled" : ""}`}
              draggable={!isUsed && !disabledIds.has(it.id)}
              onDragStart={(e) => onDragStart(e, it)}
              onClick={() => {
                // keyboard/click alternative: attempt place via click
                handleAttempt(it);
              }}
              aria-label={`${toLabel(it.type)} token`}
            >
              <Shape type={it.type} />
            </button>
          );
        })}
      </section>

      {/* Drop zone */}
      <section
        className="ss-dropzone"
        onDragOver={onDragOver}
        onDrop={onDrop}
        aria-label={`Drop all ${targetLabel}s here`}
      >
        <div className="ss-basket">
          {collected.map((it) => (
            <div key={it.id} className="ss-basket-item">
              <Shape type={it.type} />
            </div>
          ))}
        </div>
        <div className="ss-drop-hint">
          Drop {countTarget - collected.length} more {targetLabel}
          {countTarget - collected.length === 1 ? "" : "s"}
        </div>
      </section>

      <p className="ss-message">{message}</p>

      <div className="ss-actions">
        <button className="ss-btn ghost" onClick={() => resetRound(roundTarget)}>Retry same</button>
        <button className="ss-btn" onClick={() => resetRound(randomTarget())}>New shape</button>
      </div>
    </main>
  );
}

function randomTarget() {
  return ALL_SHAPES[Math.floor(Math.random() * ALL_SHAPES.length)];
}

function toLabel(t) {
  return t.charAt(0).toUpperCase() + t.slice(1);
}


function Shape({ type, size = 56 }) {
  const style = { width: size, height: size };
  let cls = "ss-shape ";
  switch (type) {
    case "circle": cls += "ss-circle"; break;
    case "square": cls += "ss-square"; break;
    case "rectangle": cls += "ss-rectangle"; style.width = size * 1.3; style.height = size * 0.75; break;
    case "triangle": cls += "ss-triangle"; break;
    case "oval": cls += "ss-oval"; style.width = size * 1.3; break;
    case "diamond": cls += "ss-diamond"; break;
    default: cls += "ss-square"; break;
  }
  return <div className={cls} style={style} aria-hidden />;
}
