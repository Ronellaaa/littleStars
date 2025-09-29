import { useState, useEffect, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";
import "../../styles/blogsStyles/AddBlogs.css";
import Lottie from "lottie-react";
import dragon from "../../assets/animations/dragon.json";

export default function AddBlogs() {
  const [title, setTitle] = useState("");
  const [author, setAuthor] = useState("");
  const [date, setDate] = useState("");
  const [content, setContent] = useState("");
  const [category, setCategory] = useState("");
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [wordCount, setWordCount] = useState(0);
  const [errors, setErrors] = useState([]);

  const [formData, setFormData] = useState({
    title: "",
    author: "",
    date: "",
    category: "",
    content: "",
    imageFile: null,
  });

  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };
  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setFormData((prev) => ({ ...prev, imageFile: file }));
    setImagePreview(file ? URL.createObjectURL(file) : null);
  };

  useEffect(() => {
    const today = new Date();
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, "0");
    const dd = String(today.getDate()).padStart(2, "0");
    setDate(`${yyyy}-${mm}-${dd}`);
  }, []);

  useEffect(() => {
    if (!imageFile) {
      setImagePreview(null);
      return;
    }
    const url = URL.createObjectURL(imageFile);
    setImagePreview(url);
    return () => URL.revokeObjectURL(url);
  }, [imageFile]);

  const handleChangeContent = (e) => {
    const newTexts = e.target.value;
    setContent(newTexts);

    const textCount = newTexts
      .trim()
      .split(" ")
      .filter((newText) => newText != "");
    setWordCount(textCount.length);
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
    if (imageFile) fd.append("imageFile", imageFile);
    try {
      const res = await axios.post("http://localhost:5050/api/blogs", fd);
      // success
      if (imagePreview) URL.revokeObjectURL(imagePreview);
      setTitle("");
      setAuthor("");
      setDate("");
      setCategory("");
      setContent("");
      setImageFile(null);
      setImagePreview(null);
      setWordCount(0);
      navigate("/blogs");
    } catch (err) {
      const msg = err?.response?.data?.message || "Failed to add blog";
      setErrors([msg]);
    }

    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setFormData({
      title: "",
      author: "",
      date: "",
      category: "",
      content: "",
      imageFile: null,
    });
    setImagePreview(null);
    setWordCount(0);

    navigate("/blogs");
  };

  return (
    <>
      <div className="add-blogs-page">
        <main className="add-blog-container">
          <header className="page-head">
            <h1 className="page-title">
              ✍️ Add a new Blog
              <span className="sub">easy • friendly • calm</span>
            </h1>
            <Link className="soft-link" to="/blogs">
              ← Back to Blogs
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
                name="imageFile" // <-- add this
                type="file"
                accept="image/*"
                onChange={(e) => setImageFile(e.target.files?.[0] || null)}
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
                  <span className="button-82-front text">
                Add Blog
                </span>
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
