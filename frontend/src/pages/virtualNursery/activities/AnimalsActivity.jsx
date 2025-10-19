import { useEffect, useMemo, useRef, useState } from "react";
import confetti from "canvas-confetti";
import "../../../styles/virtualNurseyStyles/AnimalsActivity.css";

// OPTIONAL: add applause/try-again (or reuse your yay/try)
import yaySfx from "../../../assets/audios/yay.mp3";
import trySfx from "../../../assets/audios/keeptrying.mp3";

// 1) Animal registry (names must match your image/sound filenames by slug)
const ANIMALS = [
  { name: "Cat",     emoji: "🐱" },
  { name: "Dog",     emoji: "🐶" },
  { name: "Cow",     emoji: "🐮" },
  { name: "Lion",    emoji: "🦁" },
  { name: "Elephant",emoji: "🐘" },
  { name: "Monkey",  emoji: "🐒" },
  { name: "Tiger",   emoji: "🐯" },
  { name: "Duck",    emoji: "🦆" },
  { name: "Horse",   emoji: "🐴" },
];

// 2) Optional: load real animal images (Vite glob) from src/assets/animals/*.png|webp|svg|jpg
const IMAGES = import.meta.glob(
  "/src/assets/animals/*.{png,webp,svg,jpg,jpeg}",
  { eager: true, as: "url" }
);

// 3) Optional: load real animal sounds from src/assets/animals/sounds/*.mp3
const SOUNDS = import.meta.glob(
  "/src/assets/audios/animals/*.mp3",
  { eager: true, as: "url" }
);

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
  shoot(60, 1.0, 0.35);
  setTimeout(() => shoot(40, 0.9, 0.32), 120);
  setTimeout(() => shoot(30, 0.8, 0.30), 240);
}

// helpers
const toSlug = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const choiceCount = 3;

