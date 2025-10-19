import { useEffect, useState } from "react";
import axios from "axios";
import { useAuth } from "../../../auth/AuthContext";
import "../../../styles/virtualNurseyStyles/ShapesLearn.css";
import { useParams } from "react-router-dom";
import ReactPlayer from "react-player";
import shapes from "../../../assets/shapes1.png"
const MAX_VIDEOS = 5;

function getId(v) {
  return v?._id || v?.id || "";
}
function isYouTubeOrVimeo(url = "") {
  return /youtube\.com|youtu\.be|vimeo\.com/i.test(url);
}
function normalizeYouTubePoster(poster) {
  return poster || undefined;
}

const SHAPES = [
  { name: "Circle", shape: "circle" },
  { name: "Square", shape: "square" },
  { name: "Triangle", shape: "triangle" },
  { name: "Rectangle", shape: "rectangle" },
  { name: "Star", shape: "star" },
  { name: "Heart", shape: "heart" },
  { name: "Oval", shape: "oval" },
  { name: "Diamond", shape: "diamond" },
  { name: "Pentagon", shape: "pentagon" },
  { name: "Hexagon", shape: "hexagon" },
];


// Normalize YouTube links so ReactPlayer always understands
function normalizeYouTubeUrl(url) {
  try {
    const u = new URL(url);
    if (u.hostname.includes("youtu.be")) {
      return `https://www.youtube.com/watch?v=${u.pathname.slice(1)}`;
    }
    if (u.hostname.includes("youtube.com")) {
      const v = u.searchParams.get("v");
      if (v) return `https://www.youtube.com/watch?v=${v}`;
    }
  } catch {
    return url;
  }
  return url;
}

