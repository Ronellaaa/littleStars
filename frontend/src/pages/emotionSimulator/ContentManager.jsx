// src/pages/mentor/ContentManager.jsx
import { useEffect, useState } from "react";
import { ContentsAPI, uploadFile } from "../../api/http";
import "../../styles/emotionSimulatorStyles/mentor-content.css";

const EMOTIONS = ["happy", "sad", "angry", "surprised"];

export default function ContentManager() {
  const [emotion, setEmotion] = useState("happy");
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // null | item

  const load = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await ContentsAPI.list({ emotion, includeInactive: 1, q });
      setItems(data);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [emotion, q]);

  const startNew = () =>
    setEditing({
      emotionName: emotion,
      title: "",
      description: "",
      coverUrl: "",
      videoUrl: "",
      lottieUrl: "",
      assistantText: "",
      isActive: true,
    });

  const onSave = async (data) => {
    if (data._id) await ContentsAPI.update(data._id, data);
    else await ContentsAPI.create(data);
    setEditing(null);
    load();
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this content?")) return;
    await ContentsAPI.remove(id);
    load();
  };

  return (
    <div className="cm-wrap">
      <header className="cm-bar">
        <h1>Emotion Contents (Mentor)</h1>
        <div className="row">
          <select value={emotion} onChange={(e) => setEmotion(e.target.value)}>
            {EMOTIONS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
          <input
            placeholder="Search title or description..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <button onClick={startNew}>+ New</button>
        </div>
      </header>

      {error && <div className="err">{error}</div>}

      {loading ? (
        <p>Loading…</p>
      ) : (
        <div className="cm-grid">
          {items.map((it) => (
            <article key={it._id} className="cm-card">
              <div className="thumb">
                {it.coverUrl ? (
                  <img src={it.coverUrl} alt={it.title} />
                ) : (
                  <div className="ph">No image</div>
                )}
              </div>
              <div className="meta">
                <h3>{it.title}</h3>
                <div className="badges">
                  <span className={`badge ${it.isActive ? "on" : "off"}`}>
                    {it.isActive ? "Active" : "Hidden"}
                  </span>
                  <span className="badge emo">{it.emotionName}</span>
                </div>
                <p className="desc">
                  {it.description || <em>No description</em>}
                </p>
              </div>
              <footer className="actions">
                <button onClick={() => setEditing(it)}>Edit</button>
                <button className="danger" onClick={() => onDelete(it._id)}>
                  Delete
                </button>
              </footer>
            </article>
          ))}
          {!items.length && <p>No content yet for “{emotion}”.</p>}
        </div>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <ContentForm
            initial={editing}
            onCancel={() => setEditing(null)}
            onSave={onSave}
          />
        </Modal>
      )}
    </div>
  );
}

/* ---------- Form (URL or File for each media) ---------- */
function ContentForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const pickAndUpload = async (e, targetField) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setBusy(true);
      const { url } = await uploadFile(file); // backend returns { url, ... }
      set(targetField, url); // write returned URL into form
    } catch (err) {
      alert(err.message || "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = ""; // reset file input
    }
  };

  const submit = (e) => {
    e.preventDefault();
    if (!form.title?.trim()) return alert("Title is required");
    if (!form.emotionName) return alert("Pick an emotion");
    onSave(form);
  };

  const toEmbed = (url) => {
    try {
      const u = new URL(url);
      if (u.hostname.includes("youtu.be")) {
        return `https://www.youtube.com/embed/${u.pathname.slice(1)}`;
      }
      if (u.hostname.includes("youtube.com")) {
        const v = u.searchParams.get("v");
        if (v) return `https://www.youtube.com/embed/${v}`;
      }
    } catch {}
    return url;
  };

  return (
    <form className="cm-form" onSubmit={submit}>
      <h2>{form._id ? "Edit Content" : "New Content"}</h2>

      <label>
        Emotion
        <select
          value={form.emotionName}
          onChange={(e) => set("emotionName", e.target.value)}
        >
          {["happy", "sad", "angry", "surprised"].map((e) => (
            <option key={e} value={e}>
              {e}
            </option>
          ))}
        </select>
      </label>

      <label>
        Title
        <input
          value={form.title}
          onChange={(e) => set("title", e.target.value)}
        />
      </label>

      <label>
        Description
        <textarea
          rows={3}
          value={form.description || ""}
          onChange={(e) => set("description", e.target.value)}
        />
      </label>

      {/* Cover image: paste URL or upload file */}
      <label>
        Cover Image
        <div className="row">
          <input
            placeholder="Paste image URL (https://...)"
            value={form.coverUrl || ""}
            onChange={(e) => set("coverUrl", e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => pickAndUpload(e, "coverUrl")}
            disabled={busy}
          />
        </div>
        {form.coverUrl && (
          <div className="media-preview">
            <img src={form.coverUrl} alt="" />
          </div>
        )}
      </label>

      {/* Video: YouTube/MP4 URL or upload MP4/WebM */}
      <label>
        Video
        <div className="row">
          <input
            placeholder="Paste YouTube or MP4 URL"
            value={form.videoUrl || ""}
            onChange={(e) => set("videoUrl", e.target.value)}
          />
          <input
            type="file"
            accept="video/mp4,video/webm"
            onChange={(e) => pickAndUpload(e, "videoUrl")}
            disabled={busy}
          />
        </div>
        {form.videoUrl && (
          <div className="media-preview">
            {/youtu\.be|youtube\.com/.test(form.videoUrl) ? (
              <iframe src={toEmbed(form.videoUrl)} allowFullScreen />
            ) : (
              <video src={form.videoUrl} controls />
            )}
          </div>
        )}
      </label>

      {/* Lottie JSON: paste URL or upload .json */}
      <label>
        Lottie JSON
        <div className="row">
          <input
            placeholder="Paste Lottie JSON URL"
            value={form.lottieUrl || ""}
            onChange={(e) => set("lottieUrl", e.target.value)}
          />
          <input
            type="file"
            accept="application/json"
            onChange={(e) => pickAndUpload(e, "lottieUrl")}
            disabled={busy}
          />
        </div>
        {form.lottieUrl && (
          <div className="media-preview">
            <iframe title="lottie" src={form.lottieUrl} />
          </div>
        )}
      </label>

      <label>
        Assistant Text (shown in modal)
        <textarea
          rows={2}
          value={form.assistantText || ""}
          onChange={(e) => set("assistantText", e.target.value)}
        />
      </label>

      <label className="row">
        <input
          type="checkbox"
          checked={!!form.isActive}
          onChange={(e) => set("isActive", e.target.checked)}
        />
        <span>Active (visible to children)</span>
      </label>

      <div className="row end">
        <button type="button" className="ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={busy}>
          {busy ? "Uploading…" : form._id ? "Save" : "Create"}
        </button>
      </div>

      {/* quick preview */}
      <div className="preview">
        <strong>Preview</strong>
        <div className="prev-card">
          <div className="prev-thumb">
            {form.coverUrl ? (
              <img src={form.coverUrl} />
            ) : (
              <div className="ph">No image</div>
            )}
          </div>
          <div className="prev-meta">
            <h4>{form.title || "Untitled"}</h4>
            <p>{form.description || "…"}</p>
          </div>
        </div>
      </div>
    </form>
  );
}

/* ---------- Modal ---------- */
function Modal({ children, onClose }) {
  return (
    <div className="cm-modalWrap" onClick={onClose}>
      <div className="cm-modal" onClick={(e) => e.stopPropagation()}>
        <button className="cm-x" onClick={onClose}>
          ×
        </button>
        {children}
      </div>
    </div>
  );
}
