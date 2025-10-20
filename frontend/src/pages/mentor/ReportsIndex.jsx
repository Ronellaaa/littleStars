import { useEffect, useState } from "react";
import { AttemptsAPI } from "../../api/http";
import { Link } from "react-router-dom";
import "../../styles/mentor/mentorReports.css";

export default function ReportsIndex() {
  const [data, setData] = useState([]);

  useEffect(() => {
    AttemptsAPI.list({ limit: 200 })
      .then(setData)
      .catch(() => setData([]));
  }, []);

  return (
    <div className="men-wrapper5">
      <div className="men-card5" style={{ gridColumn: "1 / span 2" }}>
        <div className="men-header5">🧒 Child Progress Reports</div>
        <div className="men-body5">
          <input
            className="men-input5"
            placeholder="Search child ID or emotion..."
            onChange={(e) => {
              const v = e.target.value.toLowerCase();
              document.querySelectorAll(".men-row5").forEach((row) => {
                row.style.display = row.textContent.toLowerCase().includes(v)
                  ? ""
                  : "none";
              });
            }}
          />
          <table className="men-table5">
            <thead>
              <tr>
                <th>Child ID</th>
                <th>Emotion</th>
                <th>Scenario</th>
                <th>Score</th>
                <th>Stars</th>
                <th>Difficulty</th>
                <th>Status</th>
                <th>Created</th>
              </tr>
            </thead>
            <tbody>
              {data.map((a) => (
                <tr className="men-row5" key={a._id}>
                  <td>{a.childId}</td>
                  <td><span className="men-badge5">{a.emotionName}</span></td>
                  <td>{a.scenario}</td>
                  <td><span className="men-badge5 star4">{(a.score * 100).toFixed(1)}%</span></td>
                  <td>{a.stars}</td>
                  <td>{a.difficulty}</td>
                  <td>
                    <span className={`men-badge5 ${a.passed ? "ok" : "no"}`}>
                      <span className={`men-dot5 ${a.passed ? "ok" : "no"}`} /> {a.passed ? "Passed" : "Failed"}
                    </span>
                  </td>
                  <td>{new Date(a.createdAt).toLocaleString()}</td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: "center", opacity: 0.7 }}>
                    No data available
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}