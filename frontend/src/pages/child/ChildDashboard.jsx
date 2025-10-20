import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChildRoutinesAPI } from "../../api/http";
import "../../styles/child/child-dashboard.css";

export default function ChildDashboard() {
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [childData, setChildData] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check if child is authenticated
    const childAuth = localStorage.getItem("childAuth");
    if (!childAuth) {
      navigate("/child/login");
      return;
    }

    try {
      const authData = JSON.parse(childAuth);
      setChildData(authData);
      loadRoutines();
    } catch (err) {
      console.error("Error parsing child auth data:", err);
      navigate("/child/login");
    }
  }, [navigate]);

  const loadRoutines = async () => {
    try {
      setLoading(true);
      const routinesData = await ChildRoutinesAPI.list();
      setRoutines(routinesData);
    } catch (err) {
      setError(err.message || "Failed to load routines");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("childAuth");
    navigate("/child/login");
  };

  const startRoutine = (routine) => {
    navigate(`/child/routine/${routine._id}`);
  };

  const getRoutineStatusIcon = (routine) => {
    const progress = routine.progress;
    if (!progress || progress.status === "not_started") return "🎯";
    if (progress.status === "completed") return "✅";
    if (progress.status === "in_progress") return "⏳";
    if (progress.status === "paused") return "⏸️";
    return "🎯";
  };

  const getRoutineStatusText = (routine) => {
    const progress = routine.progress;
    if (!progress || progress.status === "not_started") return "Ready to Start";
    if (progress.status === "completed") return "Completed! 🎉";
    if (progress.status === "in_progress") return `Step ${progress.currentStep + 1} of ${routine.steps.length}`;
    if (progress.status === "paused") return "Paused";
    return "Ready to Start";
  };

  const formatTime = (timeString) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
  };

  if (loading) {
    return (
      <div className="child-dashboard-container">
        <div className="loading-spinner">
          <div className="spinner">⭐</div>
          <p>Loading your routines...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="child-dashboard-container">
      <header className="child-dashboard-header">
        <div className="header-content">
          <div className="welcome-section">
            <h1>Hello, {childData?.child?.name || "Star Explorer"}! ⭐</h1>
            <p>Ready for your daily adventures?</p>
          </div>
          <button className="logout-btn" onClick={handleLogout}>
            👋 Bye
          </button>
        </div>
      </header>

      <main className="child-dashboard-main">
        {error && (
          <div className="error-message">
            <p>{error}</p>
            <button onClick={loadRoutines}>Try Again</button>
          </div>
        )}

        {routines.length === 0 && !error ? (
          <div className="no-routines">
            <div className="no-routines-icon">🌟</div>
            <h2>No routines yet!</h2>
            <p>Ask your parent to create some fun routines for you!</p>
          </div>
        ) : (
          <div className="routines-section">
            <h2>Today's Routines</h2>
            <div className="routines-grid">
              {routines.map((routine) => (
                <div key={routine._id} className="routine-card">
                  <div className="routine-header">
                    <div className="routine-status">
                      <span className="status-icon">
                        {getRoutineStatusIcon(routine)}
                      </span>
                      <span className="status-text">
                        {getRoutineStatusText(routine)}
                      </span>
                    </div>
                    <div className="routine-time">
                      {routine.steps.length > 0 && formatTime(routine.steps[0].startTime)}
                    </div>
                  </div>

                  <div className="routine-content">
                    <h3>{routine.name}</h3>
                    {routine.description && (
                      <p className="routine-description">{routine.description}</p>
                    )}
                    
                    <div className="routine-steps-preview">
                      <div className="steps-count">
                        {routine.steps.length} activities
                      </div>
                      <div className="steps-icons">
                        {routine.steps.slice(0, 4).map((step, index) => (
                          <div key={index} className="step-icon">
                            {step.activity?.icon || "📋"}
                          </div>
                        ))}
                        {routine.steps.length > 4 && (
                          <div className="step-icon more">+{routine.steps.length - 4}</div>
                        )}
                      </div>
                    </div>

                    {routine.progress && routine.progress.status === "in_progress" && (
                      <div className="progress-bar">
                        <div 
                          className="progress-fill" 
                          style={{ 
                            width: `${(routine.progress.completedSteps.length / routine.steps.length) * 100}%` 
                          }}
                        ></div>
                      </div>
                    )}
                  </div>

                  <div className="routine-actions">
                    <button 
                      className="start-routine-btn"
                      onClick={() => startRoutine(routine)}
                    >
                      {routine.progress?.status === "completed" ? "View Routine" :
                       routine.progress?.status === "in_progress" ? "Continue" :
                       routine.progress?.status === "paused" ? "Resume" :
                       "Start Routine"} 🚀
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <div className="floating-elements">
        <div className="floating-star star-1">⭐</div>
        <div className="floating-star star-2">🌟</div>
        <div className="floating-star star-3">✨</div>
      </div>
    </div>
  );
}
