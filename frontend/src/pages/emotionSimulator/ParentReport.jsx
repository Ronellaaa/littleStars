// src/pages/reports/ParentReport.jsx
import { useEffect, useState } from "react";
import { AttemptsAPI } from "../../api/http";
import { ChildSettingsAPI } from "../../api/http";

export default function ParentReport(){
  const [childId] = useState(() => JSON.parse(localStorage.getItem("user")||"null")?.sub || "child-001");
  const [rows, setRows] = useState([]);
  const [share, setShare] = useState(false);

  useEffect(() => { (async () => {
    const list = await AttemptsAPI.list({ childId, limit:50 });
    setRows(list);
    const s = await ChildSettingsAPI.get(childId);
    setShare(!!s.shareWithMentor);
  })(); }, [childId]);

  async function toggleShare(){
    const x = !share; setShare(x);
    await ChildSettingsAPI.set(childId, { shareWithMentor:x });
  }

  return (
    <div style={{padding:16}}>
      <h2>My Child’s Progress</h2>
      <label style={{display:"flex",gap:8,alignItems:"center",marginBottom:12}}>
        <input type="checkbox" checked={share} onChange={toggleShare}/>
        Share this report with our mentor
      </label>
      <table style={{width:"100%",borderCollapse:"collapse"}}>
        <thead><tr><th align="left">When</th><th>Scenario</th><th>Target</th><th>Score</th><th>Stars</th><th>Passed</th></tr></thead>
        <tbody>
          {rows.map(r=>(
            <tr key={r._id} style={{borderTop:"1px solid #e6eef5"}}>
              <td>{new Date(r.createdAt).toLocaleString()}</td>
              <td>{r.scenario}</td>
              <td style={{textTransform:"capitalize"}}>{r.emotionName}</td>
              <td>{Math.round((r.score||0)*100)}%</td>
              <td>{r.stars||0}</td>
              <td>{r.passed ? "✅" : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
