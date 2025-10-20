// src/pages/authentication/MonsterAuth.jsx
import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { AuthAPI, ChildrenAPI } from "../../api/http";
import "../../styles/authenticationStyles/monster-auth.css";

export default function MonsterAuth() {
  const [mode, setMode] = useState("login");     // "login" | "signup"
  const [vibe, setVibe] = useState("ok");        // "ok" | "error"
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [remember] = useState(true);             // storage choice; toggle UI is commented out

  const [form, setForm] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    role: "parent",
  });

  const [errors, setErrors] = useState({});
  const nav = useNavigate();
  const location = useLocation();

  // theme -> error = red, signup = green, otherwise yellow
  const theme =
    mode === "signup" ? "theme-green2" : vibe === "error" ? "theme-red2" : "theme-yellow2";

  function validateField(name, value, wholeForm, currentMode) {
    switch (name) {
      case "email":
        if (!value) return "Email is required.";
        if (!/\S+@\S+\.\S+/.test(value)) return "Enter a valid email address.";
        return "";
      case "password":
        if (!value) return "Password is required.";
        if (value.length < 6) return "Password must be at least 6 characters.";
        if (currentMode === "signup" && wholeForm.confirmPassword && value !== wholeForm.confirmPassword)
          return "Passwords do not match.";
        return "";
      case "confirmPassword":
        if (currentMode === "signup") {
          if (!value) return "Please confirm your password.";
          if (value !== wholeForm.password) return "Passwords do not match.";
        }
        return "";
      case "role":
        if (currentMode === "signup" && !["parent", "mentor"].includes(value))
          return "Please select a role.";
        return "";
      default:
        return "";
    }
  }

  function validateForm(currentMode, data) {
    const e = {};
    e.email = validateField("email", data.email, data, currentMode);
    e.password = validateField("password", data.password, data, currentMode);
    if (currentMode === "signup") {
      e.confirmPassword = validateField("confirmPassword", data.confirmPassword, data, currentMode);
      e.role = validateField("role", data.role, data, currentMode);
    }
    // strip empty messages
    Object.keys(e).forEach((k) => !e[k] && delete e[k]);
    return e;
  }

  function onChange(e) {
    const { name, value, type, checked } = e.target;
    const val = type === "checkbox" ? checked : value;
    setForm((s) => ({ ...s, [name]: val }));
    // live-validate just this field
    setErrors((prev) => {
      const next = { ...prev };
      const { [name]: _ignored, ...rest } = next;
      const single = validateField(name, val, { ...form, [name]: val }, mode);
      return { ...rest, ...(single ? { [name]: single } : {}) };
    });
    if (vibe === "error") setVibe("ok");
  }

  async function saveAndGo(user) {
    const store = remember ? localStorage : sessionStorage;
    store.setItem("user", JSON.stringify(user));

    if (user.role === "parent") {
      try {
        const kids = await ChildrenAPI.list();
        const child =
          kids?.[0] ||
          (await ChildrenAPI.create({
            name: `${(user.email || "Child").split("@")[0]}'s child`,
          }));

        store.setItem("currentChild", JSON.stringify({ _id: child._id, name: child.name }));
      } catch (e) {
        console.error("Could not ensure child profile", e);
      }
      const backTo = location.state?.from ?? "/";
      return nav(backTo, { replace: true });
    }

    // mentor
    store.removeItem("currentChild");
    const backTo = location.state?.from ?? "/mentor/reports";
    return nav(backTo, { replace: true });
  }


