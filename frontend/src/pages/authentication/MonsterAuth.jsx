// src/pages/authentication/MonsterAuth.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthAPI } from "../../api/http"; // adjust path if needed
import "../../styles/authenticationStyles/monster-auth.css";
import { useLocation } from "react-router-dom";
import { ChildrenAPI } from "../../api/http";



export default function MonsterAuth() {
  const [mode, setMode] = useState("login");            // "login" | "signup"
  const [vibe, setVibe] = useState("ok");               // "ok" | "error"
  const [form, setForm] = useState({ email: "", password: "", role: "parent" });
  const nav = useNavigate();

const location = useLocation();


  // use names that match your CSS (theme-xxx2)
  const theme = mode === "signup" ? "theme-green2"
               : vibe === "error" ? "theme-red2"
               : "theme-yellow2";

  function onChange(e) {
    const { name, value } = e.target;
    setForm((s) => ({ ...s, [name]: value }));
    if (vibe === "error") setVibe("ok");
  }


  // async function submitLogin(e) {
  //   e.preventDefault();
  //   try {
  //     const user = await AuthAPI.login({ email: form.email, password: form.password });
  //     saveAndGo(user);
  //   } catch (err) {
  //     setVibe("error"); // red monster
  //   }
  // }
function decodeJwt(token) {
  try {
    const part = token.split(".")[1];
    const s = part.replace(/-/g, "+").replace(/_/g, "/");
    const pad = "=".repeat((4 - (s.length % 4)) % 4);
    return JSON.parse(atob(s + pad));
  } catch { return null; }
}


// make it async
async function saveAndGo(user) {
  localStorage.setItem("user", JSON.stringify(user));

  if (user.role === "parent") {
    try {
      // 1) check if parent already has a child
      const kids = await ChildrenAPI.list();
      const child = kids[0] || await ChildrenAPI.create({
        name: `${(user.email || "Child").split("@")[0]}'s child`,
      });

      // 2) store current child for practice/report pages
      localStorage.setItem("currentChild", JSON.stringify({ _id: child._id, name: child.name }));
    } catch (e) {
      // optional: show a toast
      console.error("Could not ensure child profile", e);
    }
    return nav("/lesson", { replace: true });
  }

  // mentors don't need a child in localStorage
  localStorage.removeItem("currentChild");
  return nav("/mentor/reports", { replace: true });
}

// make submit handlers await it
async function submitLogin(e) {
  e.preventDefault();
  try {
    const user = await AuthAPI.login({ email: form.email, password: form.password });
    await saveAndGo(user);
  } catch {
    setVibe("error");
  }
}
async function submitSignup(e) {
  e.preventDefault();
  try {
    const user = await AuthAPI.signup({ email: form.email, password: form.password, role: form.role });
    await saveAndGo(user);
  } catch {/* shake, etc. */}
}


  // async function submitSignup(e) {
  //   e.preventDefault();
  //   try {
  //     const user = await AuthAPI.signup({
  //       email: form.email,
  //       password: form.password,
  //       role: form.role, // "parent" | "mentor"
  //     });
  //     saveAndGo(user);
  //   } catch (err) {
  //     // stay green; shake the card on validation/duplicate
  //     const card = document.querySelector(".card2");
  //     card?.classList.add("shake");
  //     setTimeout(() => card?.classList.remove("shake"), 400);
  //   }
  // }

  const onSubmit = mode === "login" ? submitLogin : submitSignup;

  return (
    <div className={`auth-wrap2 ${theme}`}>
      <div className="sky2">
        <div className="panel2">
          <header className="heading2">
            <h1>Welcome,</h1>
            <p>let’s get signed in!</p>
          </header>

          <MonsterSVG angry={vibe === "error"} />

          <form className="card2" onSubmit={onSubmit} autoComplete="on">
            <div className="tabs2">
              <button type="button"
                className={mode === "login" ? "active" : ""}
                onClick={() => { setMode("login"); setVibe("ok"); }}>
                Login
              </button>
              <button type="button"
                className={mode === "signup" ? "active" : ""}
                onClick={() => { setMode("signup"); setVibe("ok"); }}>
                Sign up
              </button>
            </div>

            {/* Email / Password */}
            <label className="input2">
              <input name="email" type="email" placeholder="Email"
                     value={form.email} onChange={onChange} />
            </label>
            <label className="input2">
              <input name="password" type="password" placeholder="Password"
                     value={form.password} onChange={onChange} />
            </label>

            {/* Role picker (only in signup) */}
            {mode === "signup" && (
              <div style={{ display:"flex", gap:12, alignItems:"center" }}>
                <label><input type="radio" name="role" value="parent"
                              checked={form.role === "parent"} onChange={onChange}/> Parent</label>
                <label><input type="radio" name="role" value="mentor"
                              checked={form.role === "mentor"} onChange={onChange}/> Mentor</label>
              </div>
            )}

            {vibe === "error" && mode === "login" && (
              <div className="error2">Oops! Email or password is incorrect.</div>
            )}

            <button className="go2" type="submit">go</button>
          </form>
        </div>
      </div>
    </div>
  );
}

function MonsterSVG({ angry }) {
  return (
    <div className={`monster1 ${angry ? "angry1" : ""}`}>
      <svg viewBox="0 0 500 320" aria-hidden="true">
        <ellipse cx="250" cy="220" rx="220" ry="160" className="body1" />
        <path d="M120,120 C70,70 60,40 110,60 C150,75 170,110 160,130 Z" className="horn1" />
        <path d="M380,120 C430,70 440,40 390,60 C350,75 330,110 340,130 Z" className="horn1" />
        <ellipse cx="250" cy="140" rx="120" ry="90" className="head1" />
        <path d="M200 95 q15 -18 30 0 q15 -18 30 0 q15 -18 30 0" className="fringe1" />
        <circle cx="220" cy="140" r="20" fill="#fff" />
        <circle cx="280" cy="140" r="20" fill="#fff" />
        <circle cx="220" cy="140" r="9" className="pupil1" />
        <circle cx="280" cy="140" r="9" className="pupil1" />
        <path d="M195 126 q25 -18 50 0" className="lid1" />
        <path d="M255 126 q25 -18 50 0" className="lid1" />
        <circle cx="165" cy="230" r="26" className="hand1" />
        <circle cx="335" cy="230" r="26" className="hand1" />
        <rect x="170" y="205" width="160" height="60" rx="12" className="device" />
        <text x="250" y="240" textAnchor="middle" className="device-text">go</text>
      </svg>
    </div>
  );
}
