import { useEffect, useState } from "react";
import { AttemptsAPI } from "../../api/http";

export default function AttemptsPage(){
  const [rows,setRows]=useState([]);
  useEffect(()=>{ AttemptsAPI.list().then(setRows).catch(()=>{}); },[]);
  return (
    <div>
      <h1>Recent Attempts</h1>
      <table className="table">
        <thead><tr>
          <th>When</th><th>Child</th><th>Emotion</th><th>Score</th><th>Stars</th><th>Level</th>
        </tr></thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r._id}>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
              <td>{r.childId}</td>
              <td>{r.emotionName}</td>
              <td>{(r.score*100).toFixed(0)}%</td>
              <td>{r.stars}</td>
              <td>{r.level}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
