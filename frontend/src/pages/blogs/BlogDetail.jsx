import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import "../../styles/blogsStyles/BlogDetail.css";
import blogImg from "../../assets/blog6.png";

export default function BlogDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  const [comments, setComments] = useState([]);
  const [cLoading, setCLoading] = useState(true);
  const [cErr, setCErr] = useState("");
  const [author, setAuthor] = useState("");
  const [body, setBody] = useState("");

  // --- ADD: load comments when blog/id changes ---
  useEffect(() => {
    if (!id) return;
    let on = true;
    (async () => {
      try {
        setCLoading(true);
        setCErr("");
        const res = await fetch(
          `http://localhost:5050/api/blogs/${id}/comments`
        );
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const data = await res.json();
        if (on) setComments(Array.isArray(data) ? data : []);
      } catch (e) {
        if (on) setCErr("Failed to load comments");
      } finally {
        if (on) setCLoading(false);
      }
    })();
    return () => {
      on = false;
    };
  }, [id]);

  // --- ADD: create comment ---
  const submitComment = async (e) => {
    e.preventDefault();
    if (!body.trim()) return;
    try {
      const payload = {
        author: author.trim() || "Anonymous",
        body: body.trim(),
      };
      // optimistic add
      const temp = {
        id: `temp-${Date.now()}`,
        ...payload,
        createdAt: new Date().toISOString(),
        _optimistic: true,
      };
      setComments((prev) => [temp, ...prev]);
      setBody("");

      const res = await fetch(
        `http://localhost:5050/api/blogs/${id}/comments`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      if (!res.ok) throw new Error("Post failed");
      const saved = await res.json();
      // swap optimistic with saved
      setComments((prev) => [saved, ...prev.filter((c) => c.id !== temp.id)]);
    } catch (e) {
      setCErr("Could not post comment");
      // rollback optimistic
      setComments((prev) => prev.filter((c) => !c._optimistic));
    }
  };

  // --- ADD: delete comment (optional) ---
  const deleteComment = async (commentId) => {
    const old = comments;
    setComments((prev) => prev.filter((c) => c.id !== commentId));
    try {
      const res = await fetch(
        `http://localhost:5050/api/blogs/${id}/comments/${commentId}`,
        {
          method: "DELETE",
        }
      );
      if (!res.ok) throw new Error("Delete failed");
    } catch {
      setComments(old); // rollback
      alert("Delete failed.");
    }
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErr("");
        const res = await fetch(`http://localhost:5050/api/blogs/${id}`);
        if (!res.ok) throw new Error(`Error: ${res.status}`);
        const data = await res.json();
        if (alive) setBlog(data);
      } catch (e) {
        if (alive) setErr("Failed to fetch blog details");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  const imgSrc = useMemo(() => {
    const cover = blog?.coverImageUrl || blog?.imageUrl || "";
    if (!cover) return "";
    return cover.startsWith("http") ? cover : `http://localhost:5050${cover}`;
  }, [blog]);

  // tiny helpers to make the right-side blurb + 3 mini cards
  const allText = blog?.content || "";
  const sentences = useMemo(
    () => allText.split(/(?<=[.!?])\s+/).filter(Boolean),
    [allText]
  );
  const blurb = useMemo(
    () => (sentences[0] ? sentences.slice(0, 2).join(" ") : ""),
    [sentences]
  );
  const cards = useMemo(() => {
    // pick 3 short items; fall back to category/author/date
    const picks = sentences
      .slice(2, 8)
      .filter((s) => s.length < 120)
      .slice(0, 3);
    while (picks.length < 3) {
      const fallbacks = [
        `${blog?.category || "General"} topic`,
        `By ${blog?.author || "Unknown"}`,
        new Date(blog?.date || Date.now()).toLocaleDateString(),
      ];
      picks.push(fallbacks[picks.length] || "—");
    }
    return picks.map((t, i) => ({
      title: i === 0 ? "Key idea" : i === 1 ? "Takeaway" : "Note",
      text: t,
    }));
  }, [sentences, blog]);

  const speak = () => {
    if (!blog?.content) return;
    if (!("speechSynthesis" in window)) {
      alert("Read Aloud not supported.");
      return;
    }
    window.speechSynthesis.cancel();
    const utter = new SpeechSynthesisUtterance(
      `${blog.title}. ${blog.content}`
    );
    utter.rate = 0.95;
    window.speechSynthesis.speak(utter);
  };
  const stopSpeak = () => window.speechSynthesis?.cancel();
  
//Delete Blog
  const handleDelete = async () => {
    if (!window.confirm(`Delete “${blog?.title}”? This can’t be undone.`))
      return;
    const res = await fetch(`http://localhost:5050/api/blogs/${id}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert("Delete failed.");
      return;
    }
    navigate("/blogs");
  };

  if (loading) return <div className="nm-loading">Loading…</div>;
  if (err) return <div className="nm-error">{err}</div>;
  if (!blog) return null;

  return (
    <div className="nm-wrap">
      {/* tablet frame corner like the screenshot */}
      <div className="nm-glass-card">
        <div className="nm-actions">
          <Link to="/blogs" className="nm-chip">
            ← Back
          </Link>
          <div className="flex-spacer" />
        </div>
        {/* HERO: left = image, right = title + blurb + mini cards */}
        <section className="nm-hero">
          <div className="nm-hero-left">
            {imgSrc ? (
              <img className="nm-hero-img" src={imgSrc} alt="" />
            ) : (
              // <div className="nm-hero-img fallback" aria-hidden="true">
              <img className="nm-hero-img" src={blogImg} alt="" />
              // </div>
            )}
            <div className="nm-bubbles" aria-hidden="true">
              <span />
              <span />
              <span />
            </div>
          </div>

          <div className="nm-hero-right">
            <div className="nm-toplinks">
              <span className="nm-link">Profile</span>
              
            </div>

            <div className="nm-titleblock">
              <h1 className="nm-title">
                {blog.title.split(" ").slice(0, 2).join(" ").toUpperCase()}
              </h1>
              <h1 className="nm-title nm-title-2">
                {blog.title.split(" ").slice(2).join(" ").toUpperCase()}
              </h1>
              <p className="nm-blurb">
                {blurb || "A quick overview of this article."}
              </p>
            </div>

            <div className="nm-mini-cards">
              {cards.map((c, idx) => (
                <div key={idx} className="nm-mini">
                  <div
                    className={`nm-mini-thumb t${idx + 1}`}
                    aria-hidden="true"
                  >
                    ★
                  </div>
                  <div className="nm-mini-copy">
                    <h4>{c.title}</h4>
                    <p>{c.text}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="nm-ctas">
              <button className="nm-btn buy" onClick={speak}>
                READ ALOUD
              </button>
              <Link to="#" className="nm-btn ghost" onClick={stopSpeak}>
                STOP
              </Link>
            </div>
          </div>
        </section>

        {/* actions like edit/delete/back */}
        <div className="nm-actions">
          <Link to="/blogs" className="nm-chip">
            ← Back
          </Link>
          <div className="flex-spacer" />
          <button
            className="nm-chip edit"
            onClick={() => navigate(`/blogs/edit/${id}`)}
          >
            Edit
          </button>
          <button className="nm-chip danger" onClick={handleDelete}>
            Delete
          </button>
        </div>

        {/* article body */}
        <article className="nm-article">
          {blog.content.split(/\n{2,}|\r\n\r\n/).map((p, i) => (
            <p key={i}>{p.trim()}</p>
          ))}
        </article>

        {/* ----- Comments Section ----- */}
        <section className="nm-comments">
          <div className="nm-comments-top">
            <h2>Comments</h2>
            <span className="nm-count">{comments.length}</span>
          </div>

          <form className="nm-comment-form" onSubmit={submitComment}>
            <div className="row">
              <input
                className="nm-input"
                type="text"
                placeholder="Your name (optional)"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
              />
            </div>
            <textarea
              className="nm-textarea"
              rows={3}
              placeholder="Write a friendly comment… (Ctrl/⌘+Enter to send)"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              onKeyDown={(e) => {
                if ((e.metaKey || e.ctrlKey) && e.key === "Enter")
                  submitComment(e);
              }}
            />
            <div className="nm-form-actions">
              <button type="submit" className="nm-btn buy">
                Post Comment
              </button>
            </div>
          </form>

          {cLoading && <div className="nm-cstatus">Loading comments…</div>}
          {cErr && <div className="nm-cerror">{cErr}</div>}

          <ul className="nm-comment-list">
            {comments.map((c) => (
              <li key={c.id} className="nm-comment">
                <div className="nm-avatar" aria-hidden="true">
                  {(c.author || "A").trim().charAt(0).toUpperCase()}
                </div>
                <div className="nm-cbody">
                  <div className="nm-chead">
                    <span className="nm-cname">{c.author || "Anonymous"}</span>
                    <time className="nm-ctime">
                      {new Date(c.createdAt || Date.now()).toLocaleString()}
                    </time>
                    <button
                      className="nm-cdel"
                      title="Delete"
                      onClick={() => deleteComment(c.id)}
                    >
                      ✕
                    </button>
                  </div>
                  <p>{c.body}</p>
                </div>
              </li>
            ))}
          </ul>
        </section>
      </div>
    </div>
  );
}
