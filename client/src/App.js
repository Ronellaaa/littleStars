import { useEffect, useState } from 'react';
import './App.css';
import { fetchProfile, login, register } from './api';
import RoutineBuilder from './components/RoutineBuilder';

const TOKEN_STORAGE_KEY = 'little-stars-token';

function AuthScreen({ onAuthSuccess, authError, clearError }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    timezone: 'UTC',
  });
  const [pending, setPending] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    clearError();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setPending(true);
    clearError();
    try {
      const action = mode === 'login' ? login : register;
      const payload = {
        email: form.email.trim().toLowerCase(),
        password: form.password,
      };
      if (mode === 'register') {
        payload.name = form.name.trim();
        payload.timezone = form.timezone;
      }
      const result = await action(payload);
      onAuthSuccess({ token: result.token });
    } catch (error) {
      clearError(error.message || 'Unable to authenticate');
    } finally {
      setPending(false);
    }
  };

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <h1>Little Stars Routine Builder</h1>
        <p className="auth-subtitle">Sign in to build a routine from the activities library.</p>
        <div className="auth-mode-toggle">
          <button
            type="button"
            className={mode === 'login' ? 'active' : ''}
            onClick={() => { setMode('login'); clearError(); }}
          >
            Sign In
          </button>
          <button
            type="button"
            className={mode === 'register' ? 'active' : ''}
            onClick={() => { setMode('register'); clearError(); }}
          >
            Create Account
          </button>
        </div>
        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'register' && (
            <label>
              <span>Name</span>
              <input
                name="name"
                type="text"
                value={form.name}
                onChange={handleChange}
                required
              />
            </label>
          )}
          <label>
            <span>Email</span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              required
            />
          </label>
          <label>
            <span>Password</span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              required
              minLength={8}
            />
          </label>
          {mode === 'register' && (
            <label>
              <span>Timezone</span>
              <input
                name="timezone"
                type="text"
                value={form.timezone}
                onChange={handleChange}
              />
            </label>
          )}
          {authError && <div className="auth-error">{authError}</div>}
          <button type="submit" disabled={pending}>
            {pending ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
      </div>
    </div>
  );
}

function App() {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_STORAGE_KEY));
  const [profile, setProfile] = useState(null);
  const [profileError, setProfileError] = useState('');
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [authError, setAuthError] = useState('');

  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_STORAGE_KEY, token);
      setLoadingProfile(true);
      fetchProfile(token)
        .then((data) => {
          setProfile({ parent: data.parent, children: data.children });
          setProfileError('');
        })
        .catch((error) => {
          setProfileError(error.message || 'Unable to load profile');
          setToken(null);
          localStorage.removeItem(TOKEN_STORAGE_KEY);
        })
        .finally(() => {
          setLoadingProfile(false);
        });
      return;
    }
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    setProfile(null);
  }, [token]);

  const handleAuthSuccess = ({ token: nextToken }) => {
    setToken(nextToken);
  };

  const handleLogout = () => {
    setToken(null);
    setProfile(null);
    localStorage.removeItem(TOKEN_STORAGE_KEY);
  };

  const handleAuthError = (value) => {
    if (value) {
      setAuthError(value);
    } else if (authError) {
      setAuthError('');
    }
  };

  if (!token) {
    return (
      <AuthScreen
        onAuthSuccess={handleAuthSuccess}
        authError={authError}
        clearError={handleAuthError}
      />
    );
  }

  if (loadingProfile || !profile) {
    return (
      <div className="app-loading">
        <p>Loading your routine builder…</p>
        {profileError && <p className="auth-error">{profileError}</p>}
      </div>
    );
  }

  return (
    <RoutineBuilder
      token={token}
      profile={profile}
      onLogout={handleLogout}
    />
  );
}

export default App;
