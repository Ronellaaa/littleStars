// src/pages/mentor/ReportsIndex.jsx
import { useEffect, useState } from "react";
import { ChildrenAPI } from "../../api/http";
import { Link } from "react-router-dom";

export default function ReportsIndex() {
  const [kids, setKids] = useState([]);
  const [q, setQ] = useState("");

  useEffect(() => { ChildrenAPI.list().then(setKids).catch(()=>setKids([])); }, []);

  const list = kids.filter(k => k.name.toLowerCase().includes(q.toLowerCase()));

  return (
    <div className="md-grid">
      <div className="md-card">
        <div className="md-card-header">Children</div>
        <div className="md-card-body">
          <input
            placeholder="Search child..."
            value={q}
            onChange={e=>setQ(e.target.value)}
            style={{width:"100%",padding:"10px 12px",borderRadius:12,border:"1px solid #e5e7eb",marginBottom:12}}
          />
          <table className="md-table">
            <tbody>
              {list.map(k=>(
                <tr className="md-row" key={k._id}>
                  <td><strong>{k.name}</strong><div style={{fontSize:12,color:"#6b7280"}}>{k._id}</div></td>
                  <td style={{textAlign:"right"}}>
                    <Link className="md-pill" to={`/mentor/progress/${k._id}`}>View progress</Link>
                  </td>
                </tr>
              ))}
              {list.length===0 && <tr><td>No children</td></tr>}
            </tbody>
          </table>
        </div>
      </div>

      <div className="md-card">
        <div className="md-card-header">Leaderboard</div>
        <div className="md-card-body">
          <div style={{fontSize:14,opacity:.7}}>Coming soon · aggregate pass rates</div>
        </div>
      </div>
    </div>
  );
}
