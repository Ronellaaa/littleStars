// src/pages/mentor/MentorChildProgress.jsx
import { useEffect, useState } from "react";
import { AttemptsAPI } from "../../api/http";
import { useParams } from "react-router-dom";
export default function MentorLayout({ childId: propChildId }) {
  const { childId: routeChildId } = useParams();
  const [stats, setStats] = useState([]);
  const [recent, setRecent] = useState([]);
  const childId = propChildId || routeChildId;
  useEffect(() => {
    if (!childId) return;
    AttemptsAPI.stats({ childId }).then(setStats);
    AttemptsAPI.list({ childId, limit: 10 }).then(setRecent);
  }, [childId]);

  useEffect(() => {
    if (!childId) return;
    AttemptsAPI.stats({ childId }).then(setStats);
    AttemptsAPI.list({ childId, limit: 10 }).then(setRecent);
  }, [childId]);
  if (!childId) return <div style={{ padding: 16 }}>Pick a child</div>;
  return (
    <div style={{ padding: 16 }}>
      <h2>Progress</h2>

      <table
        style={{ width: 420, borderCollapse: "collapse", marginBottom: 16 }}
      >
        <thead>
          <tr>
            <th style={{ textAlign: "left" }}>Emotion</th>
            <th>Attempts</th>
            <th>Pass %</th>
            <th>Avg ⭐</th>
            <th>Avg Score</th>
          </tr>
        </thead>
        <tbody>
          {stats.map((e) => (
            <tr key={e.emotion}>
              <td>{e.emotion}</td>
              <td style={{ textAlign: "center" }}>{e.attempts}</td>
              <td style={{ textAlign: "center" }}>
                {Math.round(e.passRate * 100)}%
              </td>
              <td style={{ textAlign: "center" }}>{e.avgStars?.toFixed(2)}</td>
              <td style={{ textAlign: "center" }}>{e.avgScore?.toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h3>Recent attempts</h3>
      <ul>
        {recent.map((a) => (
          <li key={a._id}>
            [{new Date(a.createdAt).toLocaleString()}] {a.emotionName} —{" "}
            {a.scenario} — score {a.score} — {a.passed ? "✅" : "❌"} — ⭐
            {a.stars}
          </li>
        ))}
      </ul>
    </div>
  );
}
