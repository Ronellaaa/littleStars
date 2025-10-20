import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import "../../styles/emotionSimulatorStyles/lesson.css";

import frogDJ from "../../assets/foggy.png";
import f3 from "../../assets/bear.png";
import f4 from "../../assets/gr.png";
import f5 from "../../assets/gr2.png";
import f6 from "../../assets/astr.png";
import f7 from "../../assets/gr1.png";

import { LESSONS } from "../emotionSimulator/data/lessonPacks";

function useTTS({ muted } = {}) {
  const utterRef = useRef(null);
  const speak = (text) => {
    if (muted || !window.speechSynthesis || !text) return;
    try { window.speechSynthesis.cancel(); } catch {}
    const u = new SpeechSynthesisUtterance(text);
    const pickVoice = () => {
      const vs = window.speechSynthesis.getVoices();
      const v =
        vs.find(v => /child|kids|google uk english female/i.test(v.name)) ||
        vs.find(v => v.lang?.startsWith("en")) || vs[0];
      if (v) u.voice = v;
    };
    pickVoice();
    if (!u.voice) {
      window.speechSynthesis.onvoiceschanged = () => {
        pickVoice();
        window.speechSynthesis.speak(u);
      };
    } else {
      window.speechSynthesis.speak(u);
    }
    utterRef.current = u;
  };
  const stop = () => { try { window.speechSynthesis?.cancel(); } catch {} };
  useEffect(() => () => stop(), []);
  return { speak, stop };
}



const FALLBACK_CARDS = [
  {
    id: 1,
    color: "#78D66E",
    title: "Musician Max",
    emoji: "🎸",
    type: "talk",
    image: frogDJ,
    bgWord: "SUMMER\nISLAND",
    bgWordSize: 58,
    text: "Hi there! I’m Max. Happiness is the warm, bright feeling you get when life plays your favorite song.",
  },
  {
    id: 2,
    color: "#F7A6C9",
    emoji: "🌞",
    title: "Sunny Sam",
    image: f5,
    bgWord: "SUMMER\nISLAND",
    bgWordSize: 58,
    type: "talk",
    text: "Smiles are like sunshine! When you share one, you light up somebody’s day, and yours too.",
  },
  {
    id: 3,
    color: "#69BFF7",
    title: "Astronaut Ava",
    emoji: "👩‍🚀",
    image: f4,
    bgWord: "SUMMER\nISLAND",
    bgWordSize: 58,
    type: "quiz",
    text: "Which picture shows a happy choice?",
    options: [
      { id: "a", label: "Helping a friend", emoji: "🧩", correct: true },
      { id: "b", label: "Breaking a toy", emoji: "💥", correct: false },
      { id: "c", label: "Arguing", emoji: "😡", correct: false },
      { id: "d", label: "Ignoring someone", emoji: "🙈", correct: false },
    ],
    correctFeedback: "Yes! Helping feels good for both people. That’s happy fuel!",
    wrongFeedback: "Hmm… that one doesn’t spread happy. Try again!",
  },
  {
    id: 4,
    color: "#F7D156",
    title: "Hero Halo",
    emoji: "🦸‍♂️",
    image: f3,
    bgWord: "SUMMER\nISLAND",
    bgWordSize: 58,
    type: "talk",
    text: "When I’m happy my body wants to move! Stretch, wiggle, or do a tiny dance with me!",
    confetti: true,
  },
  {
    id: 5,
    color: "#5CD3C5",
    title: "Artie",
    emoji: "🎨",
    image: f6,
    bgWord: "SUMMER\nISLAND",
    bgWordSize: 58,
    type: "prompt",
    text: "Your turn! What makes you feel happy? Type a thing, a person, or a moment.",
    placeholder: "e.g., drawing, playing tag, grandma’s hugs...",
  },
  {
    id: 6,
    color: "#F7B35C",
    title: "Coach Coco",
    emoji: "🌟",
    image: f7,
    bgWord: "SUMMER\nISLAND",
    bgWordSize: 58,
    type: "talk",
    text: "Amazing! You learned that happiness grows when we help, move, and notice good moments.",
  },
];

