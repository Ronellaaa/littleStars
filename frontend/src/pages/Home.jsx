import { useEffect, useRef } from "react";
import { Swiper, SwiperSlide } from "swiper/react";
import { EffectCoverflow, Pagination, Autoplay } from "swiper/modules";
import FeatureSelect from "./BugTower";
import bg from "../assets/bg-home2.png";
import forest from "../assets/play.png";
import "../styles/home-hero.css";
import "../styles/star-slider.css"; // <- new css for slider
import monster from "../assets/monster1.png";
import monster1 from "../assets/monster2.png";
import bgEmotion from "../assets/e1.png";
import bgSpeech from "../assets/talk.png";
import bgRoutine from "../assets/r3.png";
import bgGames from "../assets/pl1.png";
import bgNursery from "../assets/nursury9.png";
import Lottie from "lottie-react";
import adventureAnim from "../assets/adventure.json"; // <- your JSON animation
const slides = [
  { id: 1, name: "Emotion Simulator", price: "Free", image: bgEmotion },
  { id: 2, name: "Speech Theraphy", price: "Free", image: bgSpeech },
  { id: 3, name: "Routine Builder", price: "Free", image: bgRoutine },
  { id: 4, name: "Games", price: "Free", image: bgGames },
  { id: 5, name: "Nursery", price: "Free", image: bgNursery },
];

export default function HomeHero() {
  const rootRef = useRef(null);

  useEffect(() => {
    const hash = window.location.hash;
    if (hash === "#features") {
      document
        .getElementById("features")
        ?.scrollIntoView({ behavior: "smooth" });
    }
  }, []);

  const goFeatures = () =>
    document
      .getElementById("features")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });

  return (
    <main ref={rootRef} className="ls-hero" aria-labelledby="home-hero-title">
      {/* Decorative sky layer */}
      {/* SKY + DECOR */} {/* HERO SECTION */}
      <div className="ls-hero-main" style={{ backgroundImage: `url(${bg})` }}>
        <div className="ls-hero-content">
          <h1 className="ls-hero-title">
            Welcome to <span>LittleStars</span>
          </h1>
          <p className="ls-hero-sub">
            Discover a magical world of learning and play!
          </p>
          <button className="ls-cta" onClick={goFeatures}>
            Explore Worlds
          </button>
          {/* Optional: cute floating elements like planets or icons */}
          <div className="ls-floating-icons">
            <img src={bgEmotion} alt="Planet" className="floating-icon" />
            <img
              src={bgSpeech}
              alt="Planet"
              className="floating-icon floating-delay"
            />
            <img src={bgGames} alt="Planet" className="floating-icon" />
          </div>
        </div>
      </div>
      {/* Adventures Heading with Animation */}
      <div className="adventure-header-wrap">
        <h2 className="star-slider-title">More Adventures Await</h2>
      </div>
      <div className="adventure-section">
        <div className="adventure-animation">
          <Lottie
            animationData={adventureAnim}
            loop={true}
            style={{ width: "600px", height: "600px" ,position:"relative",right:"20%"}}
          />
        </div>
        {/* 🌟 Learning Carousel */}
        <section
          className="star-slider-wrap "
          aria-label="Featured Learning Games"
        >
          <div className="star-slider-frame">
            {/* 👾 Monster peeking */}

            <img
              src={monster}
              alt="Friendly monster peeking "
              className="monster-peek monster-left"
            />

            <img
              src={monster1}
              alt="Friendly monster peeking"
              className="monster-peek monster-right"
            />

            {/* Swiper */}
            <div className="star-slider-container">
              <Swiper
                effect="coverflow"
                grabCursor={true}
                centeredSlides={true}
                slidesPerView={2}
                autoplay={{ delay: 3000, disableOnInteraction: false }}
                coverflowEffect={{
                  rotate: 12,
                  stretch: 20,
                  depth: 0,
                  modifier: 0.6,
                  slideShadows: false,
                }}
                pagination={{ clickable: true }}
                modules={[EffectCoverflow, Pagination, Autoplay]}
                className="star-swiper"
              >
                {slides.map((slide) => (
                  <SwiperSlide key={slide.id} className="star-swiper-slide">
                    <div className="star-card">
                      <img
                        src={slide.image}
                        alt={slide.name}
                        className="star-card-img"
                      />
                      <h3 className="star-card-title">{slide.name}</h3>
                      <p className="star-card-meta">{slide.price}</p>
                      <button className="star-card-btn">Play Now</button>
                    </div>
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          </div>
        </section>
      </div>
      {/* Features grid / game launcher */}
      <section
        id="features"
        className="ls-features"
        aria-label="Learning worlds"
      >
        <header className="ls-features-hd">
          <h2>Choose a world to begin</h2>
          <p className="ls-subtext">
            Fun mini-games for alphabets, numbers, colours, shapes and more.
          </p>
        </header>
        <FeatureSelect bgImage={forest} />
      </section>
    </main>
  );
}
