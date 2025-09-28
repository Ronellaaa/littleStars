// src/pages/emotionSimulator/EmotionPracticeBoard.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import * as faceapi from "face-api.js";
import confetti from "canvas-confetti";
import {
  AttemptsAPI,
  ThresholdsAPI,
  ScenariosAPI,
  API_BASE,
  ChildrenAPI,
} from "../../api/http";
import "../../styles/emotionSimulatorStyles/webactivity.css";
import ChildReport from "./ChildReport";

// assets
import rewardPNG from "../../assets/ac1.png";
import parkPNG from "../../assets/ac2.png";
import giftPNG from "../../assets/ac3.png";
import lostPNG from "../../assets/ac2.png";
import blockedPNG from "../../assets/ac4.png";
import partyPNG from "../../assets/ac5.png";

// --- emoji + labels ---
const EMOJI = { happy: "😊", sad: "😢", angry: "😠", surprised: "😮" };

// Fallback scenarios (used if DB has none)
const SCENARIOS_BY_EMOTION = {
  happy: [
    { id: "reward", text: "You’re getting a reward! What face?", img: rewardPNG },
    { id: "park",   text: "We’re going to the park!",             img: parkPNG   },
    { id: "friend", text: "Your friend brought you a gift!",      img: giftPNG   },
  ],
  sad:      [{ id: "lostToy", text: "You lost your toy. What face?", img: lostPNG }],
  angry:    [{ id: "blocked", text: "Someone took your turn. What face?", img: blockedPNG }],
  surprised:[{ id: "party",   text: "A surprise party happened—face?",   img: partyPNG    }],
};

function toImg(src) {
  if (!src) return "";
  if (/^https?:\/\//i.test(src) || src.startsWith("/assets/") || src.startsWith("data:")) return src;
  if (src.startsWith("/uploads/")) return `${API_BASE}${src}`;
  return src;
}

function getMyUserId() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    const token = u?.token;
    if (!token) return null;
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(base64.length + ((4 - (base64.length % 4)) % 4), "=");
    const json = JSON.parse(atob(padded));
    return json?.sub || null;
  } catch {
    return null;
  }
}

// ---- Confetti helper: star + circle bursts for a duration ----
function fireStars(durationMs = 3000) {
  const defaults = {
    spread: 360,
    ticks: 50,
    gravity: 0,
    decay: 0.94,
    startVelocity: 30,
    colors: ["#FFE400", "#FFBD00", "#E89400", "#FFCA6C", "#FDFFB8"],
  };

  const shoot = () => {
    // Many recent versions support shapes:["star"]; if not, it will ignore and use defaults
    confetti({ ...defaults, particleCount: 40, scalar: 1.2, shapes: ["star"] });
    confetti({ ...defaults, particleCount: 10, scalar: 0.75, shapes: ["circle"] });
  };

  const end = Date.now() + durationMs;
  (function frame() {
    shoot();
    if (Date.now() < end) requestAnimationFrame(frame);
  })();
}

