import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChildRoutinesAPI } from "../../api/http";
import "../../styles/child/routine-timer.css";

export default function RoutineTimer() {
  const { routineId } = useParams();
  const navigate = useNavigate();
  
  const [routine, setRoutine] = useState(null);
  const [currentStep, setCurrentStep] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadRoutine();
  }, [routineId]);

  useEffect(() => {
    let interval = null;
    if (isRunning && timeRemaining > 0) {
      interval = setInterval(() => {
        setTimeRemaining(time => {
          if (time <= 1) {
            setIsRunning(false);
            return 0;
          }
          return time - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isRunning, timeRemaining]);

  const loadRoutine = async () => {
    try {
      setLoading(true);
      const routineData = await ChildRoutinesAPI.get(routineId);
      setRoutine(routineData);
      
      // Set current step based on progress
      const progress = routineData.progress;
      if (progress && progress.currentStep !== undefined) {
        setCurrentStep(progress.currentStep);
        if (progress.status === "completed") {
          setIsCompleted(true);
        }
      }
      
      // Set timer for current step
      const currentStepIndex = progress?.currentStep || 0;
      if (routineData.steps[currentStepIndex]) {
        const stepDuration = routineData.steps[currentStepIndex].durationMin * 60;
        setTimeRemaining(stepDuration);
        console.log("Set timer for step", currentStepIndex, "duration:", stepDuration, "seconds");
        
        // Auto-start the routine if it's not completed
        if (progress?.status !== "completed" && progress?.status !== "paused") {
          console.log("Auto-starting routine");
          startRoutine();
        }
      }
    } catch (err) {
      setError(err.message || "Failed to load routine");
    } finally {
      setLoading(false);
    }
  };

  const startRoutine = async () => {
    try {
      console.log("Starting routine:", routineId);
      await ChildRoutinesAPI.start(routineId);
      setIsRunning(true);
      console.log("Routine started successfully");
    } catch (err) {
      console.error("Failed to start routine:", err);
      setError(err.message || "Failed to start routine");
    }
  };

  const completeStep = async () => {
    try {
      const response = await ChildRoutinesAPI.completeStep(routineId, currentStep);
      
      if (response.isRoutineComplete) {
        setIsCompleted(true);
        setIsRunning(false);
      } else {
        // Move to next step
        const nextStep = currentStep + 1;
        setCurrentStep(nextStep);
        
        if (routine.steps[nextStep]) {
          const nextStepDuration = routine.steps[nextStep].durationMin * 60;
          setTimeRemaining(nextStepDuration);
        }
      }
    } catch (err) {
      setError(err.message || "Failed to complete step");
    }
  };

  const pauseTimer = () => {
    console.log("Pause button clicked");
    setIsRunning(false);
  };

  const resumeTimer = () => {
    console.log("Resume/Start button clicked");
    setIsRunning(true);
  };

  const skipStep = () => {
    console.log("Skip button clicked");
    completeStep();
  };

  const handleCompleteStep = () => {
    console.log("Complete button clicked");
    completeStep();
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getProgressPercentage = () => {
    if (!routine || routine.steps.length === 0) return 0;
    return (currentStep / routine.steps.length) * 100;
  };

  if (loading) {
    return (
      <div className="routine-timer-container">
        <div className="loading">
          <div className="spinner">⭐</div>
          <p>Loading your routine...</p>
        </div>
      </div>
    );
  }

  if (error || !routine) {
    return (
      <div className="routine-timer-container">
        <div className="error">
          <h2>Oops! Something went wrong</h2>
          <p>{error}</p>
          <button onClick={() => navigate("/child/dashboard")}>
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const currentStepData = routine.steps[currentStep];

  if (isCompleted) {
    return (
      <div className="routine-timer-container completion-screen">
        <div className="completion-content">
          <div className="celebration">🎉</div>
          <h1>Amazing Work!</h1>
          <p>You completed the "{routine.name}" routine!</p>
          <div className="stars-earned">
            <span>⭐⭐⭐</span>
            <p>You earned 3 stars!</p>
          </div>
          <button 
            className="back-btn"
            onClick={() => navigate("/child/dashboard")}
          >
            Back to Dashboard 🏠
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="routine-timer-container">
      <header className="timer-header">
        <button 
          className="back-btn small"
          onClick={() => navigate("/child/dashboard")}
        >
          ← Back
        </button>
        <h1>{routine.name}</h1>
        <div className="progress-info">
          Step {currentStep + 1} of {routine.steps.length}
        </div>
      </header>

      <div className="progress-bar-container">
        <div className="progress-bar">
          <div 
            className="progress-fill"
            style={{ width: `${getProgressPercentage()}%` }}
          ></div>
        </div>
        <div className="progress-text">
          {Math.round(getProgressPercentage())}% Complete
        </div>
      </div>

      {currentStepData ? (
        <div className="current-step">
          <div className="step-icon">
            {currentStepData.activity?.icon || "📋"}
          </div>
          
          <h2>{currentStepData.label}</h2>
          
          {currentStepData.activity?.description && (
            <p className="step-description">
              {currentStepData.activity.description}
            </p>
          )}

          <div className="timer-display">
            <div className="timer-circle">
              <div className="timer-text">
                {formatTime(timeRemaining)}
              </div>
              <div className="timer-label">
                {timeRemaining === 0 ? "Time's up!" : "remaining"}
              </div>
            </div>
          </div>

          <div className="timer-controls">
            {!isRunning && timeRemaining > 0 ? (
              <button 
                className="control-btn start" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  resumeTimer();
                }}
              >
                ▶️ Start
              </button>
            ) : (
              <button 
                className="control-btn pause" 
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  pauseTimer();
                }}
              >
                ⏸️ Pause
              </button>
            )}
            
            <button 
              className="control-btn complete" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                handleCompleteStep();
              }}
            >
              ✅ Done
            </button>
            
            <button 
              className="control-btn skip" 
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                skipStep();
              }}
            >
              ⏭️ Skip
            </button>
          </div>

          <div className="step-duration">
            Duration: {currentStepData.durationMin} minutes
          </div>
        </div>
      ) : (
        <div className="no-step">
          <h2>All steps completed!</h2>
          <button onClick={() => setIsCompleted(true)}>
            Finish Routine 🎉
          </button>
        </div>
      )}

      <div className="upcoming-steps">
        <h3>Coming Up Next:</h3>
        <div className="steps-preview">
          {routine.steps.slice(currentStep + 1, currentStep + 4).map((step, index) => (
            <div key={index} className="preview-step">
              <span className="preview-icon">{step.activity?.icon || "📋"}</span>
              <span className="preview-label">{step.label}</span>
              <span className="preview-duration">{step.durationMin}min</span>
            </div>
          ))}
          {routine.steps.length > currentStep + 4 && (
            <div className="preview-step more">
              <span>+{routine.steps.length - currentStep - 4} more</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
