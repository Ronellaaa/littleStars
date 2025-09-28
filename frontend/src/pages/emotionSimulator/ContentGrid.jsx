// src/pages/emotionSimulator/ContentGrid.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ContentsAPI } from "../../api/http";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation } from "swiper/modules";
import gsap from "gsap";

import "swiper/css";
import "swiper/css/navigation";
import "../../styles/emotionSimulatorStyles/content-showcase.css";

// (optional) circle textures per emotion. You can swap to your own images or set to null.
import circleHappy from "../../assets/gr2.png";
import circleSad   from "../../assets/gr1.png";
import circleAngry from "../../assets/bear.png";
import circleWow   from "../../assets/astr.png";
import c1  from "../../assets/c3.jpg";
import c2  from "../../assets/c4.png";
import c3  from "../../assets/c3.png";
import c4  from "../../assets/c5.png";



const EMO_THEMES = {
  happy:     { bg: `url(${c1})`, circleImage: circleHappy, accent: "#36b37e" },
  sad:       { bg: `url(${c2})`, circleImage: circleSad,   accent: "#3b7ddd" },
  angry:     { bg: `url(${c3})`, circleImage: circleAngry, accent: "#e4572e" },
  surprised: { bg: `url(${c4})`, circleImage: circleWow,   accent: "#f0b429" },
  default:   { bg: `url(${c2})`, circleImage: null,        accent: "#8a7" },
};