export default function EmotionPractice() {
  const { emotion: routeEmotion = "happy" } = useParams(); // e.g. /practice/happy
  const myId = getMyUserId();

  // ---------- scenarios (DB with fallback) ----------
  const [dbScenarios, setDbScenarios] = useState([]);
  useEffect(() => {
    setDbScenarios([]);
    ScenariosAPI.list(routeEmotion).then(setDbScenarios).catch(() => {});
  }, [routeEmotion]);

  const fallback = SCENARIOS_BY_EMOTION[routeEmotion] ?? [];
  const scenarios = dbScenarios.length ? dbScenarios : fallback;
  const [scenarioIdx, setScenarioIdx] = useState(0);
  useEffect(() => setScenarioIdx(0), [routeEmotion, dbScenarios.length]);
  const scenario = scenarios[scenarioIdx] ?? { text: "", imageUrl: "", img: "" };

  // ---------- child resolution (auto create/resolve) ----------
  const [childId, setChildId] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("currentChild") || "null");
      return stored?._id || null;
    } catch { return null; }
  });

  // If stored child's parent != myId, discard so we re-resolve
  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("currentChild") || "null");
      if (!stored || !stored.parentId || stored.parentId !== myId) {
        localStorage.removeItem("currentChild");
        setChildId(null);
      }
    } catch {
      localStorage.removeItem("currentChild");
      setChildId(null);
    }
  }, [myId]);

  useEffect(() => {
    if (childId || !myId) return;
    (async () => {
      try {
        const u = JSON.parse(localStorage.getItem("user") || "{}");
        const suggested = (u?.email || "").split("@")[0] || "My";
        const doc = await ChildrenAPI.default({ name: `${suggested}'s child` });
        if (doc?._id) {
          localStorage.setItem("currentChild", JSON.stringify(doc));
          setChildId(doc._id);
        }
      } catch (e) {
        console.error("ChildrenAPI.default failed:", e);
      }
    })();
  }, [childId, myId]);

  const isObjectId = (s) => typeof s === "string" && /^[a-f0-9]{24}$/i.test(s);

  // ---------- refs ----------
  const videoRef = useRef(null);
  const rafRef = useRef(0);
  const streamRef = useRef(null);
  const holdRef = useRef(0);
  const passedRef = useRef(false);        // NEW: track pass across frames

  // ---------- UI state ----------
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [cameraOn, setCameraOn] = useState(false);
  const [reportTick, setReportTick] = useState(0);

  // difficulty + thresholds (mentor tunable)
  const [difficulty, setDifficulty] = useState("easy");
  const [cfg, setCfg] = useState({ level: 1, threshold: 0.7, holdMs: 900 });
  const [loadingCfg, setLoadingCfg] = useState(false);

  // live numbers
  const [targetProb, setTargetProb] = useState(0);
  const [smoothed, setSmoothed] = useState(0);
  const [aboveForMs, setAboveForMs] = useState(0);
  const [status, setStatus] = useState("Ready");
  const [stars, setStars] = useState(0);
  const [celebrate, setCelebrate] = useState(false);
  const [feedback, setFeedback] = useState("");  // NEW: guidance text

  // --- tuneables ---
  const ALPHA = 0.5;
  const INSTANT_PASS = 0.92;
  const MARGIN = 0.15;
  const WARMUP_MS = 500;

  // defaults if there is no mentor override
  const DEFAULTS = {
    easy:   { threshold: 0.65, holdMs: 800  },
    medium: { threshold: 0.75, holdMs: 1000 },
    hard:   { threshold: 0.82, holdMs: 1200 },
  };

  // ---------- model load once ----------
  useEffect(() => {
    let alive = true;
    (async () => {
      const MODELS = `${import.meta.env.BASE_URL}models`;
      await Promise.all([
        faceapi.nets.tinyFaceDetector.loadFromUri(MODELS),
        faceapi.nets.faceExpressionNet.loadFromUri(MODELS),
      ]);
      if (alive) setModelsLoaded(true);
    })().catch((e) => console.error("Model load failed:", e));
    return () => { alive = false; };
  }, []);

  // ---------- thresholds fetch (guarded) ----------
  useEffect(() => {
    if (!isObjectId(childId)) return; // don't call with null/invalid
    let cancelled = false;
    (async () => {
      setLoadingCfg(true);
      try {
        const doc = await ThresholdsAPI.get(childId, routeEmotion);
        const base = DEFAULTS[difficulty] || DEFAULTS.easy;
        const newCfg = {
          level:     doc?.level     ?? 1,
          threshold: doc?.threshold ?? base.threshold,
          holdMs:    doc?.holdMs    ?? base.holdMs,
        };
        if (!cancelled) setCfg(newCfg);
      } catch {
        const base = DEFAULTS[difficulty] || DEFAULTS.easy;
        if (!cancelled) setCfg({ level: 1, ...base });
      } finally {
        if (!cancelled) setLoadingCfg(false);
      }
    })();
    return () => { cancelled = true; };
  }, [childId, routeEmotion, difficulty]);

  // ---------- camera / detection ----------
  async function startCamera() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      passedRef.current = false; // reset on start
      setFeedback("");
      setCameraOn(true);
      setStatus("Detecting");
      startLoop();
    } catch (e) {
      alert("Could not access camera: " + (e?.message || e));
    }
  }

  function stopCamera() {
    cancelAnimationFrame(rafRef.current);
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    holdRef.current = 0;
    setCameraOn(false);
    setStatus("Ready");
    setTargetProb(0);
    setSmoothed(0);
    setAboveForMs(0);
    setStars(0);
    setCelebrate(false);
    setFeedback("");
    passedRef.current = false;
  }

  function tryAgain() {
    passedRef.current = false;
    holdRef.current = 0;
    setStatus(cameraOn ? "Detecting" : "Ready");
    setTargetProb(0);
    setSmoothed(0);
    setAboveForMs(0);
    setStars(0);
    setCelebrate(false);
    setFeedback("");
  }

  // Reset between scenarios & emotion
  useEffect(() => { tryAgain(); /* eslint-disable-line */ }, [scenarioIdx]);
  useEffect(() => { tryAgain(); /* eslint-disable-line */ }, [routeEmotion]);

  function startLoop() {
    let lastTs = performance.now();
    let started = lastTs;
    let ema = 0;

    const loop = async (ts) => {
      const dt = Math.max(0, ts - lastTs);
      lastTs = ts;

      if (!videoRef.current || videoRef.current.readyState < 2) {
        rafRef.current = requestAnimationFrame(loop);
        return;
      }

      try {
        const det = await faceapi
          .detectSingleFace(
            videoRef.current,
            new faceapi.TinyFaceDetectorOptions({ inputSize: 224, scoreThreshold: 0.5 })
          )
          .withFaceExpressions();

        let p = 0, top = 0, second = 0, topLabel = "neutral";
        if (det?.expressions) {
          const entries = Object.entries(det.expressions).sort((a, b) => b[1] - a[1]);
          if (entries.length) {
            [topLabel, top] = entries[0];
            second = entries[1]?.[1] ?? 0;
          }
          p = Math.max(0, Math.min(1, det.expressions[routeEmotion] ?? 0));
        }

        // smoothing
        ema = ALPHA * p + (1 - ALPHA) * ema;

        // warm-up
        const warming = ts - started < WARMUP_MS;

        setTargetProb(p);
        setSmoothed(ema);

        // hold logic
        const over = ema >= (cfg.threshold ?? 0.75);
        holdRef.current = over ? holdRef.current + dt : 0;
        setAboveForMs(holdRef.current);

        // instant pass
        const strongInstant =
          !warming && p >= INSTANT_PASS && top - second >= MARGIN && topLabel === routeEmotion;

        // Feedback (only while not passed)
        if (!passedRef.current) {
          if (warming) {
            setFeedback("Getting ready…");
          } else if (topLabel !== routeEmotion && top - second >= MARGIN && top >= 0.6) {
            setFeedback(`I see ${topLabel}. Try a ${routeEmotion} face ${EMOJI[routeEmotion] || ""}`);
          } else if (over && holdRef.current < (cfg.holdMs ?? 1000)) {
            const rem = Math.max(0, (cfg.holdMs ?? 1000) - holdRef.current);
            setFeedback(`Hold it ${rem.toFixed(0)} ms more…`);
          } else if (p < (cfg.threshold ?? 0.75) * 0.6) {
            setFeedback(`Exaggerate your ${routeEmotion} face a bit more ${EMOJI[routeEmotion] || ""}`);
          } else {
            setFeedback("");
          }
        }

        // Pass condition
        if (!passedRef.current && ((over && holdRef.current >= (cfg.holdMs ?? 1000)) || strongInstant)) {
          passedRef.current = true;
          const best = Math.max(ema, p);
          const s = best >= 0.9 ? 3 : best >= 0.8 ? 2 : 1;
          setStars(s);
          setStatus("Passed");
          setCelebrate(true);
          setFeedback("Yay! Job well done 🎉");
          fireStars(2500); // <- confetti

          // log attempt
          AttemptsAPI.log({
            childId,
            emotionName: routeEmotion,
            scenario: scenario.text,
            score: Number(best.toFixed(3)),
            passed: true,
            stars: s,
            difficulty,
          })
            .then(() => setReportTick((t) => t + 1))
            .catch(() => {});
        }
      } catch {
        // ignore single-frame errors
      }

      rafRef.current = requestAnimationFrame(loop);
    };

    rafRef.current = requestAnimationFrame(loop);
  }

  function nextScenario() {
    setScenarioIdx((i) => (i + 1) % Math.max(1, scenarios.length));
    tryAgain();
  }

  useEffect(() => () => stopCamera(), []);

  const percent = useMemo(() => Math.round(smoothed * 100), [smoothed]);

  const DiffChip = ({ name }) => (
    <button
      className={`wood-chip ${difficulty === name ? "active" : ""}`}
      onClick={() => setDifficulty(name)}
    >
      {name.toUpperCase()}
    </button>
  );

  // Guard: require a child profile first
  if (!childId) {
    return <div style={{ padding: 20 }}>Preparing your child profile…</div>;
  }

  return (
    <div className="board-wrap">
      {/* LEFT RAIL – controls */}
      <aside className="rail left-rail">
        <div className="rail-group">
          <button
            className="wood-btn primary"
            onClick={cameraOn ? undefined : startCamera}
            disabled={!modelsLoaded || cameraOn}
          >
            ▶ Start
          </button>
          <button className="wood-btn" onClick={cameraOn ? stopCamera : undefined} disabled={!cameraOn}>
            ⏹ Stop
          </button>
          <button className="wood-btn" onClick={tryAgain}>
            ↻ Try Again
          </button>
        </div>

        <div className="rail-group">
          <div className="wood-sign">
            <div className="sign-title">LEVEL ({EMOJI[routeEmotion]} {routeEmotion})</div>
            <div className="sign-body">
              <div>Threshold: {(cfg.threshold * 100).toFixed(0)}%</div>
              <div>Hold: {cfg.holdMs} ms</div>
            </div>
          </div>
        </div>
      </aside>

      {/* CENTER – webcam + meter */}
      <main className="center-stage">
        <div className="hanging-board">
          <div className="plank">
            <video ref={videoRef} className="cam" playsInline muted />
            {!cameraOn && <div className="cam-off">Camera OFF</div>}
          </div>

        <div className="plank slim">
          <div className="meter">
            <div className="meter-top">
              <span className="meter-label">{routeEmotion.toUpperCase()}</span>
              <span className="meter-val">{percent}%</span>
            </div>
            <div className="meter-bar">
              <div
                className={`meter-fill ${smoothed >= (cfg.threshold ?? 0.75) ? "ok" : ""}`}
                style={{ width: `${percent}%` }}
              />
              <div
                className="meter-threshold"
                style={{ left: `${(cfg.threshold ?? 0.75) * 100}%` }}
              />
            </div>
            <div className="meter-sub">
              Hold: {Math.min(aboveForMs, cfg.holdMs).toFixed(0)} / {cfg.holdMs} ms
            </div>
            <div className={`status ${status === "Passed" ? "good" : ""}`}>{status}</div>
            {status === "Passed" && (
              <div className="stars" aria-label={`${stars} stars`}>
                {Array.from({ length: stars }).map((_, i) => (<span key={i}>⭐</span>))}
              </div>
            )}
            {/* NEW: feedback line */}
            <div className={`feedback ${status === "Passed" ? "good" : ""}`}>{feedback}</div>
          </div>
        </div>

          <div className="plank controls-row">
            <div className="chips">
              <DiffChip name="easy" />
              <DiffChip name="medium" />
              <DiffChip name="hard" />
              <button className="wood-chip next" onClick={nextScenario}>NEXT ▶</button>
            </div>
          </div>
        </div>

        {/* (You can keep your old CSS confetti-pop overlay if you want the flash) */}
        {celebrate && (
          <div className="confetti-pop" onAnimationEnd={() => setCelebrate(false)} />
        )}
      </main>

      {/* RIGHT RAIL – scenario + progress */}
      <aside className="rail right-rail">
        <div className="scenario-card cloud8">
          <div className="scenario-header">SCENARIO</div>
          {scenario?.imageUrl || scenario?.img ? (
            <img
              src={toImg(scenario.imageUrl || scenario.img)}
              alt="scenario"
              className="scenario-img"
            />
          ) : (
            <div className="scenario-placeholder">No scenario</div>
          )}
          <div className="scenario-text">{scenario?.text}</div>
        </div>

        <div className="rail-group">
          <div className="wood-sign">
            <div className="sign-title">Progress</div>
            <div className="wood-body">
              <ChildReport childId={childId} refresh={reportTick} />
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
