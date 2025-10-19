import { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../../styles/blogsStyles/AddBlogs.css";
import Lottie from "lottie-react";
import dragon from "../../assets/animations/dragon.json";

export default function EditBlog() {
  const { id } = useParams();
  const navigate = useNavigate();

  // same state shape / names as AddBlogs
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [errors, setErrors] = useState([]);

  const [loading, setLoading] = useState(true);

  // load existing blog
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        setLoading(true);
        setErrors([]);

        const res = await fetch(`http://localhost:5050/api/blogs/${id}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const b = await res.json();
        if (!alive) return;

        setTitle(b.title || "");
        setAuthor(b.author || "");
        // normalize to yyyy-mm-dd for <input type="date">
        const d = b.date ? new Date(b.date) : new Date();
        setDate(d.toISOString().slice(0, 10));
        setCategory(b.category || "");
        setContent(b.content || "");

        // set preview from existing cover (if any)
        const cover = b.coverImageUrl || b.imageUrl || "";
        if (cover) {
          const full =
            cover.startsWith("http")
              ? cover
              : `http://localhost:5050${cover}`;
          setImagePreview(full);
        } else {
          setImagePreview(null);
        }

        // init word count
        const count = (b.content || "")
          .trim()
          .split(" ")
          .filter((w) => w !== "").length;
        setWordCount(count);
      } catch (e) {
        setErrors(["Failed to load blog"]);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  // handle content typing (kept same as AddBlogs)
  const handleChangeContent = (e) => {
    const newTexts = e.target.value;
    setContent(newTexts);

    const textCount = newTexts
      .trim()
      .split(" ")
      .filter((newText) => newText !== "");
    setWordCount(textCount.length);
  };

  // when user picks a new file, show new preview (replacing old cover preview)
  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      const url = URL.createObjectURL(file);
      setImagePreview(url);
    } else {
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const nextErrors = [];
    if (!title.trim()) nextErrors.push("Title is required");
    if (!author.trim()) nextErrors.push("Author is required");
    if (!date) nextErrors.push("Date is required");
    if (!category) nextErrors.push("Category is required");
    if (!content.trim()) nextErrors.push("Content is required");

    setErrors(nextErrors);
    if (nextErrors.length) return;

    const fd = new FormData();
    fd.append("title", title);
    fd.append("author", author);
    fd.append("date", date);
    fd.append("category", category);
    fd.append("content", content);
    // only send a file if user chose a new one
    if (imageFile) fd.append("imageFile", imageFile);

    try {
      await axios.put(`http://localhost:5050/api/blogs/${id}`, fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // if preview is an object URL, revoke it
      if (imageFile && imagePreview?.startsWith("blob:")) {
        URL.revokeObjectURL(imagePreview);
      }

      // go to detail page
      navigate(`/blogs/${id}`);
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to update blog";
      setErrors([msg]);
    }
  };

  if (loading) return <div className="nm-loading">Loading…</div>;

  return (
    <>
      <div className="add-blogs-page">
        <main className="add-blog-container">
          <header className="page-head">
            <h1 className="page-title">
              ✍️ Edit Blog
              <span className="sub">easy • friendly • calm</span>
            </h1>
            <Link className="soft-link" to={`/blogs/${id}`}>
              ← Back to Blog
            </Link>
          </header>

          {!!errors.length && (
            <div className="alert">
              <ul>
                {errors.map((err, i) => (
                  <li key={i}>{err}</li>
                ))}
              </ul>
            </div>
          )}

          {/* SAME layout / classes as AddBlogs */}
          <form className="calm-card" onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                autoComplete="off"
                required
              />
              <p className="hint">Keep it short and clear.</p>
            </div>

            <div className="form-grid-2">
              <div className="form-group">
                <label htmlFor="author">Author</label>
                <input
                  type="text"
                  id="author"
                  value={author}
                  onChange={(e) => setAuthor(e.target.value)}
                  autoComplete="name"
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="date">Date</label>
                <input
                  type="date"
                  id="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="category">Category</label>
              <select
                id="category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                required
              >
                <option value="" disabled>
                  Select a category
                </option>
                <option value="Q&A">Q&A</option>
                <option value="Tips">Tips</option>
                <option value="Stories">Stories</option>
                <option value="Resources">Resources</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="imageUrl">Upload Cover Image</label>
              <input
                name="imageFile"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
              />
              {imagePreview && (
                <div className="preview-wrap">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className="preview-img"
                  />
                </div>
              )}
              <p className="hint">PNG/JPG. Calm colors are best.</p>
            </div>

            <div className="form-group">
              <label htmlFor="content">Content</label>
              <textarea
                id="content"
                value={content}
                onChange={handleChangeContent}
                required
                rows={8}
              />
              <div className="meta-row">
                <span className="counter">Words: {wordCount}</span>
              </div>
            </div>

            <div className="form-group" style={{ textAlign: "center" }}>
              <button type="submit" className="button-82-pushable">
                <span className="button-82-shadow"></span>
                <span className="button-82-edge"></span>
                <span className="button-82-front text">Save Changes</span>
              </button>
            </div>
          </form>
        </main>

        <aside className="side-illustration" aria-hidden="true">
          <Lottie
            animationData={dragon}
            loop={true}
            autoplay={true}
            className="lottie-illustration"
          />
        </aside>
      </div>
    </>
  );
}
