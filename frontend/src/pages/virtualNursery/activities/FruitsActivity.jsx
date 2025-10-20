import { useState,useRef } from "react";
import "../../../styles/virtualNurseyStyles/FruitsActivity.css";
import confetti from "canvas-confetti";
import yaySfx from "../../../assets/audios/yay.mp3";
import trySfx from "../../../assets/audios/keeptrying.mp3";


const ALL_FRUITS = [
  { name: "apple", emoji: "🍎" },
  { name: "banana", emoji: "🍌" },
  { name: "orange", emoji: "🍊" },
  { name: "mango", emoji: "🥭" },
  { name: "strawberry", emoji: "🍓" },
  { name: "grape", emoji: "🍇" },
  { name: "watermelon", emoji: "🍉" },
  { name: "pineapple", emoji: "🍍" },
];
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


function shuffle(arr) {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}



export default function FruitsActivity() {
  const [target, setTarget] = useState(
    ALL_FRUITS[Math.floor(Math.random() * ALL_FRUITS.length)]
  );
  const [items, setItems] = useState(
    shuffle([
      ...Array(3).fill(target),
      ...shuffle(ALL_FRUITS.filter((f) => f.name !== target.name)).slice(0, 5),
    ]).map((f, i) => ({ ...f, id: i }))
  );
  const [basket, setBasket] = useState([]);
  const [message, setMessage] = useState("");
  const [disabled, setDisabled] = useState([]);

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

  function onDragStart(e, fruit) {
    if (disabled.includes(fruit.id)) {
      e.preventDefault();
      return;
    }
    e.dataTransfer.setData("fruitId", fruit.id);
  }

  function onDrop(e) {
    e.preventDefault();
    const id = parseInt(e.dataTransfer.getData("fruitId"));
    const fruit = items.find((f) => f.id === id);
    if (!fruit) return;
    if (fruit.name === target.name) {
      if (!basket.includes(fruit.id)) {
        setBasket([...basket, fruit.id]);
        setMessage("✅ Great job!");
      playSound(yayRef);
       
      }
      if (basket.length + 1 >= 3) {
        setMessage("🎉 All fruits matched!");
        playSound(yayRef);
         triggerStars();
      }
    } else {
      setMessage("❌ Not this fruit!");
      playSound(tryRef);
      setDisabled((prev) => [...prev, fruit.id]);
      const el = document.getElementById(`fruit-${fruit.id}`);
      if (el) {
        el.classList.add("shake");
        setTimeout(() => {
          el.classList.remove("shake");
          setDisabled((prev) => prev.filter((d) => d !== fruit.id));
        }, 600);
      }
    }
  }

  function onDragOver(e) {
    e.preventDefault();
  }

  function resetGame() {
    const newTarget =
      ALL_FRUITS[Math.floor(Math.random() * ALL_FRUITS.length)];
    setTarget(newTarget);
    setItems(
      shuffle([
        ...Array(3).fill(newTarget),
        ...shuffle(ALL_FRUITS.filter((f) => f.name !== newTarget.name)).slice(
          0,
          5
        ),
      ]).map((f, i) => ({ ...f, id: i }))
    );
    setBasket([]);
    setMessage("");
    setDisabled([]);
  }

  return (
    <main className="fruit-wrap">
          <audio ref={yayRef} src={yaySfx} preload="auto" playsInline />
            <audio ref={tryRef} src={trySfx} preload="auto" playsInline /> 
       <button className="nursery-bp-back" onClick={() => window.history.back()} aria-label="Go back">
          ← Back
        </button>
      <header className="fruit-header">
        <h2>
          Drag and drop <strong>all {target.name}s</strong> into the basket!
        </h2>
      </header>

      <section className="fruit-target">
        <p>Find this fruit:</p>
        <div className="fruit-display">{target.emoji}</div>
      </section>

      <section className="fruit-grid">
        {items.map((f) => (
          <div
            key={f.id}
            id={`fruit-${f.id}`}
            className={`fruit-card ${
              basket.includes(f.id)
                ? "used"
                : disabled.includes(f.id)
                ? "disabled"
                : ""
            }`}
            draggable={!basket.includes(f.id)}
            onDragStart={(e) => onDragStart(e, f)}
            onClick={() => onDrop({ preventDefault: () => {}, dataTransfer: { getData: () => f.id }})}
          >
            <span className="fruit-emoji">{f.emoji}</span>
            <span className="fruit-name">{f.name}</span>
          </div>
        ))}
      </section>

      <section
        className="fruit-basket"
        onDrop={onDrop}
        onDragOver={onDragOver}
      >
        <div className="fruit-basket-inner">
          {basket.map((id) => {
            const fruit = items.find((f) => f.id === id);
            return (
              <div key={id} className="fruit-inbasket">
                {fruit?.emoji}
              </div>
            );
          })}
        </div>
      </section>

      <p className="fruit-message">{message}</p>
      <button className="fruit-btn" onClick={resetGame}>
        New Fruit
      </button>
    </main>
  );
}