export default function ContentGrid() {
  const { emotion = "happy" } = useParams();
  const navigate = useNavigate();
  const theme = EMO_THEMES[emotion] || EMO_THEMES.default;

  const [items, setItems] = useState([]);
  const [featured, setFeatured] = useState(null);

  const pageRef = useRef(null);
  const circleRef = useRef(null);

  // load active content for the emotion
  useEffect(() => {
    let mounted = true;
    ContentsAPI.list({ emotion })
      .then((list) => {
        if (!mounted) return;
        const safe = Array.isArray(list) ? list : [];
        setItems(safe);
        setFeatured(safe[0] || null);
      })
      .catch(console.error);
    return () => { mounted = false; };
  }, [emotion]);

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



  // animate bg + circle when the featured item changes
useEffect(() => {
  if (!featured) return;

  if (typeof theme.bg === "string" && theme.bg.startsWith("url")) {
    gsap.to(pageRef.current, { backgroundImage: theme.bg, duration: 0.45 });
    pageRef.current.style.backgroundSize = "cover";
    pageRef.current.style.backgroundPosition = "center";
  } else {
    gsap.to(pageRef.current, { backgroundColor: theme.bg, duration: 0.45 });
    pageRef.current.style.backgroundImage = "";
  }

  if (circleRef.current) {
    if (theme.circleImage) {
      circleRef.current.style.backgroundImage = `url(${theme.circleImage})`;
      circleRef.current.style.backgroundSize = "cover";
      circleRef.current.style.backgroundPosition = "center";
      circleRef.current.style.backgroundRepeat = "no-repeat";
    } else {
      circleRef.current.style.backgroundImage = "";
    }
    gsap.fromTo(circleRef.current, { scale: 0.96, opacity: 0.85 }, { scale: 1, opacity: 1, duration: 0.35 });
  }
}, [featured, theme]);



  // helpers
  const isYouTube = (url = "") => url.includes("youtube.com") || url.includes("youtu.be");
  const toEmbed = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
      if (u.hostname.includes("youtube.com")) {
        const v = u.searchParams.get("v");
        if (v) return `https://www.youtube.com/embed/${v}`;
      }
    } catch {}
    return url;
  };
  const youTubeThumb = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) {
        const id = u.pathname.slice(1);
        return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      }
      if (u.hostname.includes("youtube.com")) {
        const id = u.searchParams.get("v");
        if (id) return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
      }
    } catch {}
    return "";
  };
  const thumbFor = (it) => it.coverUrl || (isYouTube(it.videoUrl) ? youTubeThumb(it.videoUrl) : "");

  const title = useMemo(() => {
    const cap = emotion[0].toUpperCase() + emotion.slice(1);
    return `${cap} — Mentor Picks`;
  }, [emotion]);

  return (
    <div className="showcase-page" ref={pageRef} style={{ "--accent": theme.accent }}>
     
  <div class="cloud c1"></div>
  <div class="cloud c2"></div>
  <div class="cloud c3"></div>


    <div className="wind">
            {streams.map((s, i) => (
              <span
                key={i}
                className="stream"
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

 {/* <svg
            className="swirls"
            viewBox="0 0 1200 700"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {swirls.map((s, i) => (
              <g
                key={i}
                className="swirl"
                style={{
                  "--y": `${s.y}vh`,
                  "--scale": s.scale,
                  "--dur": `${s.dur}s`,
                  "--delay": `${s.delay}s`,
                }}
              >
                <path d="M -150 350 C  50 250, 150 450, 300 350 S 550 250, 700 350 S 900 450, 1050 350 S 1200 250, 1350 350" />
                <path
                  className="swirl-alt"
                  d="M -150 360 C  20 310, 200 420, 340 360 S 600 300, 760 360 S 940 420, 1120 360"
                />
              </g>
            ))}
          </svg> */}

   <div class="plane-wrap">
    <div class="rig">
      <div class="plane">
        <div class="wing"></div>
        <div class="window"></div>
      </div>
      <div class="rope"></div>
      <div class="banner">
        <span>be happy</span>
        <i class="tail"></i>
      </div>
    </div>
  </div>

      <header className="showcase-topbar">
        <button className="backBtn" onClick={() => navigate(`/lesson/${emotion}/activity`)}>← Back</button>. 
        <h1 className="showcase-title">{title}</h1>
          <button className="nextBtn" onClick={() => navigate(`/practice/${emotion}`)}>Next →</button>
        <div />
      </header>

      <div className="showcase-hero">
        {/* Left: info */}
        <aside className="left-info">
          <h2 className="feat-title">{featured?.title || "…"}</h2>
          <p className="feat-desc">{featured?.description || "No description provided."}</p>
          {featured?.assistantText && (
            <div className="assistant-bubble">
              {featured.assistantText}
            </div>
          )}
        </aside>

        {/* Center: circle viewer */}
        <div className="viewer">
          <div className="circle" ref={circleRef} />
          <div className="viewer-inner">
            {featured ? (
              <>
                {featured.videoUrl && isYouTube(featured.videoUrl) && (
                  <iframe
                    className="yt"
                    src={toEmbed(featured.videoUrl)}
                    title={featured.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                )}
                {featured.videoUrl && !isYouTube(featured.videoUrl) && (
                  <video className="mp4" controls src={featured.videoUrl} />
                )}
                {featured.lottieUrl && (
                  <iframe className="lottie" title="animation" src={featured.lottieUrl} />
                )}
                {!featured.videoUrl && !featured.lottieUrl && (
                  <div className="empty">This item has no video/animation.</div>
                )}
              </>
            ) : (
              <div className="empty">No content yet</div>
            )}
          </div>
        </div>
      </div>

      {/* Bottom: swiper */}
      <section className="showcase-swiper">
        <Swiper
          modules={[Navigation]}
          navigation
          loop
          slidesPerView={3}
          spaceBetween={24}
          breakpoints={{
            480:  { slidesPerView: 2 },
            768:  { slidesPerView: 3 },
            1024: { slidesPerView: 4 },
            1280: { slidesPerView: 5 },
          }}
        >
          {items.map((it) => (
            <SwiperSlide key={it._id}>
              <button
                className={`slide-card ${featured?._id === it._id ? "active" : ""}`}
                onClick={() => setFeatured(it)}
                title={it.title}
              >
                <div className="thumb">
                  {thumbFor(it)
                    ? <img src={thumbFor(it)} alt={it.title} />
                    : <div className="thumb-ph">No image</div>}
                </div>
                <div className="slide-title">{it.title}</div>
              </button>
            </SwiperSlide>
          ))}
        </Swiper>
      </section>
    </div>
  );
}
