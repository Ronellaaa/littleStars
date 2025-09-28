// src/pages/parent/ChildReport.jsx
import { useEffect, useState } from "react";
import { AttemptsAPI } from "../../api/http";

export default function ChildReport({ childId, refresh = 0 }) {
  const [stats, setStats] = useState([]);
  const [err, setErr] = useState(null);

  useEffect(() => {
    if (!childId) return;
    setErr(null);
    AttemptsAPI.stats({ childId })
      .then(setStats)
      .catch(e => setErr(e?.message || "Could not load progress"));
  }, [childId, refresh]); // 👈 refresh when a new attempt is logged

  return (
    <div style={{ padding: 16 }}>
      <h2>My Child’s Progress</h2>
      {err && <div style={{ color: "#b00", fontSize: 12 }}>{err}</div>}
      {stats.length === 0 && !err && (
        <div style={{ fontSize: 13, opacity: 0.7 }}>No data yet — try passing a scenario.</div>
      )}
      {stats.map(s => (
        <div key={s.emotion}>
          <b>{s.emotion}</b>: {Math.round(s.passRate * 100)}% pass, avg ⭐ {s.avgStars?.toFixed(2)} (from {s.attempts} attempts)
        </div>
      ))}
    </div>
  );
}
