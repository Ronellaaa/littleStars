// src/pages/mentor/MentorChildProgress.jsx
import { useParams } from "react-router-dom";
import { useEffect, useState } from "react";
import { AttemptsAPI } from "../../api/http";

export default function MentorChildProgress() {
  const { childId } = useParams();
  const [stats, setStats] = useState([]);
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    if (!childId) return;
    AttemptsAPI.stats({ childId }).then(setStats);
    AttemptsAPI.list({ childId, limit: 10 }).then(setRecent);
  }, [childId]);

  if (!childId) return <div className="md-card"><div className="md-card-body">Pick a child</div></div>;

  return (
    <div className="md-grid">
      <div className="md-card">
        <div className="md-card-header">Progress</div>
        <div className="md-card-body">
          <table style={{width:"100%",borderCollapse:"collapse"}}>
            <thead>
              <tr><th style={{textAlign:"left"}}>Emotion</th><th>Attempts</th><th>Pass %</th><th>Avg ⭐</th><th>Avg Score</th></tr>
            </thead>
            <tbody>
              {stats.map(e=>(
                <tr key={e.emotion}>
                  <td>{e.emotion}</td>
                  <td style={{textAlign:"center"}}>{e.attempts}</td>
                  <td style={{textAlign:"center"}}>{Math.round(e.passRate*100)}%</td>
                  <td style={{textAlign:"center"}}>{e.avgStars?.toFixed(2)}</td>
                  <td style={{textAlign:"center"}}>{e.avgScore?.toFixed(2)}</td>
                </tr>
              ))}
              {stats.length===0 && <tr><td colSpan={5} style={{opacity:.7}}>No data yet</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md-card">
        <div className="md-card-header">Recent attempts</div>
        <div className="md-card-body">
          <ul style={{margin:0,paddingLeft:18}}>
            {recent.map(a=>(
              <li key={a._id} style={{marginBottom:8}}>
                [{new Date(a.createdAt).toLocaleString()}] {a.emotionName} — {a.scenario} — score {a.score} — {a.passed?"✅":"❌"} — ⭐{a.stars}
              </li>
            ))}
            {recent.length===0 && <li style={{opacity:.7}}>No attempts yet</li>}
          </ul>
        </div>
      </div>
    </div>
  );
}
