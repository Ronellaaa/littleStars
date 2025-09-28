// src/pages/mentor/ScenariosPage.jsx
import { useEffect, useMemo, useState } from "react";
import { ScenariosAPI, uploadFile } from "../../api/http";
import "../../styles/emotionSimulatorStyles/mentor-content.css"; // reuse the same styles

const EMOTIONS = ["happy", "sad", "angry", "surprised"];

export default function ScenariosPage() {
  const [emotion, setEmotion] = useState("happy");
  const [q, setQ] = useState("");
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState(null); // null | item

  async function load() {
    try {
      setLoading(true);
      setError("");
      const data = await ScenariosAPI.list(emotion); // GET /api/scenarios?emotion=...
      setItems(data);
    } catch (e) {
      setError(e.message || "Failed to load scenarios");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, [emotion]);

  const filtered = useMemo(() => {
    const k = q.trim().toLowerCase();
    if (!k) return items;
    return items.filter((s) => (s.text || "").toLowerCase().includes(k));
  }, [items, q]);

  const startNew = () =>
    setEditing({
      emotionName: emotion,
      text: "",
      imageUrl: "",
    });

  const onSave = async (data) => {
    if (!data.text?.trim()) return alert("Scenario text is required");
    if (!data.imageUrl) return alert("Please add an image");
    if (data._id) await ScenariosAPI.update(data._id, data);
    else await ScenariosAPI.create(data);
    setEditing(null);
    load();
  };

  const onDelete = async (id) => {
    if (!confirm("Delete this scenario?")) return;
    await ScenariosAPI.remove(id);
    load();
  };

  return (
    <div className="cm-wrap">
      <header className="cm-bar">
        <h1>Scenarios (Mentor)</h1>
        <div className="row">
          <select value={emotion} onChange={(e) => setEmotion(e.target.value)}>
            {EMOTIONS.map((e) => (
              <option key={e} value={e}>
                {e}
              </option>
            ))}
          </select>
          <input
            placeholder="Search scenario text..."
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
          {filtered.map((it) => (
            <article key={it._id} className="cm-card">
              <div className="thumb">
                {it.imageUrl ? (
                  <img src={it.imageUrl} alt={it.text} />
                ) : (
                  <div className="ph">No image</div>
                )}
              </div>
              <div className="meta">
                <h3>{it.text?.slice(0, 70) || "Untitled scenario"}</h3>
                <div className="badges">
                  <span className="badge emo">{it.emotionName}</span>
                </div>
              </div>
              <footer className="actions">
                <button onClick={() => setEditing(it)}>Edit</button>
                <button className="danger" onClick={() => onDelete(it._id)}>
                  Delete
                </button>
              </footer>
            </article>
          ))}
          {!filtered.length && <p>No scenarios yet for “{emotion}”.</p>}
        </div>
      )}

      {editing && (
        <Modal onClose={() => setEditing(null)}>
          <ScenarioForm
            initial={editing}
            onCancel={() => setEditing(null)}
            onSave={onSave}
          />
        </Modal>
      )}
    </div>
  );
}

/* ---------- Scenario Form (URL or File) ---------- */
function ScenarioForm({ initial, onCancel, onSave }) {
  const [form, setForm] = useState(initial);
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((s) => ({ ...s, [k]: v }));

  const pickAndUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setBusy(true);
      const { url } = await uploadFile(file); // returns absolute URL
      set("imageUrl", url);
    } catch (err) {
      alert(err.message || "Upload failed");
    } finally {
      setBusy(false);
      e.target.value = "";
    }
  };

  const submit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <form className="cm-form" onSubmit={submit}>
      <h2>{form._id ? "Edit Scenario" : "New Scenario"}</h2>

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
        Scenario text
        <input value={form.text} onChange={(e) => set("text", e.target.value)} />
      </label>

      <label>
        Image
        <div className="row">
          <input
            placeholder="Paste image URL (https://...)"
            value={form.imageUrl || ""}
            onChange={(e) => set("imageUrl", e.target.value)}
          />
          <input
            type="file"
            accept="image/*"
            onChange={pickAndUpload}
            disabled={busy}
          />
        </div>
        {form.imageUrl && (
          <div className="media-preview">
            <img src={form.imageUrl} alt="" />
          </div>
        )}
      </label>

      <div className="row end">
        <button type="button" className="ghost" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" disabled={busy}>
          {busy ? "Uploading…" : form._id ? "Save" : "Create"}
        </button>
      </div>
    </form>
  );
}

/* ---------- Modal (shared) ---------- */
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
