import { useEffect, useMemo, useState, useRef } from "react";
import "../../../styles/virtualNurseyStyles/AlphabetActivity.css";
import confetti from "canvas-confetti";
import yaySfx from "../../../assets/audios/yay.mp3";
import trySfx from "../../../assets/audios/keeptrying.mp3";

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

// Fisher–Yates shuffle
function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function AlphabetActivity({
  order = "random",
  persistKey = "balloon_pop_progress_v1",
  limit = 5,
}) {
  const yayRef = useRef(null);
  const tryRef = useRef(null);
  const [soundOn, setSoundOn] = useState(true);

  const playSound = (audioRef) => {
    if (!soundOn || !audioRef?.current) return;
    const a = audioRef.current;
    try {
      a.pause();
      a.currentTime = 0;
      a.play().catch(() => {});
    } catch {}
  };

  // const alphabet = useMemo(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), []);
  // const initialQueue = useMemo(
  //   () => (order === "random" ? shuffle(alphabet) : [...alphabet]),
  //   [alphabet, order]
  // );
  const alphabet = useMemo(() => "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""), []);

  const pool = useMemo(() => {
    const base = [...alphabet];
    if (limit > 0 && limit < base.length) {
      return order === "random"
        ? shuffle(base).slice(0, limit) // random 5
        : base.slice(0, limit); // A..E
    }
    return base;
  }, [alphabet, order, limit]);

  const initialQueue = useMemo(
    () => (order === "random" ? shuffle(pool) : [...pool]),
    [pool, order]
  );

  const [queue, setQueue] = useState(initialQueue);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [mistakes, setMistakes] = useState({});
  const [choices, setChoices] = useState([]);
  const [message, setMessage] = useState("");
  const [finished, setFinished] = useState(false);
  const [poppedIdx, setPoppedIdx] = useState(-1);
  const [lockInput, setLockInput] = useState(false);
  const [confettiOn, setConfettiOn] = useState(false); // NEW

  const target = queue[index];

  // Load saved progress
  useEffect(() => {
    const saved = localStorage.getItem(persistKey);
    if (!saved) return;
    try {
      const data = JSON.parse(saved);
      if (Array.isArray(data.queue) && typeof data.index === "number") {
        setQueue(data.queue);
        setIndex(Math.min(data.index, 25));
        setScore(data.score || 0);
        setMistakes(data.mistakes || {});
      }
    } catch {}
  }, [persistKey]);

  // Save progress
  useEffect(() => {
    localStorage.setItem(
      persistKey,
      JSON.stringify({ queue, index, score, mistakes })
    );
  }, [persistKey, queue, index, score, mistakes]);

  // Build choices when target changes
  // useEffect(() => {
  //   if (!target) return;
  //   const distractors = shuffle(alphabet.filter((l) => l !== target)).slice(
  //     0,
  //     2
  //   );
  //   setChoices(shuffle([target, ...distractors]));
  //   setMessage("");
  //   setPoppedIdx(-1);
  //   setLockInput(false);
  // }, [target, alphabet]);

  useEffect(() => {
    if (!target) return;
    const distractors = shuffle(pool.filter((l) => l !== target)).slice(0, 2); // CHANGED: alphabet -> pool
    setChoices(shuffle([target, ...distractors]));
    setMessage("");
    setPoppedIdx(-1);
    setLockInput(false);
  }, [target, pool]); // CHANGED: deps include pool

  const handlePop = (letter, i) => {
    if (finished || lockInput) return;
    setLockInput(true);
    setPoppedIdx(i);

    if (letter === target) {
      setMessage("✅ Correct! Pop!");
      setScore((s) => s + 1);
      triggerStars();
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
        setPoppedIdx(-1);
        setLockInput(false);
      }, 400);
    }
  };

  // const resetAll = () => {
  //   const fresh = order === "random" ? shuffle(alphabet) : [...alphabet];
  //   setQueue(fresh);
  //   setIndex(0);
  //   setScore(0);
  //   setMistakes({});
  //   setMessage("");
  //   setFinished(false);
  //   setPoppedIdx(-1);
  //   setLockInput(false);
  //   setConfettiOn(false); // NEW
  //   localStorage.removeItem(persistKey);
  // };

  const resetAll = () => {
    const fresh = order === "random" ? shuffle(pool) : [...pool]; // CHANGED: uses pool
    setQueue(fresh);
    setIndex(0);
    setScore(0);
    setMistakes({});
    setMessage("");
    setFinished(false);
    setPoppedIdx(-1);
    setLockInput(false);
    setConfettiOn(false);
    localStorage.removeItem(persistKey);
  };

  const progress = Math.round((index / queue.length) * 100);

  if (finished) {
    const total = queue.length;
    const stars =
      score >= total
        ? "⭐⭐⭐"
        : score >= total * 0.8
        ? "⭐⭐"
        : score >= total * 0.5
        ? "⭐"
        : "✨";

    return (
      <main className="nursery-review-screen">
         <button
          className="nursery-bp-back"
          onClick={() => window.history.back()}
          aria-label="Go back"
        >
          ← Back
        </button>
        <div className="nursery-container1">
        <h1 className="nursery-review-title">Balloon Pop – Alphabet</h1>

        <div className="nursery-review-stars">
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i}>⭐</span>
          ))}
        </div>

        <div className="nursery-review-card">
          <div className="nursery-review-header">Review</div>
          <div className="nursery-review-grid">
            {queue.map((l) => {
              const c = mistakes[l] || 0;
              return (
                <div
                  key={l}
                  className={`nursery-review-cell ${
                    c === 0 ? "perfect" : c <= 2 ? "ok" : "bad"
                  }`}
                >
                  <div className="nursery-letter">{l}</div>
                  <div className="nursery-count">x{c}</div>
                </div>
              );
            })}
          </div>
        </div>

        <button className="nursery-review-play-btn" onClick={resetAll}>
          Play again
        </button>
        </div>
      </main>
    );
  }

  return (
    <main className="nursery-bp-wrap">
      <audio ref={yayRef} src={yaySfx} preload="auto" playsInline />
      <audio ref={tryRef} src={trySfx} preload="auto" playsInline />

      {/* NEW: confetti overlay */}
      {confettiOn && <ConfettiBurst onDone={() => setConfettiOn(false)} />}

      <button className="nursery-bp-back" onClick={() => window.history.back()}>
        ← Back
      </button>

      <header className="nursery-bp-header">
        <h2>Pop the balloon with letter “{target}”</h2>
        <div className="nursery-bp-progress" aria-label="Progress">
          <div
            className="nursery-bp-progress-inner"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="nursery-bp-meta">
          {index}/{queue.length} • Score: {score}
        </div>
      </header>

      {/* NEW: BIG BOARD with quoted letter */}
      <section className="nursery-bp-board" aria-hidden="true">
        <div className="nursery-bp-board-frame">
          <div className="nursery-bp-board-inner">
            <div className="nursery-bp-board-letter">“{target}”</div>
          </div>
        </div>
      </section>

      <section className="nursery-bp-stage" aria-live="polite">
        {choices.map((c, i) => (
          <button
            key={c + i}
            className={`nursery-bp-balloon nursery-b${i + 1} ${
              poppedIdx === i ? "popped" : ""
            }`}
            onClick={() => handlePop(c, i)}
            aria-label={`Balloon ${i + 1}, letter ${c}`}
            disabled={lockInput}
          >
            <span className="nursery-bp-letter">{c}</span>
          </button>
        ))}
      </section>

      <p className="nursery-bp-message">{message}</p>

      <div className="nursery-bp-actions">
        <button className="nursery-bp-secondary" onClick={resetAll}>
          Reset
        </button>
      </div>
    </main>
  );
}