// make it async
// Simplified parent flow: no auto child creation, go to /routines
async function saveAndGo(user) {
  const store = remember ? localStorage : sessionStorage;
  store.setItem("user", JSON.stringify(user));

  // Dispatch global auth event (harmless if nothing listens)
  try {
    window.dispatchEvent(new CustomEvent("authChange", { detail: user }));
  } catch {
    /* ignore if window not defined */
  }

  if (user.role === "parent") {
    // Parents go straight to Routines page
    return nav("/routines", { replace: true });
  }

  // Mentors still go to /mentor/reports
  store.removeItem("currentChild");
  return nav("/mentor/reports", { replace: true });
}


  async function submitSignup(e) {
    e.preventDefault();
    const found = validateForm("signup", form);
    setErrors(found);
    if (Object.keys(found).length) return;

    try {
      setLoading(true);
      const user = await AuthAPI.signup({
        email: form.email,
        password: form.password,
        role: form.role,
      });
      await saveAndGo(user);
    } catch {
      // keep green theme; shake on server-side validation/duplicate, etc.
      const card = document.querySelector(".card20");
      card?.classList.add("shake");
      setTimeout(() => card?.classList.remove("shake"), 400);
    } finally {
      setLoading(false);
    }
  }

  const onSubmit = mode === "login" ? submitLogin : submitSignup;
  const canSubmit =
    !loading &&
    !Object.keys(validateForm(mode, form)).length &&
    form.email &&
    form.password &&
    (mode === "login" || (form.confirmPassword && form.role));

  return (
    <div className={`auth-wrap2 ${theme}`}>
      <div className="sky9">
        <div className="panel2">
          <header className="heading2">
            <h1>Welcome,</h1>
            <p>let’s get signed in!</p>
          </header>

          <MonsterSVG angry={vibe === "error"} />

          <form className="card20" onSubmit={onSubmit} autoComplete="on" noValidate>
            <div className="tabs20">
              <button
                type="button"
                className={mode === "login" ? "active" : ""}
                onClick={() => {
                  setMode("login");
                  setVibe("ok");
                  setErrors({});
                }}
              >
                Login
              </button>
              <button
                type="button"
                className={mode === "signup" ? "active" : ""}
                onClick={() => {
                  setMode("signup");
                  setVibe("ok");
                  setErrors({});
                }}
              >
                Sign up
              </button>
            </div>

            {/* Email */}
            <label className="input2">
              <input
                name="email"
                type="email"
                placeholder="Email"
                value={form.email}
                onChange={onChange}
                aria-invalid={!!errors.email}
                aria-describedby={errors.email ? "err-email" : undefined}
              />
            </label>
            {errors.email && <div id="err-email" className="field-error">{errors.email}</div>}

            {/* Password + toggle */}
            <label className="input2 input2-password">
              <input
                name="password"
                type={showPw ? "text" : "password"}
                placeholder="Password (min 6)"
                value={form.password}
                onChange={onChange}
                aria-invalid={!!errors.password}
                aria-describedby={errors.password ? "err-password" : undefined}
              />
              <button
                className="pw-toggle"
                type="button"
                onClick={() => setShowPw((s) => !s)}
                aria-label={showPw ? "Hide password" : "Show password"}
              >
                {showPw ? "Hide" : "Show"}
              </button>
            </label>
            {errors.password && <div id="err-password" className="field-error">{errors.password}</div>}

            {/* Confirm password + role (signup only) */}
            {mode === "signup" && (
              <>
                <label className="input2">
                  <input
                    name="confirmPassword"
                    type={showPw ? "text" : "password"}
                    placeholder="Confirm password"
                    value={form.confirmPassword}
                    onChange={onChange}
                    aria-invalid={!!errors.confirmPassword}
                    aria-describedby={errors.confirmPassword ? "err-confirm" : undefined}
                  />
                </label>
                {errors.confirmPassword && (
                  <div id="err-confirm" className="field-error">{errors.confirmPassword}</div>
                )}

                <div className="role-row">
                  <label>
                    <input
                      type="radio"
                      name="role"
                      value="parent"
                      checked={form.role === "parent"}
                      onChange={onChange}
                    />{" "}
                    Parent
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="role"
                      value="mentor"
                      checked={form.role === "mentor"}
                      onChange={onChange}
                    />{" "}
                    Mentor
                  </label>
                </div>
                {errors.role && <div className="field-error">{errors.role}</div>}
              </>
            )}

            {vibe === "error" && mode === "login" && (
              <div className="error2">Oops! Email or password is incorrect.</div>
            )}

            <button className="go20" type="submit" disabled={!canSubmit}>
              {loading ? "..." : "go"}
            </button>
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