/* -----------------------------
   Modal
----------------------------- */
function CardModal({
  card,
  onClose,
  onPrev,
  onNext,
  onComplete,
  muted,
  setMuted,
  savedAnswer,
  setSavedAnswer,
}) {
  const { speak, stop } = useTTS({ muted });
  const [message, setMessage] = useState(card.text);
  const [answered, setAnswered] = useState(false);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    setMessage(card.text);
    setAnswered(false);
    setSelected(null);
  }, [card]);

  useEffect(() => {
    speak(message);
    return () => stop();
  }, [message, speak, stop]);

  const handlePick = (opt) => {
    setSelected(opt.id);
    if (opt.correct) {
      setMessage(card.correctFeedback);
      setAnswered(true);
      onComplete?.(card.id, true);
    } else {
      setMessage(card.wrongFeedback);
      setAnswered(false);
    }
  };

  const canNext =
    card.type === "quiz" ? answered :
    card.type === "prompt" ? !!savedAnswer?.trim() :
    true;

  return (
    <div className="hl-modal">
      <div className="hl-modal__card" style={{ "--theme": card.color }}>
        <header className="hl-modal__head">
          <div className="hl-badge">{String(card.id).padStart(2, "0")}</div>
          <div className="hl-title">
            <span className="hl-avatar1">{card.emoji}</span>
            <strong>{card.title}</strong>
          </div>
          <button className="hl-x" onClick={onClose} aria-label="Close">×</button>
        </header>

        <div className="hl-stage">
          <div className={`hl-character ${card.image ? "has-img" : ""}`}>
            {card.bgWord && (
              <span
                className="hl-bgword hl-bgword--lg"
                style={{ "--bgword-size": `${(card.bgWordSize || 56) + 20}px` }}
              >
                {card.bgWord}
              </span>
            )}
            {card.image
              ? <img className="hl-character__img" src={card.image} alt={card.title} />
              : <span className="hl-character__emoji">{card.emoji}</span>}
          </div>

          <div className={`hl-bubble ${card.confetti ? "confetti" : ""}`}>
            <p>{message}</p>
            <div className="hl-bubble__tail" />
          </div>
        </div>

        {card.type === "quiz" && (
          <div className="hl-quiz">
            {card.options.map((opt) => (
              <button
                key={opt.id}
                className={`hl-quiz__opt ${selected === opt.id ? "is-picked" : ""}`}
                onClick={() => handlePick(opt)}
              >
                <span className="opt-emoji">{opt.emoji}</span>
                <span className="opt-label">{opt.label}</span>
              </button>
            ))}
          </div>
        )}

        {card.type === "prompt" && (
          <div className="hl-prompt">
            <input
              value={savedAnswer}
              onChange={(e) => setSavedAnswer(e.target.value)}
              placeholder={card.placeholder}
            />
            <small className="hl-note">We’ll save it just for this browser.</small>
          </div>
        )}

        <footer className="hl-controls">
          <div className="hl-left">
            <button className="hl-ghost" onClick={onPrev}>← Previous</button>
            <button className="hl-ghost" onClick={() => setMuted(m => !m)}>
              {muted ? "🔇 Unmute" : "🔊 Mute"}
            </button>
          </div>
          <div className="hl-right">
            <button className="hl-skip" onClick={onClose}>Skip</button>
            <button className="hl-next" disabled={!canNext} onClick={onNext}>
              {card.id === 6 ? "Finish" : "Next →"}
            </button>
          </div>
        </footer>
      </div>
    </div>
  );
}