function shuffle(a) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function AnimalsActivity({
  rounds = 7,           // number of prompts per session
  useRealImages = true, // if you have images in src/assets/animals/
  useRealSounds = true, // if you have sounds in src/assets/animals/sounds/
  speak = true,         // speak the prompt (fallback)
}) {
  const yayRef = useRef(null);
  const tryRef = useRef(null);

  // sound policy unlock + toggle
  const [soundOn, setSoundOn] = useState(true);
  const [audioUnlocked, setAudioUnlocked] = useState(false);
  function unlockAudio() {
    if (audioUnlocked) return;
    const p1 = yayRef.current?.play?.() || Promise.resolve();
    const p2 = tryRef.current?.play?.() || Promise.resolve();
    Promise.allSettled([p1, p2]).finally(() => {
      [yayRef.current, tryRef.current].forEach((a) => { try { a?.pause(); if (a) a.currentTime = 0; } catch {} });
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

  // build session queue
  const pool = useMemo(() => shuffle(ANIMALS).slice(0, Math.min(rounds, ANIMALS.length)), [rounds]);
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState("");
  const [lock, setLock] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(-1);

  const target = pool[index];
  const progress = Math.round((index / pool.length) * 100);

  // choices for current round
  const [choices, setChoices] = useState([]);
  useEffect(() => {
    if (!target) return;
    const others = shuffle(ANIMALS.filter(a => a.name !== target.name)).slice(0, choiceCount - 1);
    setChoices(shuffle([target, ...others]));
    setMessage("");
    setSelectedIdx(-1);
    setLock(false);
    if (useRealSounds) {
      playAnimalSound(target);
    } else if (speak) {
      speakInstruction(target);
    }
    // eslint-disable-next-line
  }, [index, target]);

  // sound resolution
  function getSoundUrl(animal) {
    const slug = toSlug(animal.name);
    return SOUNDS[`/src/assets/audios/animals/${slug}.mp3`];
  }
  function playAnimalSound(animal) {
    if (!soundOn || !audioUnlocked) return;
    const url = getSoundUrl(animal);
    if (!url) {
      if (speak) speakInstruction(animal);
      return;
    }
    const audio = new Audio(url);
    audio.play().catch(() => {});
  }
  function speakInstruction(animal) {
    try {
      const u = new SpeechSynthesisUtterance(`Which one says ${animal.name}? Tap the right animal.`);
      u.lang = "en-US"; // change if you add Sinhala prompts
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(u);
    } catch {}
  }

  function getImageUrl(animal) {
    const slug = toSlug(animal.name);
    return (
      IMAGES[`/src/assets/animals/${slug}.png`] ||
      IMAGES[`/src/assets/animals/${slug}.webp`] ||
      IMAGES[`/src/assets/animals/${slug}.svg`] ||
      IMAGES[`/src/assets/animals/${slug}.jpg`] ||
      IMAGES[`/src/assets/animals/${slug}.jpeg`]
    );
  }

  function handlePick(val, i) {
    if (lock) return;
    setLock(true);
    setSelectedIdx(i);

    if (val.name === target.name) {
      setMessage("✅ Correct!");
      setScore(s => s + 1);
      triggerConfetti();
      play(yayRef);
      setTimeout(() => {
        const next = index + 1;
        if (next >= pool.length) {
          setMessage("🎉 Safari complete!");
        } else {
          setIndex(next);
        }
      }, 750);
    } else {
      setMessage("❌ Try again!");
      play(tryRef);
      setTimeout(() => {
        setSelectedIdx(-1);
        setLock(false);
      }, 450);
    }
  }

  function replaySound() {
    if (useRealSounds) playAnimalSound(target);
    else if (speak) speakInstruction(target);
  }

  function resetAll() {
    setIndex(0);
    setScore(0);
    setMessage("");
    setSelectedIdx(-1);
    setLock(false);
  }

  const finished = index >= pool.length;

  return (
    <main className="asp-wrap" onPointerDownCapture={unlockAudio}>
      <audio ref={yayRef} src={yaySfx} preload="auto" playsInline />
      <audio ref={tryRef} src={trySfx} preload="auto" playsInline />

      <header className="asp-header">
       <button className="nursery-bp-back" onClick={() => window.history.back()}>
        ← Back
      </button>
        <h2 className="asp-instruction">
          Listen and <strong>tap the animal</strong> that matches the sound!
        </h2>
        <div className="asp-controls">
          <button className="asp-btn ghost" onClick={replaySound}>🔊 Play Sound</button>
          <button className="asp-btn ghost" onClick={() => setSoundOn(s => !s)}>
            {soundOn ? "🔊 Sound On" : "🔇 Sound Off"}
          </button>
        </div>
        <div className="asp-progress" aria-label="Progress">
          <div className="asp-progress-inner" style={{ width: `${progress}%` }} />
        </div>
        <div className="asp-meta">{index}/{pool.length} • Score: {score}</div>
      </header>

      {/* Big target card (text cue) */}
      <section className="asp-target">
        <div className="asp-card">
          <div className="asp-card-title">Who makes this sound?</div>
          <div className="asp-card-target">“{target?.name}”</div>
        </div>
      </section>

      {/* Floating bubbles with animals */}
      <section className="asp-stage" aria-live="polite">
        {choices.map((a, i) => {
          const url = useRealImages ? getImageUrl(a) : null;
          const isRight = selectedIdx === i && a.name === target.name;
          const isWrong = selectedIdx === i && a.name !== target.name;
          return (
            <button
              key={a.name + "-" + i}
              className={`asp-bubble ${isRight ? "right" : ""} ${isWrong ? "wrong" : ""}`}
              onClick={() => handlePick(a, i)}
              aria-label={`Choice ${i + 1}: ${a.name}`}
            >
              <div className="asp-bubble-inner">
                {url ? (
                  <img className="asp-animal-img" src={url} alt={a.name} draggable="false" />
                ) : (
                  <span className="asp-animal-emoji" aria-hidden>{a.emoji}</span>
                )}
              </div>
              <div className="asp-label">{a.name}</div>
            </button>
          );
        })}
      </section>

      <p className="asp-message">{message}</p>

      <div className="asp-actions">
        {finished ? (
          <button className="asp-btn primary" onClick={resetAll}>Play again</button>
        ) : (
          <button className="asp-btn" onClick={replaySound}>🔁 Hear Again</button>
        )}
      </div>
    </main>
  );
}
