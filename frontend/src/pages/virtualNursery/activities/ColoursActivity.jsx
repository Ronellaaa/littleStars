import { useEffect, useMemo, useRef, useState } from "react";
import "../../../styles/virtualNurseyStyles/ColoursActivity.css";
import confetti from "canvas-confetti";

// optional sounds (plug your files or remove)
import yaySfx from "../../../assets/audios/yay.mp3";
import trySfx from "../../../assets/audios/keeptrying.mp3";

const COLORS = [
  { name: "Red", hex: "#e53935" },
  { name: "Blue", hex: "#1e88e5" },
  { name: "Green", hex: "#43a047" },
  { name: "Yellow", hex: "#fdd835" },
  { name: "Orange", hex: "#fb8c00" },
  { name: "Purple", hex: "#8e24aa" },
  { name: "Pink", hex: "#ec407a" },
];

function shuffle(a) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

const CONFETTI_DEFAULTS = {
  spread: 360,
  ticks: 60,
  gravity: 0.35,
  decay: 0.92,
  startVelocity: 28,
  colors: ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C", "#FDFFB8"],
  shapes: ["circle"],
};
function boom() {
  confetti({
    ...CONFETTI_DEFAULTS,
    particleCount: 70,
    scalar: 1,
    origin: { y: 0.35 },
  });
}

export default function ColoursActivity({
  rounds = 8, // total questions
  options = 4, // tiles per question (1 correct + 3 wrong)
  speak = true, // speak the prompt (fallback)
}) {
  // sounds + unlock
  const yayRef = useRef(null);
  const tryRef = useRef(null);
  const [soundOn, setSoundOn] = useState(true);

  const [audioUnlocked, setAudioUnlocked] = useState(false);
  function unlockAudio() {
    if (audioUnlocked) return;
    const p1 = yayRef.current?.play?.() || Promise.resolve();
    const p2 = tryRef.current?.play?.() || Promise.resolve();
    Promise.allSettled([p1, p2]).finally(() => {
      [yayRef.current, tryRef.current].forEach((a) => {
        try {
          a?.pause();
          if (a) a.currentTime = 0;
        } catch {}
      });
      setAudioUnlocked(true);
    });
  }
  function play(ref) {
    if (!soundOn || !audioUnlocked) return;
    const a = ref?.current;
    if (!a) return;
    try {
      a.pause();
      a.currentTime = 0;
      a.play().catch(() => {});
    } catch {}
  }

  // session
  const pool = useMemo(
    () => shuffle(COLORS).slice(0, Math.min(rounds, COLORS.length)),
    [rounds]
  );
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [selected, setSelected] = useState("");
  const [score, setScore] = useState(0);

  const target = pool[index];
  const progress = Math.round((index / pool.length) * 100);
  const finished = index >= pool.length;

  // build choices
  const [choices, setChoices] = useState([]);
  useEffect(() => {
    if (!target) return;
    const others = shuffle(COLORS.filter((c) => c.name !== target.name)).slice(
      0,
      Math.max(0, options - 1)
    );
    setChoices(shuffle([target, ...others]));
    setSelected("");
    setMessage("");
    if (speak) say(`Choose ${target.name}`);
    // eslint-disable-next-line
  }, [index, target, options]);

  function say(text) {
    try {
      const u = new SpeechSynthesisUtterance(text);
      u.lang = "en-US"; // switch to "si-LK" to add Sinhala later
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {}
  }

  function handlePick(c) {
    if (finished) return;
    setSelected(c.name);
    if (c.name === target.name) {
      setMessage("✅ Correct!");
      setScore((s) => s + 1);
      play(yayRef);
      boom();
      setTimeout(() => setIndex((i) => i + 1), 600);
    } else {
      setMessage("❌ Try again!");
      play(tryRef);
      // trigger shake via CSS by toggling a data-attr on the wrong tile
      setTimeout(() => setSelected(""), 400);
    }
  }

  function resetAll() {
    setIndex(0);
    setScore(0);
    setMessage("");
    setSelected("");
  }

  return (
    <main className="cc-wrap" onPointerDownCapture={unlockAudio}>
      <audio ref={yayRef} src={yaySfx} preload="auto" playsInline />
      <audio ref={tryRef} src={trySfx} preload="auto" playsInline />

      <header className="cc-header">
        <button
          className="nursery-bp-back"
          onClick={() => window.history.back()}
        >
          ← Back
        </button>
        <h2 className="cc-instruction">Choose the colour:</h2>
        <div
          className="cc-target-balloon"
          style={{ backgroundColor: target?.hex }}
        >
          <span className="cc-target-label">{target?.name}</span>
          <span className="cc-string" aria-hidden />
        </div>

        <div className="cc-progress" aria-label="Progress">
          <div
            className="cc-progress-inner"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="cc-meta">
          {index}/{pool.length} • Score: {score}
        </div>
      </header>

      {!finished ? (
        <>
          <section className="cc-grid">
            {choices.map((c) => {
              const isRight =
                selected && c.name === target.name && c.name === selected;
              const isWrong =
                selected && c.name === selected && c.name !== target.name;
              return (
                <button
                  key={c.name}
                  className={`cc-tile ${isRight ? "right" : ""} ${
                    isWrong ? "wrong" : ""
                  }`}
                  onClick={() => handlePick(c)}
                  aria-label={c.name}
                  style={{ backgroundColor: c.hex }}
                >
                  <span className="cc-label">{c.name}</span>
                </button>
              );
            })}
          </section>
          <p className="cc-message">{message}</p>
        </>
      ) : (
        <section className="cc-finish">
          <h3>🌈 Great job!</h3>
          <button className="cc-btn primary" onClick={resetAll}>
            Play again
          </button>
        </section>
      )}
    </main>
  );
}
