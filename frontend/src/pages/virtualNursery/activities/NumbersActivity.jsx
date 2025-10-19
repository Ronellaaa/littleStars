import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import "../../../styles/virtualNurseyStyles/NumbersActivity.css";

// OPTIONAL: point to your existing sounds, or comment them out
import yaySfx from "../../../assets/audios/yay.mp3";
import trySfx from "../../../assets/audios/keeptrying.mp3";
import candy from "../../../assets/candy.png";

const CONFETTI_DEFAULTS = {
  spread: 360,
  ticks: 60,
  gravity: 0.35,
  decay: 0.92,
  startVelocity: 28,
  colors: ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C", "#FDFFB8"],
  shapes: ["circle"],
};

function triggerConfetti() {
  const shoot = (count, scalar, originY) => {
    confetti({
      ...CONFETTI_DEFAULTS,
      particleCount: count,
      scalar,
      origin: { y: originY },
    });
  };
  shoot(60, 1, 0.35);
  setTimeout(() => shoot(40, 0.9, 0.32), 120);
  setTimeout(() => shoot(30, 0.8, 0.3), 240);
}

// Fisher–Yates shuffle
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function NumbersActivity({
  order = "random", // "random" | "asc"
  limit = 10, // up to 10
  persistKey = "numbers_match_progress_v1",
  choicesCount = 3, // 3 choices per round
  candySrc = candy,
}) {
  const yayRef = useRef(null);
  const tryRef = useRef(null);

  const numbersAll = useMemo(
    () => Array.from({ length: 10 }, (_, i) => i + 1),
    []
  );
  const pool = useMemo(() => {
    const base = numbersAll.slice(0, Math.max(1, Math.min(10, limit)));
    return order === "random" ? shuffle(base) : base;
  }, [numbersAll, order, limit]);

  const [queue, setQueue] = useState(pool);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState({});
  const [choices, setChoices] = useState([]);
  const [message, setMessage] = useState("");
  const [finished, setFinished] = useState(false);
  const [lockInput, setLockInput] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);

  const target = queue[index];
  const progress = Math.round((index / queue.length) * 100);

  // Restore saved progress
  useEffect(() => {
    const saved = localStorage.getItem(persistKey);
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      if (Array.isArray(data.queue) && typeof data.index === "number") {
        setQueue(data.queue);
        setIndex(Math.min(data.index, data.queue.length - 1));
        setScore(data.score || 0);
        setMistakes(data.mistakes || {});
      }
    } catch {}
    // eslint-disable-next-line
  }, []);

  // Save progress
  useEffect(() => {
    localStorage.setItem(
      persistKey,
      JSON.stringify({ queue, index, score, mistakes })
    );
  }, [persistKey, queue, index, score, mistakes]);

  // Build choices whenever target changes
  useEffect(() => {
    if (!target) return;
    const others = shuffle(numbersAll.filter((n) => n !== target)).slice(
      0,
      choicesCount - 1
    );
    setChoices(shuffle([target, ...others]));
    setMessage("");
    setSelectedIdx(-1);
    setLockInput(false);
  
  }, [target, numbersAll, choicesCount]);

  const playSound = (ref) => {
    const a = ref?.current;
    if (!a) return;
    try {
      a.pause();
      a.currentTime = 0;
      a.play().catch(() => {});
    } catch {}
  };

  function handlePick(val, i) {
    if (finished || lockInput) return;
    setLockInput(true);
    setSelectedIdx(i);

    if (val === target) {
      setMessage("✅ Correct!");
      setScore((s) => s + 1);
      triggerConfetti();
      playSound(yayRef);
      setTimeout(() => {
        const next = index + 1;
        if (next >= queue.length) {
          setFinished(true);
        } else {
          setIndex(next);
        }
      }, 650);
    } else {
      setMessage("❌ Try again!");
      playSound(tryRef);
      setMistakes((m) => ({ ...m, [target]: (m[target] || 0) + 1 }));
      setTimeout(() => {
        setSelectedIdx(-1);
        setLockInput(false);
      }, 450);
    }
  }

  function resetAll() {
    const fresh = order === "random" ? shuffle(pool) : [...pool];
    setQueue(fresh);
    setIndex(0);
    setScore(0);
    setMistakes({});
    setMessage("");
    setFinished(false);
    setSelectedIdx(-1);
    setLockInput(false);
    localStorage.removeItem(persistKey);
  }

  if (finished) {
    const total = queue.length;
    return (
      <main className="nm-wrap review">
         <button
          className="nursery-bp-back"
          onClick={() => window.history.back()}
          aria-label="Go back"
        >
          ← Back
        </button>
        <h1 className="nm-title">Candy Jars – Numbers</h1>

        <div className="nm-stars" aria-hidden>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i}>⭐</span>
          ))}
        </div>

        <div className="nm-review-card">
          <div className="nm-review-header">Review</div>
          <div className="nm-review-grid">
            {queue.map((n) => {
              const c = mistakes[n] || 0;
              return (
                <div
                  key={n}
                  className={`nm-review-cell ${
                    c === 0 ? "perfect" : c <= 2 ? "ok" : "bad"
                  }`}
                >
                  <div className="nm-review-num">{n}</div>
                  <div className="nm-review-count">x{c}</div>
                </div>
              );
            })}
          </div>
        </div>

        <button className="nm-btn primary" onClick={resetAll}>
          Play again
        </button>
      </main>
    );
  }

  return (
    <main className="nm-wrap">
      <audio ref={yayRef} src={yaySfx} preload="auto" playsInline />
      <audio ref={tryRef} src={trySfx} preload="auto" playsInline />

      <header className="nm-header">
        <button
          className="nursery-bp-back"
          onClick={() => window.history.back()}
          aria-label="Go back"
        >
          ← Back
        </button>

        <h2 className="nm-instruction">
          Pick the <strong>jar</strong> with <strong>{target}</strong>{" "}
          
        </h2>

        <div className="nm-progress" aria-label="Progress">
          <div
            className="nm-progress-inner"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="nm-meta">
          {index}/{queue.length} • Score: {score}
        </div>
      </header>

      {/* Big target card */}
      <section className="nm-target-board" aria-hidden="true">
        <div className="nm-target-frame">
          <div className="nm-target-inner">
            <div className="nm-target-number">“{target}”</div>
          </div>
        </div>
      </section>

      {/* Choices (Candy Jars) */}
      <section className="nm-stage" aria-live="polite">
        {choices.map((val, i) => (
          <button
            key={val + "-" + i}
            className={`nm-jar ${
              selectedIdx === i ? (val === target ? "right" : "wrong") : ""
            }`}
            onClick={() => handlePick(val, i)}
            disabled={lockInput}
            aria-label={`Jar ${i + 1} with ${val} items`}
          >
            <div className="nm-jar-glass">
              <div className="nm-candies">
                {Array.from({ length: val }).map((_, k) => (
                  <img
                    key={k}
                    className="nm-candy-img"
                    src={candySrc}
                    alt="" // decorative
                    draggable="false"
                    style={{
                      transform: `rotate(${(k % 5) * 6 - 12}deg)`, // small variety
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="nm-jar-label">{val}</div>
          </button>
        ))}
      </section>

      <p className="nm-message">{message}</p>

      <div className="nm-actions">
        <button className="nm-btn ghost" onClick={resetAll}>
          Reset
        </button>
      </div>
    </main>
  );
}
