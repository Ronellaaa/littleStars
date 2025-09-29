import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChildAuthAPI } from "../../api/http";
import "../../styles/child/child-auth.css";

export default function ChildAuth() {
  const [form, setForm] = useState({ username: "", pin: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.username.trim() || !form.pin.trim()) {
      setError("Please enter both username and PIN");
      return;
    }

    setLoading(true);
    try {
      const response = await ChildAuthAPI.login({
        username: form.username.trim(),
        pin: form.pin.trim()
      });

      // Store child auth data
      localStorage.setItem("childAuth", JSON.stringify({
        token: response.token,
        child: response.child,
        username: response.username,
        theme: response.theme
      }));

      navigate("/child/dashboard");
    } catch (err) {
      setError(err.message || "Login failed. Please try again!");
    } finally {
      setLoading(false);
    }
  };

  const handlePinInput = (digit) => {
    if (form.pin.length < 6) {
      setForm(prev => ({ ...prev, pin: prev.pin + digit }));
    }
  };

  const handlePinBackspace = () => {
    setForm(prev => ({ ...prev, pin: prev.pin.slice(0, -1) }));
  };

  return (
    <div className="child-auth-container">
      <div className="child-auth-card">
        <div className="child-auth-header">
          <div className="star-icon">⭐</div>
          <h1>Little Stars</h1>
          <p>Login to see your routines!</p>
        </div>

        <form onSubmit={handleSubmit} className="child-auth-form">
          <div className="form-group">
            <label htmlFor="username">Username</label>
            <input
              type="text"
              id="username"
              name="username"
              value={form.username}
              onChange={handleChange}
              placeholder="Enter your username"
              className="child-input"
              autoComplete="username"
            />
          </div>

          <div className="form-group">
            <label htmlFor="pin">PIN</label>
            <div className="pin-display">
              {Array.from({ length: 6 }, (_, i) => (
                <div
                  key={i}
                  className={`pin-dot ${i < form.pin.length ? 'filled' : ''}`}
                >
                  {i < form.pin.length ? '●' : '○'}
                </div>
              ))}
            </div>
          </div>

          <div className="pin-keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map(digit => (
              <button
                key={digit}
                type="button"
                className="pin-key"
                onClick={() => handlePinInput(digit.toString())}
                disabled={form.pin.length >= 6}
              >
                {digit}
              </button>
            ))}
            <button
              type="button"
              className="pin-key"
              onClick={() => handlePinInput('0')}
              disabled={form.pin.length >= 6}
            >
              0
            </button>
            <button
              type="button"
              className="pin-key backspace-key"
              onClick={handlePinBackspace}
              disabled={form.pin.length === 0}
            >
              ⌫
            </button>
          </div>

          {error && <div className="error-message">{error}</div>}

          <button
            type="submit"
            className="child-login-btn"
            disabled={loading || !form.username.trim() || !form.pin.trim()}
          >
            {loading ? "Logging in..." : "Let's Go! 🚀"}
          </button>
        </form>

        <div className="child-auth-footer">
          <p>Ask your parent to help if you forgot your login!</p>
          <button
            type="button"
            className="parent-login-link"
            onClick={() => navigate("/")}
          >
            Parent Login
          </button>
        </div>
      </div>

      <div className="floating-stars">
        <div className="star star-1">⭐</div>
        <div className="star star-2">🌟</div>
        <div className="star star-3">✨</div>
        <div className="star star-4">⭐</div>
        <div className="star star-5">🌟</div>
      </div>
    </div>
  );
}