function InteractiveLesson({ pack, emotion}) {
  const CARDS = pack?.cards ?? FALLBACK_CARDS;
  const title = pack?.title ?? "Happiness Lab";

  const [active, setActive] = useState(null);
  const [muted, setMuted] = useState(false);
  const [answers, setAnswers] = useState(() => ({
    happyThing: localStorage.getItem("happyThing") || "",
  }));
  const [completed, setCompleted] = useState({});
  const navigate = useNavigate();

  const openCard = (id) => setActive(id);
  const closeCard = () => setActive(null);

  const currentIndex = useMemo(
    () => (active ? CARDS.findIndex((c) => c.id === active) : -1),
    [active, CARDS]
  );

  const gotoPrev = () => {
    if (currentIndex > 0) setActive(CARDS[currentIndex - 1].id);
  };
  const gotoNext = () => {
    if (currentIndex < CARDS.length - 1) setActive(CARDS[currentIndex + 1].id);
    else navigate(`/lesson/${emotion}/activity`);
  };

  const onComplete = (id, ok) =>
    setCompleted((m) => ({ ...m, [id]: !!ok }));

  useEffect(() => {
    localStorage.setItem("happyThing", answers.happyThing || "");
  }, [answers.happyThing]);

  // Apply theme color if provided
  useEffect(() => {
    if (pack?.theme) {
      document.documentElement.style.setProperty("--lesson-theme", pack.theme);
      return () =>
        document.documentElement.style.removeProperty("--lesson-theme");
    }
  }, [pack?.theme]);
const [i, setI] = useState(0);

 const next = () => {
    if (i < pack.introLines.length - 1) setI(i + 1);
    else navigate(`/lesson/${emotion}/activity`);
  };
  return (
    <div className="hl-wrap">
      <h1 className="hl-h1">{title}</h1>
      <p className="hl-sub">Tap a window! Some friends will talk, some have a tiny game.</p>

      <div className="hl-grid">
        {CARDS.map((card) => (
          <button
            key={card.id}
            className={`hl-cell ${completed[card.id] ? "is-done" : ""}`}
            style={{ "--theme": card.color }}
            onClick={() => openCard(card.id)}
          >
            <div className="hl-frame">
              <div className="hl-toolbar">
                <span className="dot red" />
                <span className="dot yellow" />
                <span className="dot green" />
                <span className="hl-num">{String(card.id).padStart(2, "0")}</span>
              </div>
              <div className="hl-card-body">
                <div className={`hl-avatar ${card.image ? "has-img" : ""}`}>
                  {card.bgWord && (
                    <span
                      className="hl-bgword"
                      style={{ "--bgword-size": `${card.bgWordSize || 56}px` }}
                    >
                      {card.bgWord}
                    </span>
                  )}
                  {card.image
                    ? <img className="hl-avatar__img" src={card.image} alt={card.title} />
                    : <span className="hl-avatar__emoji">{card.emoji}</span>}
                </div>
                <div className="hl-caption">{card.title}</div>
              </div>
              {completed[card.id] && <div className="hl-check">✓</div>}
            </div>
          </button>
        ))}
      </div>

      {active && (
        <CardModal
          card={CARDS[currentIndex]}
          onClose={closeCard}
          onPrev={gotoPrev}
          onNext={gotoNext}
          onComplete={onComplete}
          muted={muted}
          setMuted={setMuted}
          savedAnswer={answers.happyThing}
          setSavedAnswer={(v) => setAnswers((a) => ({ ...a, happyThing: v }))}
        />
      )}


{!active && (
       <div className="hl-bottom-cta">
         <button
           className="hl-bottom-back"
           type="button"
           onClick={() => navigate(-1)}
         >
           ← Back
         </button>
         <button
           className="hl-bottom-next"
           type="button"
           onClick={() => navigate(`/lesson/${emotion}/activity`)}
         >
          Next → 
         </button>
       </div>
   )}

    </div>
  );
}

export default function HappyLesson() {
  const { emotion = "happy" } = useParams();
  const pack = LESSONS?.[emotion] || { title: "Happiness Lab", cards: FALLBACK_CARDS };
 return <InteractiveLesson pack={pack} emotion={emotion} />;;
}
