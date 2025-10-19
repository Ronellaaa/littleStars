import { useRef, useMemo, useState, useEffect } from "react";
import "../../styles/emotionSimulatorStyles/parallax.css";
import { gsap } from "gsap";
import { useNavigate } from "react-router-dom";

// Background + butterflies
import bg from "../../assets/gate.png";
import b1 from "../../assets/butterfly1.png";
import b2 from "../../assets/butterfly4.png";

// Girl sprites
import girlNeutral from "../../assets/n1.png";
import girlHappy from "../../assets/h1.png";
import girlSad from "../../assets/h2.png";
import girlAngry from "../../assets/h3.png";

// Side art / extras
import emotion from "../../assets/e1.png";
import road from "../../assets/road.png";
import bgNeutral from "../../assets/f6.png";
import bgHappyImg from "../../assets/f9.png";
import bgSadImg from "../../assets/s1.png";
import bgAngryImg from "../../assets/f1.png";

export default function ParallaxMagic() {
  const sceneRef = useRef(null);
  const leavesRef = useRef(null);
  const girlRef = useRef(null);
  const bgARef = useRef(null);
  const bgBRef = useRef(null);
  const navigate = useNavigate();
  
//timer for auto-navigation
  const navTimerRef = useRef(null);
  const [eta, setEta] = useState(null);

  const puddleRefs = {
    happy: useRef(null),
    sad: useRef(null),
    angry: useRef(null),
  };

  const [mood, setMood] = useState("neutral");

  useEffect(() => {
    if (eta == null) return;
    const id = setInterval(() => setEta((v) => (v <= 1 ? null : v - 1)), 1000);
    return () => clearInterval(id);
  }, [eta]);

  useEffect(() => () => navTimerRef.current?.kill?.(), []);

  const bgForMood = {
    neutral: bgNeutral,
    happy: bgHappyImg,
    sad: bgSadImg,
    angry: bgAngryImg,
  };
  const spriteForMood = {
    neutral: girlNeutral || girlHappy,
    happy: girlHappy,
    sad: girlSad,
    angry: girlAngry,
  };
  const particleForMood = {
    neutral: "leaves",
    happy: "petals",
    sad: "rain",
    angry: "embers",
  };

  const activeKey = useRef("a");
  const crossfadeSceneBg = (url) => {
    const from = activeKey.current === "a" ? bgARef.current : bgBRef.current;
    const to = activeKey.current === "a" ? bgBRef.current : bgARef.current;
    gsap.set(to, { backgroundImage: `url(${url})`, opacity: 0 });
    gsap.to(from, { opacity: 0, duration: 0.6, ease: "power2.out" });
    gsap.to(to, { opacity: 1, duration: 0.6, ease: "power2.out" });
    activeKey.current = activeKey.current === "a" ? "b" : "a";
  };

  useEffect(() => {
    gsap.set(bgARef.current, {
      backgroundImage: `url(${bgNeutral})`,
      opacity: 1,
    });
    gsap.set(bgBRef.current, {
      backgroundImage: `url(${bgNeutral})`,
      opacity: 0,
    });
  }, []);

  const [idle, setIdle] = useState(true);
  const idleTimer = useRef(null);
  const nudgeIdle = () => {
    setIdle(false);
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), 2500);
  };
  const handleMove = (e) => {
    nudgeIdle();
    const el = sceneRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = (e.clientX - cx) / rect.width;
    const dy = (e.clientY - cy) / rect.height;
    el.style.transform = `perspective(800px) rotateY(${dx * 6}deg) rotateX(${
      -dy * 6
    }deg) translateX(${dx * 6}px) translateY(${dy * 6}px)`;
  };
  const handleLeave = () => {
    const el = sceneRef.current;
    if (!el) return;
    el.style.transform =
      "perspective(800px) rotateY(0deg) rotateX(0deg) translateX(0) translateY(0)";
    clearTimeout(idleTimer.current);
    idleTimer.current = setTimeout(() => setIdle(true), 1500);
  };
  useEffect(() => {
    if (idle && sceneRef.current) sceneRef.current.style.transform = "";
  }, [idle]);

  const streams = useMemo(() => {
    const M = 8;
    const rnd = (a, b) => Math.random() * (b - a) + a;
    return Array.from({ length: M }).map(() => ({
      y: rnd(5, 95),
      len: rnd(20, 45),
      thick: rnd(1, 2.2),
      dur: rnd(6, 14),
      delay: rnd(0, 10),
      glow: rnd(0.4, 0.9),
    }));
  }, []);

  const swirls = useMemo(() => {
    const M = 8;
    const rnd = (a, b) => Math.random() * (b - a) + a;
    return Array.from({ length: M }).map(() => ({
      y: rnd(8, 92),
      scale: rnd(0.85, 1.2),
      dur: rnd(10, 18),
      delay: rnd(0, 8),
    }));
  }, []);

  const blades = useMemo(() => {
    const B = 90;
    const rnd = (a, b) => Math.random() * (b - a) + a;
    return Array.from({ length: B }).map(() => ({
      x: rnd(0, 100),
      h: rnd(40, 110),
      w: rnd(2, 4),
      dur: rnd(2.8, 4.6),
      delay: rnd(0, 2.5),
      bend: rnd(6, 14),
      lean: rnd(-6, 6),
    }));
  }, []);

  const [gust, setGust] = useState(0);
  useEffect(() => {
    const id = setInterval(() => {
      const g = Math.random() * 40 - 20;
      setGust(g);
      const back = setTimeout(() => setGust(0), 1500);
      return () => clearTimeout(back);
    }, 6000 + Math.random() * 4000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const wrap = leavesRef.current;
    if (!wrap) return;

    const W = () => wrap.clientWidth;
    const H = () => wrap.clientHeight;
    const R = (a, b) => a + Math.random() * (b - a);

    gsap.killTweensOf("*", { overwrite: true });
    wrap.innerHTML = "";

    const make = (cls) => {
      const holder = document.createElement("span");
      holder.className = "em-leaf-wrap";
      const inner = document.createElement("i");
      inner.className = `em-particle ${cls}`;
      holder.appendChild(inner);
      wrap.appendChild(holder);
      return holder;
    };

    const kind = particleForMood[mood];
    const nodes = [];

    if (kind === "rain") {
      const total = 100;
      for (let i = 0; i < total; i++) {
        const n = make("em-drop");
        nodes.push(n);
        gsap.set(n, { x: R(0, W()), y: R(-220, -40), rotationZ: R(-8, -3) });
        gsap.to(n, {
          y: () => H() + 40,
          x: `+=${R(-40, 40)}`,
          duration: R(0.9, 1.6),
          ease: "none",
          repeat: -1,
          delay: R(-1.6, 0),
        });
        gsap.to(n, {
          scaleY: R(0.85, 1.15),
          duration: R(0.2, 0.4),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    } else if (kind === "embers") {
      const total = 40;
      for (let i = 0; i < total; i++) {
        const n = make("em-ember");
        nodes.push(n);
        const startX = R(0, W());
        const startY = R(H() * 0.6, H() - 10);
        gsap.set(n, {
          x: startX,
          y: startY,
          scale: R(0.7, 1.2),
          opacity: R(0.5, 1),
        });
        gsap.to(n, {
          y: startY - R(120, 240),
          x: `+=${R(-60, 60)}`,
          opacity: 0,
          duration: R(2.5, 4),
          ease: "sine.out",
          repeat: -1,
          delay: R(-4, 0),
        });
        gsap.to(n, {
          rotationZ: R(-30, 30),
          duration: R(0.8, 1.6),
          repeat: -1,
          yoyo: true,
          ease: "sine.inOut",
        });
      }
    } else {
      const cls = kind === "petals" ? "em-petal" : "em-leaf";
      const total = 30;
      for (let i = 0; i < total; i++) {
        const n = make(cls);
        nodes.push(n);
        gsap.set(n, {
          x: R(0, W()),
          y: R(-200, -150),
          z: R(-200, 200),
          rotationX: R(0, 360),
          rotationY: R(0, 360),
          rotationZ: R(0, 180),
        });
        gsap.to(n, {
          y: () => H() + 100,
          duration: R(6, 15),
          ease: "none",
          repeat: -1,
          delay: R(-15, 0),
        });
        gsap.to(n, {
          x: `+=${R(80, 160)}`,
          rotationZ: R(0, 180),
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          duration: R(4, 8),
        });
        gsap.to(n, {
          rotationX: R(0, 360),
          rotationY: R(0, 360),
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut",
          duration: R(2, 8),
          delay: R(-5, 0),
        });
      }
    }

    return () => {
      nodes.forEach((n) => gsap.killTweensOf(n));
      wrap.innerHTML = "";
    };
  }, [mood]);

  const hopToPuddle = (emotion) => {
    navTimerRef.current?.kill?.();
    setEta(null);

    const girlEl = girlRef.current;
    const puddleEl = puddleRefs[emotion].current;
    if (!girlEl || !puddleEl) return;

    const gRect = girlEl.getBoundingClientRect();
    const pRect = puddleEl.getBoundingClientRect();
    const deltaX =
      pRect.left + pRect.width / 2 - (gRect.left + gRect.width / 2);

    gsap.fromTo(
      puddleEl,
      { scale: 1 },
      { scale: 1.08, yoyo: true, repeat: 1, duration: 0.14, ease: "sine.inOut" }
    );

    const tl = gsap.timeline({ defaults: { ease: "power2.out" } });
    tl.to(girlEl, { x: `+=${deltaX}`, y: -90, duration: 0.55 })
      .to(girlEl, { y: 0, duration: 0.42, ease: "bounce.out" })
      .add(() => {
        setMood(emotion);
        crossfadeSceneBg(bgForMood[emotion]);
      }, "-=0.2")
      .add(() => {
        const delaySec = 3;
        setEta(delaySec);
        navTimerRef.current = gsap.delayedCall(delaySec, () => {
          navigate(`/lesson/${emotion}`);
        });
      }, "+=0.1");
  };

  return (
    <div className="em-main">
      <div
        className={`em-hero${idle ? " em-autopan" : ""}`}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
      >
        <div
          className="em-scene"
          ref={sceneRef}
          style={{ "--gust": `${gust}px` }}
        >
          <div className="em-bg" ref={bgARef} />
          <div className="em-bg" ref={bgBRef} />

          {/* Wind streaks */}
          <div className="em-wind">
            {streams.map((s, i) => (
              <span
                key={i}
                className="em-stream"
                style={{
                  "--y": `${s.y}vh`,
                  "--len": `${s.len}vw`,
                  "--thick": `${s.thick}px`,
                  "--dur": `${s.dur}s`,
                  "--delay": `${s.delay}s`,
                  "--glow": s.glow,
                }}
              />
            ))}
          </div>

          {/* Swirls */}
          <svg
            className="em-swirls"
            viewBox="0 0 1200 700"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {swirls.map((s, i) => (
              <g
                key={i}
                className="em-swirl"
                style={{
                  "--y": `${s.y}vh`,
                  "--scale": s.scale,
                  "--dur": `${s.dur}s`,
                  "--delay": `${s.delay}s`,
                }}
              >
                <path d="M -150 350 C  50 250, 150 450, 300 350 S 550 250, 700 350 S 900 450, 1050 350 S 1200 250, 1350 350" />
                <path
                  className="em-swirl-alt"
                  d="M -150 360 C  20 310, 200 420, 340 360 S 600 300, 760 360 S 940 420, 1120 360"
                />
              </g>
            ))}
          </svg>

          {/* Grass */}
          <div className="em-grass">
            {blades.map((b, i) => (
              <span
                key={i}
                className="em-blade"
                style={{
                  "--x": b.x,
                  "--h": `${b.h}px`,
                  "--w": `${b.w}px`,
                  "--dur": `${b.dur}s`,
                  "--delay": `${b.delay}s`,
                  "--bend": `${b.bend}deg`,
                  "--lean": `${b.lean}px`,
                }}
              />
            ))}
          </div>

          {/* Particle layer */}
          <div
            className="em-leaves"
            ref={leavesRef}
            style={{ "--gustX": `${gust * 0.05}px` }}
          />

          {/* Girl */}
          <img
            ref={girlRef}
            className="em-girl"
            src={spriteForMood[mood]}
            alt="girl"
            draggable="false"
          />

          {/* Puddles (buttons) */}
          <div className="em-puddles">
            <button
              type="button"
              ref={puddleRefs.happy}
              className="em-puddle em-happy"
              data-label="😊 Happy"
              onClick={() => hopToPuddle("happy")}
            />
            <button
              type="button"
              ref={puddleRefs.sad}
              className="em-puddle em-sad"
              data-label="🥲 Sad"
              onClick={() => hopToPuddle("sad")}
            />
            <button
              type="button"
              ref={puddleRefs.angry}
              className="em-puddle em-angry"
              data-label="😠 Angry"
              onClick={() => hopToPuddle("angry")}
            />
          </div>

          {/* Butterflies */}
          <img src={b1} className="em-butterfly em-b10" alt="" />
          <img src={b2} className="em-butterfly em-b20" alt="" />
          <img src={b1} className="em-butterfly em-b30" alt="" />
        </div>

        {/* Road inside the scene */}
        <img
          src={road}
          alt=""
          className="em-road em-road-inner"
          aria-hidden="true"
        />
      </div>

      {/* LEFT PANEL */}
      <aside className="em-side em-left-panel">
        <div className="em-left-card">
          <h3>Emotion stimulator</h3>
          <p>
            The Emotion Stimulator helps children recognize emotions. Pick a
            puddle to jump and see how feelings change in the scene.
          </p>
          <div className="em-emotion1">
            <img src={emotion} className="em-emotion" />
          </div>
        </div>
        <div className="em-gate">
          <img src={bg} alt="" className="em-gate-bg" />
        </div>
      </aside>

      {/* RIGHT HERO STACK + BUBBLE */}
      <aside className="em-side em-right-stack">
        <div
          className={`em-speech-cloud ${mood !== "neutral" ? "em-hide" : ""}`}
        >
          select emotion
        </div>
        <div className="em-gate">
          <img src={bg} alt="" className="em-gate-bg em-heroes-pack" />
        </div>
      </aside>

      {/* Optional: tiny auto-nav toast */}
      {eta != null && (
        <div className="em-autonav">
          Starting {mood} lesson in {eta}s…
        </div>
      )}
    </div>
  );
}