export default function ShapesLearn({ topic: topicProp }) {
  const { user } = useAuth();
  const isMentor = user?.role?.toLowerCase() === "mentor";

  const { topic: topicURL } = useParams();
  const topic = (topicProp || topicURL || "shapes").toLowerCase();

  const [videos, setVideos] = useState([]);
  const [currentId, setCurrentId] = useState("");
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [showForm, setShowForm] = useState(false);

  const [form, setForm] = useState({
    title: "",
    url: "",
    thumbnail: "",
  });

  const visible = videos.slice(0, MAX_VIDEOS);
  const canAddMore = videos.length < MAX_VIDEOS;

  const handleBack = () => window.history.back();

  // Load videos
  useEffect(() => {
    let alive = true;
    setLoading(true);

    axios
      .get(`http://localhost:5050/api/learn/${topic}/videos`)
      .then((res) => {
        if (!alive) return;
        const arr = Array.isArray(res.data) ? res.data : [];
        const trimmed = arr.slice(0, MAX_VIDEOS);
        setVideos(trimmed);
        setCurrentId(getId(trimmed[0]));
      })
      .catch(() => {
        if (!alive) return;
        setVideos([]);
        setCurrentId("");
        setToast("Couldn’t load from server.");
      })
      .finally(() => {
        if (alive) setLoading(false);
      });

    return () => {
      alive = false;
    };
  }, [topic]);

  // Ensure currentId always points to something in `videos`
  useEffect(() => {
    if (!videos.length) {
      if (currentId) setCurrentId("");
      return;
    }
    if (!videos.some((v) => getId(v) === currentId)) {
      setCurrentId(getId(videos[0]));
    }
  }, [videos, currentId]);

  function openAdd() {
    if (!isMentor) return;
    if (!canAddMore) {
      setToast(`You can add up to ${MAX_VIDEOS} videos only.`);
      return;
    }
    setShowForm(true);
  }

  function closeAdd() {
    setShowForm(false);
    setForm({ title: "", url: "", thumbnail: "" });
  }

  async function onAdd(e) {
    e?.preventDefault?.();
    if (!isMentor) return;

    if (!canAddMore) {
      setToast(`You can add up to ${MAX_VIDEOS} videos only.`);
      return;
    }

    if (!form.title || !form.url) {
      setToast("Title and URL are required.");
      return;
    }

    const normalizedUrl = normalizeYouTubeUrl(form.url);

    if (!isYouTubeOrVimeo(normalizedUrl)) {
      setToast("Please enter a valid YouTube or Vimeo link.");
      return;
    }

    try {
      const res = await axios.post(
        `http://localhost:5050/api/learn/${topic}/videos`,
        {
          title: form.title,
          url: normalizedUrl,
          thumbnail: form.thumbnail || undefined,
          uploadedBy: user?._id || undefined,
        }
      );

      const saved = res.data; // single object
      setVideos((prev) => {
        const next = [...prev, saved].slice(0, MAX_VIDEOS);
        if (!prev.length) setCurrentId(getId(saved));
        return next;
      });
      setToast("Video added ✅");
    } catch (err) {
      const msg =
        err?.response?.data?.error ||
        (err?.message?.includes("Network Error")
          ? "Network error while adding."
          : "Couldn’t add video.");
      setToast(msg);
    } finally {
      closeAdd();
    }
  }
  const current =
    videos.find((v) => getId(v) === currentId) || videos[0] || null;

  console.log("ReactPlayer URL:", current?.url);

  async function onDelete(id) {
    if (!isMentor || !id) return;
    try {
      await axios.delete(
        `http://localhost:5050/api/learn/${topic}/videos/${id}`
      );
      setVideos((prev) => {
        const next = prev.filter((v) => getId(v) !== id);
        if (currentId === id) {
          setCurrentId(getId(next[0]) || "");
        }
        return next;
      });
      setToast("Video removed 🗑️");
    } catch {
      setToast("Failed to delete on server.");
    }
  }

  return (
    <div className="al-page">
       <button className="nurseryD-learn-bp-back" onClick={handleBack}type="button"> back</button>
      
        {/* Shapes Grid */}
          <aside className="al-chart">
                <div className="al-chart-title">Shapes</div>
                <div className="al-image-container">
                  <img src={shapes} alt="Shapes Chart" className="al-image" />
                </div>
              </aside>
        
    

      <main className="al-main">
        {toast && (
          <div
            className="al-toast"
            role="status"
            onAnimationEnd={() => setToast("")}
          >
            {toast}
          </div>
        )}

        <div className="al-player-card">
          {loading ? (
            <div className="al-empty">Loading…</div>
          ) : current ? (
            <>
              <div className="al-player" style={{ aspectRatio: "16/9" }}>
                <ReactPlayer
                  url={current.url}
                  controls
                  width="100%"
                  height="100%"
                />
              </div>

              <div className="al-player-meta">
                <h2 className="al-title">{current.title || "Untitled"}</h2>
              </div>
            </>
          ) : (
            <div className="al-empty">No video selected</div>
          )}
        </div>

        <div className="al-rail">
          {visible.map((v) => {
            const vid = getId(v);
            return (
              <div
                key={vid || v.title || Math.random()}
                className={`al-thumb ${currentId === vid ? "selected" : ""}`}
              >
                <button
                  className="al-thumb-btn"
                  onClick={() => vid && setCurrentId(vid)}
                  aria-label={`Play ${v.title || "video"}`}
                >
                  {v.thumbnail ? (
                    <img
                      src={v.thumbnail}
                      alt={v.title || "thumbnail"}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : (
                    <div className="al-thumb-fallback">
                      {v.title?.[0]?.toUpperCase() || "?"}
                    </div>
                  )}
                  <span className="al-thumb-title">
                    {v.title || "Untitled"}
                  </span>
                </button>

                {isMentor && vid && (
                  <button
                    className="al-thumb-delete"
                    onClick={() => onDelete(vid)}
                    aria-label={`Delete ${v.title || "video"}`}
                    title="Delete"
                  >
                    ✕
                  </button>
                )}
              </div>
            );
          })}

          {isMentor && videos.length < MAX_VIDEOS && (
            <button
              className="al-thumb al-add"
              onClick={openAdd}
              aria-label="Add new video"
            >
              <div className="al-add-plus">＋</div>
              <span className="al-thumb-title">Add video</span>
            </button>
          )}
        </div>

        {isMentor && showForm && (
          <div className="al-modal" role="dialog" aria-modal="true">
            <div className="al-modal-card">
              <h3>
                Add a video ({videos.length}/{MAX_VIDEOS})
              </h3>
              <form className="al-form" onSubmit={onAdd}>
                <div className="al-form-row">
                  <label>Title</label>
                  <input
                    value={form.title}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, title: e.target.value }))
                    }
                    required
                  />
                </div>
                <div className="al-form-row">
                  <label>YouTube/Vimeo Link</label>
                  <input
                    value={form.url}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, url: e.target.value }))
                    }
                    placeholder="https://youtube.com/watch?v=..."
                    required
                  />
                </div>

                <div className="al-form-row">
                  <label>Thumbnail</label>
                  <input
                    value={form.thumbnail}
                    onChange={(e) =>
                      setForm((s) => ({ ...s, thumbnail: e.target.value }))
                    }
                    placeholder="Image URL (optional)"
                  />
                  <input
                    type="file"
                    accept="image/*"
                    onChange={async (e) => {
                      const file = e.target.files[0];
                      if (!file) return;
                      const data = new FormData();
                      data.append("thumb", file);
                      try {
                        const res = await axios.post(
                          "http://localhost:5050/api/learn/upload/thumbnail",
                          data,
                          { headers: { "Content-Type": "multipart/form-data" } }
                        );
                        setForm((s) => ({ ...s, thumbnail: res.data.url }));
                      } catch (err) {
                        setToast("Thumbnail upload failed");
                      }
                    }}
                  />
                </div>

                <div className="al-form-actions">
                  <button
                    type="button"
                    className="al-btn ghost"
                    onClick={closeAdd}
                  >
                    Cancel
                  </button>
                  <button type="submit" className="al-btn">
                    Add
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
