// src/pages/mentor/ThresholdEditor.jsx
import { useEffect, useState } from "react";
import { ThresholdsAPI } from "../../api/http";

const EMOTIONS = ["happy","sad","angry","surprised"];

export default function ThresholdEditor(){
  const [childId, setChildId] = useState("");
  const [emotion, setEmotion] = useState("happy");
  const [form, setForm] = useState({ level:1, threshold:0.75, holdMs:1000 });
  const [msg, setMsg] = useState("");

  async function load(){
    if (!childId) return;
    setMsg("Loading…");
    try{
      const x = await ThresholdsAPI.get(childId, emotion);
      setForm({
        level: x.level ?? 1,
        threshold: x.threshold ?? 0.75,
        holdMs: x.holdMs ?? 1000,
      });
      setMsg("Loaded");
    }catch{
      setForm({ level:1, threshold:0.75, holdMs:1000 });
      setMsg("Not set (using defaults)");
    }
  }
  useEffect(()=>{ load(); }, [childId, emotion]);

  async function save(){
    if (!childId) return alert("Enter childId");
    const x = await ThresholdsAPI.set(childId, emotion, form);
    setMsg("Saved!");
  }

  return (
    <div style={{padding:16, maxWidth:460}}>
      <h2>Mentor: Difficulty Settings</h2>
      <label>Child ID
        <input value={childId} onChange={e=>setChildId(e.target.value)} placeholder="child-001"
               style={{display:"block",width:"100%",margin:"6px 0 10px"}}/>
      </label>
      <label>Emotion
        <select value={emotion} onChange={e=>setEmotion(e.target.value)} style={{display:"block",margin:"6px 0 10px"}}>
          {EMOTIONS.map(e=><option key={e} value={e}>{e}</option>)}
        </select>
      </label>
      <label>Level
        <input type="number" value={form.level} onChange={e=>setForm({...form, level:Number(e.target.value)})}
               style={{display:"block",width:"100%",margin:"6px 0 10px"}}/>
      </label>
      <label>Threshold (0.0–1.0)
        <input type="number" step="0.01" min="0" max="1"
               value={form.threshold} onChange={e=>setForm({...form, threshold:Number(e.target.value)})}
               style={{display:"block",width:"100%",margin:"6px 0 10px"}}/>
      </label>
      <label>Hold (ms)
        <input type="number" min="0"
               value={form.holdMs} onChange={e=>setForm({...form, holdMs:Number(e.target.value)})}
               style={{display:"block",width:"100%",margin:"6px 0 10px"}}/>
      </label>
      <button onClick={save} style={{marginTop:8}}>Save</button>
      <div style={{marginTop:10, color:"#537389"}}>{msg}</div>
    </div>
  );
}
