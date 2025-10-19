import { useState, useEffect, useMemo, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import "../../styles/blogsStyles/BlogHomeStyles.css";
import heroImg from "../../assets/blog1.png";
import hand from "../../assets/hand.png";
import BlogDetail from "../../pages/blogs/BlogDetail";
import Lottie from "lottie-react";
import BlogsCard from "../../pages/blogs/BlogsCard";
import tigerLottie from "../../assets/animations/tiger.json";

const CATEGORIES = ["All", "Q&A", "Tips", "Stories", "Resources"];

export default function BlogHome() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [activeCat, setActiveCat] = useState("All");

  const sectionRef = useRef(null);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;

    const compute = () => {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;

      // How much of the section has entered the viewport from the bottom
      // 0   => section not visible yet
      // vh  => when the section's top reaches the top of the viewport
      const entered = Math.min(vh, Math.max(0, vh - rect.top));

      // Wait until ~25% of the viewport is inside before starting the move
      const start = 0.9 * vh; // tweak: when animation begins
      const travel = 1200; // tweak: pixels over which we finish the move

      const raw = (entered - start) / travel;
      const p = Math.min(1, Math.max(0, raw));

      setProgress(p);
    };

    compute();
    window.addEventListener("scroll", compute, { passive: true });
    window.addEventListener("resize", compute);
    return () => {
      window.removeEventListener("scroll", compute);
      window.removeEventListener("resize", compute);
    };
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch("http://localhost:5050/api/blogs");
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const payload = await res.json();

        const list = Array.isArray(payload) ? payload : payload.items || [];

        list.sort((a, b) => new Date(b.date) - new Date(a.date));
        setBlogs(list);
      } catch (e) {
        if (alive) setErr("Oops! Couldn’t load blogs.");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  const filtered = useMemo(() => {
    return blogs.filter((b) => activeCat === "All" || b.category === activeCat);
  }, [blogs, activeCat]);

  const isEmpty = !loading && !err && filtered.length === 0;
 
  return (
    <>
      <div className="hero-blog-section">
        <div className="hero-blog-content gooey ">
          <h1>Thoughts & Questions That Matter</h1>
          <p>Simple words, real stories, true support.</p>
          <a
            className="cta"
            href="#blogs"
            onClick={(e) => {
              e.preventDefault();
              document
                .getElementById("blogs")
                ?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            <span>Explore</span>
            <span>
              {/* your arrow svg */}
              <svg
                width="66px"
                height="43px"
                viewBox="0 0 66 43"
                xmlns="http://www.w3.org/2000/svg"
              >
                <g id="arrow" fill="none" fillRule="evenodd">
                  <path
                    className="one"
                    d="M40.15 3.89L43.97.14c.19-.19.5-.19.69 0l21.01 20.65c.39.39.39 1.02 0 1.41L44.66 42.86c-.19.19-.5.19-.69 0l-3.82-3.75a.56.56 0 01-.01-.8L56.99 21.85a.56.56 0 000-.8L40.15 3.89z"
                    fill="#FFFFFF"
                  ></path>
                  <path
                    className="two"
                    d="M20.15 3.89L23.97.14c.19-.19.5-.19.69 0l21.01 20.65c.39.39.39 1.02 0 1.41L24.66 42.86c-.19.19-.5.19-.69 0l-3.82-3.75a.56.56 0 01-.01-.8L36.99 21.85a.56.56 0 000-.8L20.15 3.89z"
                    fill="#FFFFFF"
                  ></path>
                  <path
                    className="three"
                    d="M.15 3.89L3.97.14c.19-.19.5-.19.69 0l21.01 20.65c.39.39.39 1.02 0 1.41L4.66 42.86c-.19.19-.5.19-.69 0L.15 39.11a.56.56 0 01-.01-.8L16.99 21.85a.56.56 0 000-.8L.15 3.89z"
                    fill="#FFFFFF"
                  ></path>
                </g>
              </svg>
            </span>
          </a>
        </div>

        <div className="hero-blog-image">
          <img src={heroImg} alt="" />
          <img src={hand} alt="" className="hand-image" />
        </div>
      </div>
      <div
        className={`blog-view-section ${isEmpty ? "no-blogs" : ""}`}
        id="blogs"
      >
        <div
          className="lottie-bg"
          ref={sectionRef}
          aria-hidden="true"
          style={{ "--p": progress }}
        >
          <div className="tiger-wrap">
            <Lottie
              animationData={tigerLottie}
              loop
              autoplay
              className="tiger-lottie"
              style={{ width: "100%", height: "100%" }}
            />
          </div>
        </div>

        <nav className="blog-nav" aria-label="Categories">
          <ul>
            {CATEGORIES.map((cat) => (
              <li key={cat}>
                <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setActiveCat(cat);
                  }}
                  className={activeCat === cat ? "active" : ""}
                >
                  {cat}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <div className="blogs-toolbar">
          <h2 className="blogs-heading">Latest Posts</h2>
          <Link to="/blogs/new" className="add-blog-button">
            + Add New Blog
          </Link>
        </div>

        {/* LIST AREA */}
        {loading && (
          <div className="blogs-grid">
            {Array.from({ length: 6 }).map((_, i) => (
              <div className="blog-card skeleton" key={i} />
            ))}
          </div>
        )}

        {!loading && err && <div className="alert error">{err}</div>}

        {!loading && !err && isEmpty && (
          <div className="empty-state">
            <div className="empty">No blogs found in “{activeCat}”.</div>
           
          </div>
        )}

        {!loading && !err && !isEmpty && (
          <div className="blogs-grid">
            {filtered.map((blog) => (
              <BlogsCard key={blog._id} blog={blog} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}
