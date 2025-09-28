import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/feature-select.css";
import forest from "../assets/play.png";

const FEATURES = [
  { id: "emotion", title: "Emotion Simulator", to: "/lesson",  icon: "😊", color: "#eaf4ff" },
  { id: "speech",  title: "Speech Therapy",    to: "/speech",  icon: "🗣️", color: "#fff2e6" },
  { id: "routine", title: "Routine Builder",   to: "/routine", icon: "📅", color: "#eafbef" },
  { id: "games",   title: "Interactive Games", to: "/games",   icon: "🎮", color: "#f3eaff" },
  { id: "nursery", title: "Virtual Nursery",   to: "/nursery", icon: "🌼", color: "#fff7e6" },
];

export default function FeatureSelectGame({ bgImage = forest })  {
  const nav = useNavigate();
  const [activeId, setActiveId] = useState(FEATURES[0].id);
 const active = FEATURES.find(f => f.id === activeId) || FEATURES[0];

  // Build a 12-slot grid; first 5 are features, rest are empty frames
  const slots = Array.from({ length: 12 }, (_, i) => FEATURES[i] || null);

  return (
    <section className="fs2-wrap">
   
    <div className="fs2-bg" style={{ backgroundImage: `url(${bgImage})` }} />
  <div className="fs2-overlay" />  
      <div className="fs2-inner">
        
        <div className="fs2-left">
          <div className="fs2-stage">
            <div className="fs2-aura" />
            <div className="fs2-circle" style={{ background: active.color }}>
              <div className="fs2-emoji">{active.icon}</div>
            </div>
          </div>
        </div>

        {/* RIGHT: grid of tiles */}
        <div className="fs2-right">
          <div className="fs2-grid">
            {slots.map((item, i) =>
              item ? (
                <button
                  key={item.id}
                  className={`fs2-tile ${activeId === item.id ? "active" : ""}`}
                  onClick={() => setActiveId(item.id)}
                  title={item.title}
                >
                  <div className="fs2-thumb" style={{ background: item.color }}>
                    <span>{item.icon}</span>
                  </div>
                </button>
              ) : (
                <div key={`empty-${i}`} className="fs2-tile empty" />
              )
            )}
          </div>

          <div className="fs2-actions">
            <button className="fs2-select" onClick={() => nav(active.to)}>SELECT</button>
          </div>
        </div>
      </div>
    </section>
  );
}