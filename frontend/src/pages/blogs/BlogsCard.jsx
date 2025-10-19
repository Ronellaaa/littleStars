import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import "../../styles/blogsStyles/BlogsCard.css";
import blogImg from "../../assets/blog6.png";

export default function BlogsCard({ blog, onDelete }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const cover = blog.coverImageUrl || blog.imageUrl || "";
  const imgSrc = cover
    ? cover.startsWith("http")
      ? cover
      : `http://localhost:5050${cover}`
    : "";
  // Delete Blogs
  const handleDelete = async () => {
    if (!window.confirm(`Delete “${blog?.title}”? This can’t be undone.`))
      return;
    try {
      setBusy(true);
      const res = await fetch(`http://localhost:5050/api/blogs/${blog._id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Delete failed");
      navigate("/blogs");
    } catch (e) {
      setErr("Could not delete blog.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <article className="blog-card" role="article">
      <div className="tile-media">
        {imgSrc ? (
          <img src={imgSrc} alt="" loading="lazy" />
        ) : (
          // <div className="tile-fallback" aria-hidden="true">
          <img src={blogImg} alt="" loading="lazy" />
          // </div>
        )}
        {blog.category && <span className="tile-badge">{blog.category}</span>}
        <div className="tile-icons">
          <button
            className="icon-btn"
            onClick={() => navigate(`/blogs/edit/${blog._id}`)}
            title="Edit"
            aria-label="Edit"
          >
            ✏️
          </button>
          <button
            className="icon-btn"
            onClick={handleDelete}
            title="Delete"
            aria-label="Delete"
            disabled={busy}
          >
            🗑️
          </button>
        </div>
      </div>

      <div className="tile-body">
        <p className="tile-meta">
          <span className="meta-kind">Insight</span>
          <span className="dot" aria-hidden="true">
            •
          </span>
          <time dateTime={blog.date}>
            {new Date(blog.date).toLocaleDateString(undefined, {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </time>
        </p>

        <h2 className="tile-title">{blog.title}</h2>

        <p className="tile-snippet">{(blog.content || "").trim()}</p>

        {err && <div className="tile-error">{err}</div>}

        <div className="tile-actions">
          <Link to={`/blogs/${blog._id}`} className="tile-read">
            Read <span className="arrow">↗</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
