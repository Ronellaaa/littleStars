import { useParams, useNavigate } from "react-router-dom";
import { use, useEffect, useState } from "react";
import { PACKS } from "../emotionSimulator/data/packs";
import "../../styles/emotionSimulatorStyles/lesson-split.css";

export default function EmotionIntro() {
  const { emotion = "happy" } = useParams();
  const pack = PACKS[emotion] || PACKS.happy;
  const [i, setI] = useState(0);
  const navigate = useNavigate();

  // optional: speak the line
  useEffect(() => {
    const u = new SpeechSynthesisUtterance(pack.introLines[i]);
    try { window.speechSynthesis.cancel(); window.speechSynthesis.speak(u); } catch {}
    return () => { try { window.speechSynthesis.cancel(); } catch {} };
  }, [i, pack]);

  const next = () => {
    if (i < pack.introLines.length - 1) setI(i + 1);
    else navigate(`/lesson/${emotion}/activity`);
  };

  return (
    <div className="split-wrap" style={{ "--theme": pack.theme }}>
      <div className="split card">
        <h1 className="title">{pack.title}</h1>
        <div className="bubble">
          <p>{pack.introLines[i]}</p>
          <span className="tail" />
        </div>
        <div className="row">
          <button className="btn ghost" onClick={() => navigate(-1)}>Back</button>
          <button className="btn" onClick={next}>
            {i < pack.introLines.length - 1 ? "Next" : "Start Activity →"}
          </button>
        </div>
      </div>
    </div>
  );
}