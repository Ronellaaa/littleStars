import { useState, useRef } from "react";
import "../../../styles/virtualNurseyStyles/VegetablesActivity.css";
import confetti from "canvas-confetti";
import yaySfx from "../../../assets/audios/yay.mp3";
import trySfx from "../../../assets/audios/keeptrying.mp3";

const ALL_VEGETABLES = [
  { name: "carrot", emoji: "🥕" },
  { name: "broccoli", emoji: "🥦" },
  { name: "onion", emoji: "🧅" },
  { name: "potato", emoji: "🥔" },
  { name: "eggplant", emoji: "🍆" },
  { name: "corn", emoji: "🌽" },
  { name: "pepper", emoji: "🫑" },   // bell pepper
  { name: "tomato", emoji: "🍅" },   // (yes, botanically fruit—but commonly taught as veg)
];

const CONFETTI_DEFAULTS = {
  spread: 360, ticks: 60, gravity: 0.35, decay: 0.92, startVelocity: 28,
  colors: ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C", "#FDFFB8"], shapes: ["circle"]
};
function triggerBurst() {
  const shoot = (count, scalar, originY) =>
    confetti({ ...CONFETTI_DEFAULTS, particleCount: count, scalar, origin: { y: originY }});
  shoot(60, 1.0, 0.35);
  setTimeout(() => shoot(40, 0.9, 0.32), 100);
  setTimeout(() => shoot(30, 0.8, 0.30), 200);
}
function shuffle(a) {
  const arr = [...a];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export default function VegetablesActivity() {
  const [target, setTarget] = useState(
    ALL_VEGETABLES[Math.floor(Math.random() * ALL_VEGETABLES.length)]
  );
  const [items, setItems] = useState(
    shuffle([
      ...Array(3).fill(target),
      ...shuffle(ALL_VEGETABLES.filter((v) => v.name !== target.name)).slice(0, 5),
    ]).map((v, i) => ({ ...v, id: i }))
  );

  const [basket, setBasket] = useState([]);
  const [message, setMessage] = useState("");
  const [disabled, setDisabled] = useState([]);

  const yayRef = useRef(null);
  const tryRef = useRef(null);
  const [soundOn, setSoundOn] = useState(true);

  const playSound = (ref) => {
    if (!soundOn || !ref?.current) return;
    try {
      const a = ref.current;
      a.pause();
      a.currentTime = 0;
      a.play().catch(() => {});
    } catch {}
  };

  function onDragStart(e, veg) {
    if (disabled.includes(veg.id)) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("vegId", String(veg.id));
  }

  function onDrop(e) {
    e.preventDefault();
    const id = parseInt(e.dataTransfer.getData("vegId"), 10);
    const veg = items.find((v) => v.id === id);
    if (!veg) return;

    if (veg.name === target.name) {
      if (!basket.includes(veg.id)) {
        setBasket((b) => [...b, veg.id]);
        setMessage("✅ Great job!");
        playSound(yayRef);
      }
      if (basket.length + 1 >= 3) {
        setMessage("🎉 All vegetables matched!");
        playSound(yayRef);
        triggerBurst();
      }
    } else {
      setMessage("❌ Not this vegetable!");
      playSound(tryRef);
      setDisabled((prev) => [...prev, veg.id]);
      const el = document.getElementById(`veg-${veg.id}`);
      if (el) {
        el.classList.add("shake");
        setTimeout(() => {
          el.classList.remove("shake");
          setDisabled((prev) => prev.filter((d) => d !== veg.id));
        }, 600);
      }
    }
  }

  function onDragOver(e) {
    e.preventDefault();
  }

  function resetGame() {
    const nextTarget = ALL_VEGETABLES[Math.floor(Math.random() * ALL_VEGETABLES.length)];
    setTarget(nextTarget);
    setItems(
      shuffle([
        ...Array(3).fill(nextTarget),
        ...shuffle(ALL_VEGETABLES.filter((v) => v.name !== nextTarget.name)).slice(0, 5),
      ]).map((v, i) => ({ ...v, id: i }))
    );
    setBasket([]);
    setMessage("");
    setDisabled([]);
  }

  return (
    <main className="veg-wrap">
      <audio ref={yayRef} src={yaySfx} preload="auto" playsInline />
      <audio ref={tryRef} src={trySfx} preload="auto" playsInline />

      <button className="nursery-bp-back" onClick={() => window.history.back()} aria-label="Go back">
        ← Back
      </button>

      <header className="veg-header">
        <h2>
          Drag and drop <strong>all {target.name}s</strong> into the basket!
        </h2>
      </header>

      <section className="veg-target">
        <p>Find this vegetable:</p>
        <div className="veg-display">{target.emoji}</div>
      </section>

      <section className="veg-grid">
        {items.map((v) => (
          <div
            key={v.id}
            id={`veg-${v.id}`}
            className={`veg-card ${
              basket.includes(v.id)
                ? "used"
                : disabled.includes(v.id)
                ? "disabled"
                : ""
            }`}
            draggable={!basket.includes(v.id)}
            onDragStart={(e) => onDragStart(e, v)}
            onClick={() =>
              // click = alternative input path
              onDrop({
                preventDefault: () => {},
                dataTransfer: { getData: () => String(v.id) },
              })
            }
          >
            <span className="veg-emoji">{v.emoji}</span>
            <span className="veg-name">{v.name}</span>
          </div>
        ))}
      </section>

      <section className="veg-basket" onDrop={onDrop} onDragOver={onDragOver}>
        <div className="veg-basket-inner">
          {basket.map((id) => {
            const veg = items.find((v) => v.id === id);
            return (
              <div key={id} className="veg-inbasket">
                {veg?.emoji}
              </div>
            );
          })}
        </div>
      </section>

      <p className="veg-message">{message}</p>

      <div className="veg-actions">
        <button className="veg-btn" onClick={() => setSoundOn((s) => !s)}>
          {soundOn ? "🔊 Sound On" : "🔇 Sound Off"}
        </button>
        <button className="veg-btn primary" onClick={resetGame}>
          New Vegetable
        </button>
      </div>
    </main>
  );
}
