import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "../styles/bug-tower.css";
import bgEmotion from "../assets/bg4.png";
import bgSpeech  from "../assets/c4.png";
import bgRoutine from "../assets/bg6.png";
import bgGames   from "../assets/bg7.png";
import bgNursery from "../assets/bg2.png";

import chEmotion from "../assets/em2.png";  // transparent PNG
import chSpeech  from "../assets/em3.png";
import chRoutine from "../assets/em4.png";
import chGames   from "../assets/em5.png";
import chNursery from "../assets/em7.png";

const FEATURES = [
  { id:"emotion",  label:"Emotion Simulator",  to:"/lesson",  bg:bgEmotion,  char:chEmotion,  icon:"😊" },
  { id:"speech",   label:"Speech Therapy Tool",to:"/speech-home",  bg:bgSpeech,   char:chSpeech,   icon:"🗣️" },
  { id:"routine",  label:"Routine Builder",    to:"/routine", bg:bgRoutine,  char:chRoutine,  icon:"📅" },
  { id:"games",    label:"Interactive Games",  to:"/games",   bg:bgGames,    char:chGames,    icon:"🎮" },
  { id:"nursery",  label:"Virtual Nursery",    to:"/virtualNursery", bg:bgNursery,  char:chNursery,  icon:"🌼" },
];

export default function BugTower({ routeOnClick = true }) {
const [active, setActive] = useState(null);
  const nav = useNavigate();
  const go = (f) => { setActive(f.id); if (routeOnClick) nav(f.to); };

  return (
    <section className="ft-wrap">
    <div className="fs2-overlay" />  
      <div className="ft-scene">
        <div className="ft-cloud c1" /><div className="ft-cloud c2" /><div className="ft-grass" />
      </div>

      <div className="ft-tower">
      
        <div className="ft-roof" />
        <div className="ft-balcony left" />
        <div className="ft-balcony right" />
        <div className="ft-bricks" aria-hidden="true" />

        <div className="ft-grid">
          {FEATURES.map((f, i) => (
            <button
              key={f.id}
              className={`ft-window ${i === FEATURES.length - 1 ? "big" : ""} ${active === f.id ? "active" : ""}`}
              onMouseEnter={() => setActive(f.id)}
              onMouseLeave={() => setActive(null)}
              onFocus={() => setActive(f.id)}
              onBlur={() => setActive(null)}
              onClick={() => go(f)}
              aria-label={f.label}
            >
              {/* Arch with BACKGROUND + CHAR layers */}
              <div className="ft-arch">
                <div className="ft-bg" style={{ backgroundImage: `url(${f.bg})` }} />
                {f.char && <img className="ft-char" src={f.char} alt="" />}
              </div>

              <div className="ft-badge"><span>{f.icon}</span></div>
              <span className="ft-tag">{f.label}</span>
              
            </button>
          ))}
      
        </div>
    
      </div>
    </section>
  );
}