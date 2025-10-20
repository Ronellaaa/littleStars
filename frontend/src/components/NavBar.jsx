
// src/components/NavBar.jsx
import { useEffect, useRef, useState } from "react";
import { NavLink, Link, useLocation, useNavigate } from "react-router-dom";
import "../styles/navbar.css";

// If you already have useAuth() context, use that.
// Fallback: read token/email/role from localStorage.
let externalUseAuth;
try {
  // adjust path if your AuthContext lives elsewhere
  externalUseAuth = require("../pages/authentication/MonsterAuth").useAuth;
} catch (_) {}

function useAuthSafe() {
  if (externalUseAuth) return externalUseAuth();
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("user") || "null"); } catch { return null; }
  });
  const navigate = useNavigate();
  
  // Listen for localStorage changes and update state
  useEffect(() => {
    const handleStorageChange = () => {
      try {
        const newUser = JSON.parse(localStorage.getItem("user") || "null");
        setUser(newUser);
      } catch {
        setUser(null);
      }
    };

    const handleAuthChange = (event) => {
      // Custom event from login/signup
      setUser(event.detail);
    };

    // Listen for storage events (from other tabs/windows)
    window.addEventListener('storage', handleStorageChange);
    
    // Listen for custom auth change events (same tab)
    window.addEventListener('authChange', handleAuthChange);
    
    // Fallback: check for changes periodically
    const interval = setInterval(handleStorageChange, 500);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('authChange', handleAuthChange);
      clearInterval(interval);
    };
  }, []);
  
  const logout = () => {
    localStorage.removeItem("user");
    setUser(null);
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent('authChange', { detail: null }));
    navigate("/login", { replace: true });
  };
  return { user, logout, setUser };
}

export default function NavBar() {
  const { user, logout } = useAuthSafe();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [toolsOpen, setToolsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const loc = useLocation();
  const dropdownRef = useRef(null);
  const profileRef = useRef(null);

  // Close menus on route change
  useEffect(() => {
    setMobileOpen(false);
    setToolsOpen(false);
    setProfileOpen(false);
  }, [loc.pathname]);

  // Close when clicking outside
  useEffect(() => {
    const onDocClick = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setToolsOpen(false);
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false);
    };
    document.addEventListener("click", onDocClick);
    return () => document.removeEventListener("click", onDocClick);
  }, []);

  const initial = user?.email?.[0]?.toUpperCase() || "🙂";

  return (
    <header className="ls-nav">
      <div className="ls-nav-inner">
        {/* Brand */}
        <div className="ls-left">
          <button
            className="ls-burger"
            aria-label="Toggle navigation"
            onClick={() => setMobileOpen((v) => !v)}
          >
            <span />
            <span />
            <span />
          </button>
          <Link className="ls-brand" to="/">LittleStars</Link>
        </div>

        {/* Links */}
        <nav className={`ls-links ${mobileOpen ? "open" : ""}`} aria-label="Main">
          <NavLink className="ls-link" to="/">Home</NavLink>
          <NavLink className="ls-link" to="/blogs">Blogs</NavLink>

          {/* Therapy Tools dropdown */}
          <div
            className={`ls-dropdown ${toolsOpen ? "open" : ""}`}
            ref={dropdownRef}
          >
            <button
              className="ls-dropbtn"
              aria-haspopup="true"
              aria-expanded={toolsOpen}
              onClick={() => setToolsOpen((v) => !v)}
            >
              Therapy Tools
              <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M5 7l5 6 5-6" /></svg>
            </button>
            <div className="ls-menu" role="menu">
              {/* Link these to your real routes */}
              <Link className="ls-item" role="menuitem" to="/lesson">Emotion Simulator</Link>
              <Link className="ls-item" role="menuitem" to="/speech-home">Speech Therapy Tool</Link>
              <Link className="ls-item" role="menuitem" to="/routine">Routine Builder</Link>
              <Link className="ls-item" role="menuitem" to="/games">Interactive Games</Link>
              <Link className="ls-item" role="menuitem" to="/virtualNursery">Virtual Nursery</Link>
            </div>
          </div>
        </nav>

        {/* Auth area */}
        <div className="ls-auth">
          {!user ? (
            <div className="ls-auth-cta">
              <Link className="ls-login" to="/login">Login</Link>
              <Link className="ls-signup" to="/login" state={{ mode: "signup" }}>
                Sign up
              </Link>
            </div>
          ) : (
            <div className={`ls-profile ${profileOpen ? "open" : ""}`} ref={profileRef}>
              <button
                className="ls-avatar"
                aria-haspopup="true"
                aria-expanded={profileOpen}
                onClick={() => setProfileOpen((v) => !v)}
                title={user.email}
              >
                {initial}
              </button>
              <div className="ls-profile-menu" role="menu">
                <div className="ls-profile-info">
                  <div className="ls-email">{user.email}</div>
                  <div className="ls-role">{user.role}</div>
                </div>
                <Link className="ls-item" role="menuitem" to="/profile">Profile</Link>
                <button className="ls-item danger" role="menuitem" onClick={logout}>
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>

  );
}
