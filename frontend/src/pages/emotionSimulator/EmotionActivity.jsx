import { useMemo, useRef, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PACKS } from "../emotionSimulator/data/packs";
import "../../styles/emotionSimulatorStyles/lesson-split.css";
import confetti from "canvas-confetti";

export default function EmotionActivity() {
  const { emotion = "happy" } = useParams();
  const pack = PACKS[emotion] || PACKS.happy;
  const navigate = useNavigate();
  console.log("PACKS", PACKS);
  console.log("emotion", emotion);
  console.log("pack", pack);
  const [monsterMode, setMonsterMode] = useState("idle");

  // game state
  const [dropped, setDropped] = useState([]); // array of ids
  const correctIds = useMemo(
    () => pack.items.filter((i) => i.correct).map((i) => i.id),
    [pack]
  );
  const done = correctIds.every((id) => dropped.includes(id));
  const [hasCelebrated, setHasCelebrated] = useState(false);

  useEffect(() => {
    if (done && !hasCelebrated) {
      setHasCelebrated(true);
      fireSideCannons(3000); // 🎉 left + right cannons for 3s
    }
  }, [done, hasCelebrated]);

  const [feeling, setFeeling] = useState(null);

  // modal + confetti
  const [showSurprise, setShowSurprise] = useState(false);
  const confettiRef = useRef(null);

  const onDragStart = (e, id) => {
    e.dataTransfer.setData("text/plain", id);
    setMonsterMode("wave");
    setTimeout(() => setMonsterMode("idle"), 1200);
  };

  const onDrop = (e) => {
    e.preventDefault();
    const id = e.dataTransfer.getData("text/plain");
    const card = pack.items.find((x) => x.id === id);
    if (!card) return;

    if (card.correct && !dropped.includes(id)) {
      setDropped([...dropped, id]);
      setMonsterMode("yay");
      setTimeout(() => setMonsterMode("idle"), 900); // quick bounce
    }
  };

  const fireSideCannons = (durationMs = 3000) => {
    const end = Date.now() + durationMs;
    const colors = ["#4000f2ff", "#f6006aff", "#f34602ff", "#faa006ff"];

    (function frame() {
      // left cannon
      confetti({
        zIndex: 60, // sits above your page but below OS UI
        particleCount: 3,
        angle: 60,
        spread: 60,
        startVelocity: 60,
        origin: { x: 0, y: 0.55 }, // left side mid-height
        colors,
      });
      // right cannon
      confetti({
        zIndex: 60,
        particleCount: 3,
        angle: 120,
        spread: 60,
        startVelocity: 60,
        origin: { x: 1, y: 0.55 }, // right side mid-height
        colors,
      });

      if (Date.now() < end) requestAnimationFrame(frame);
    })();
  };

  const stars = (durationMs = 3000) => {
    const defaults = {
      spread: 360,
      ticks: 50,
      gravity: 0,
      decay: 0.94,
      startVelocity: 30,
      colors: ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C", "#FDFFB8"],
    };

    const shoot = () => {
      confetti({
        ...defaults,
        particleCount: 40,
        scalar: 1.2,
        shapes: ["star"],
      });

      confetti({
        ...defaults,
        particleCount: 10,
        scalar: 0.75,
        shapes: ["circle"],
      });
    };

    setTimeout(shoot, 0);
    setTimeout(shoot, 300);
    setTimeout(shoot, 200);
  };

  const openSurprise = () => {
    setShowSurprise(true); // open the video modal now
    stars(8000);
    fireSideCannons(3000);
    // confetti runs for ~3s
  };

  const hooray = () => {
    setShowSurprise(true);
    fireSideCannons(3000);
  };

  return (
    <div className="split-wrap" style={{ "--theme": pack.theme }}>
      {/* LEFT */}
      <section
        className="split left card  side-bg"
        style={
          pack.bgLeft ? { "--side-url": `url(${pack.bgLeft})` } : undefined
        }
      >
        <h2 className="eyebrow">EMOTION SIMULATOR</h2>
        
        <h1 className="title" style={{ "--theme": pack.theme}} >{pack.title}</h1>

        <div className="videoCard">
          <div className="videoThumb">
            <video src={pack.video} controls playsInline></video>
          </div>
          <p className="caption">Watch this short video!</p>
        </div>

        <h3 className="question">{pack.askText}</h3>
        <div className="feelings">
          {pack.feelings.map((f) => (
            <button
              key={f}
              className={"chip" + (feeling === f ? " is-on" : "")}
              onClick={() => setFeeling(f)}
            >
              {faceEmoji(f)} <span>{f}</span>
            </button>
          ))}
        </div>

        <div className="row">
          <button
            className="btn ghost"
            onClick={() => navigate(`/lesson/${emotion}`)}
          >
            ← Intro
          </button>
          <button
            className="btn"
            onClick={() => navigate(`/lesson/${emotion}/content`)}
          >
            Done
          </button>
        </div>
      </section>

      <section
        className="split right card game  side-bg"
        style={
          pack.bgRight ? { "--side-url": `url(${pack.bgRight})` } : undefined
        }
      >
        <MonsterBuddy mode={monsterMode} />
        <h3 className="question">Drag good choices into the basket</h3>

        {/* CARDS GRID */}
        <div className="cards">
          {pack.items.map((item) => (
            <div
              key={item.id}
              className={
                "draggable" + (dropped.includes(item.id) ? " is-hidden" : "")
              }
              draggable
              onDragStart={(e) => onDragStart(e, item.id)}
              title={item.label}
            >
              <div className="thumb">
                {item.image ? (
                  <img src={item.image} alt={item.label} />
                ) : (
                  <span className="emoji">{item.emoji}</span>
                )}
              </div>
              <div className="label">{item.label}</div>
            </div>
          ))}
        </div>

        {/* BASKET */}
        <div
          className="basket"
          onDragOver={(e) => e.preventDefault()}
          onDrop={onDrop}
        >
          <span className="basketLabel">Basket</span>

          <div className="inside">
            {dropped.map((id) => {
              const it = pack.items.find((x) => x.id === id);
              return (
                <div key={id} className="miniCard" title={it.label}>
                  <div className="miniThumb">
                    {it.image ? (
                      <img src={it.image} alt={it.label} />
                    ) : (
                      <span className="emoji">{it.emoji}</span>
                    )}
                  </div>
                  <div className="miniLabel">{short(it.label)}</div>
                </div>
              );
            })}
          </div>
        </div>

        {done && <p className="trophy">{pack.trophyText} </p>}
        {done && (
          <div
            className="row"
            style={{ justifyContent: "center", marginTop: 10 }}
          >
            <button
              className="btn"
              onClick={() => navigate(`/lesson/${emotion}/content`)}
            >
              Next: See {emotion} content →
            </button>
          </div>
        )}
      </section>

      {/* Surprise button */}
      <button className="surpriseBtn" onClick={openSurprise}>
        🎁 Surprise
      </button>
      <div className="confetti" ref={confettiRef} />
      {/* Modal with motivational video */}
      {showSurprise && (
        <div className="modalWrap" onClick={() => setShowSurprise(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <button className="x" onClick={() => setShowSurprise(false)}>
              ×
            </button>
            <video src={pack.motivationalVideo} controls autoPlay playsInline />
            <p className="center">{pack.surpriseLine}</p>
          </div>
        </div>
      )}
    </div>
  );
}

/* helpers */
function short(s) {
  return s.length > 14 ? s.slice(0, 14) + "…" : s;
}
function faceEmoji(label) {
  const L = label.toLowerCase();
  if (L.includes("happy") || L.includes("better") || L.includes("calm"))
    return "😊";
  if (L.includes("sad")) return "☹️";
  if (L.includes("angry")) return "😠";
  return "🙂";
}

/* --- Animated Monster Buddy (float, blink, wave, cheer) --- */
function MonsterBuddy({ mode = "idle" }) {
  // mode: "idle" | "wave" | "yay"
  return (
    <div className={`monster ${mode}`}>
      <div className="monster-body">
        <div className="eye left" />
        <div className="eye right" />
        <div className="mouth" />
      </div>
      <div className="arm left" />
      <div className="arm right" />
      <div className="shadow" />
    </div>
  );
}
