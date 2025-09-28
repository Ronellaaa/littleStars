import { useEffect, useRef, useState } from 'react';
import './index.css';
import {
  createActivity,
  createRoutine,
  deleteActivity,
  deleteRoutine,
  fetchActivities,
  fetchRoutines,
  updateRoutine,
} from './services/api';
import { detectOverlaps, hhmmToMinutes, minutesToHHmm, sortByStartTime } from './utils/time';

const generateId = () =>
  globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `step-${Math.random().toString(16).slice(2)}`;

const defaultStartTime = '07:00';

const computeNextStart = (steps) => {
  if (!steps || steps.length === 0) {
    return defaultStartTime;
  }
  const ordered = sortByStartTime(steps);
  const last = ordered[ordered.length - 1];
  try {
    const endMinutes = hhmmToMinutes(last.startTime) + Number(last.durationMin || 0);
    return minutesToHHmm(endMinutes);
  } catch {
    return defaultStartTime;
  }
};

const resolveActivityId = (...candidates) => {
  for (const candidate of candidates) {
    if (!candidate) {
      continue;
    }
    if (typeof candidate === 'string' || typeof candidate === 'number') {
      const id = `${candidate}`.trim();
      if (id) {
        return id;
      }
      continue;
    }
    if (typeof candidate === 'object') {
      if (candidate._id) {
        const id = `${candidate._id}`.trim();
        if (id) {
          return id;
        }
      }
      if (candidate.id) {
        const id = `${candidate.id}`.trim();
        if (id) {
          return id;
        }
      }
    }
  }
  return '';
};
const normalizeTags = (input) => {
  if (Array.isArray(input)) {
    return input
      .map((tag) => `${tag}`.trim())
      .filter(Boolean);
  }
  if (typeof input === 'string') {
    return input
      .split(',')
      .map((token) => token.trim())
      .filter(Boolean);
  }
  return [];
};

const normalizeActivity = (activity) => {
  if (!activity) {
    return null;
  }
  const activityId = resolveActivityId(activity, activity?._id);
  if (!activityId) {
    return null;
  }
  return {
    ...activity,
    _id: activityId,
    name: activity.name || '',
    icon: activity.icon || '',
    description: activity.description || '',
    defaultDurationMin: Number(activity.defaultDurationMin) || 5,
    tags: normalizeTags(activity.tags),
  };
};

const normalizeActivities = (items = []) => items.map(normalizeActivity).filter(Boolean);
const todayDateInput = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const toDateInputValue = (value) => {
  if (!value) {
    return todayDateInput();
  }
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return todayDateInput();
  }
  const year = parsed.getFullYear();
  const month = `${parsed.getMonth() + 1}`.padStart(2, '0');
  const day = `${parsed.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const sortActivitiesByName = (items = []) => [...items].sort((a, b) => a.name.localeCompare(b.name));

const getEndTimeDisplay = (startTime, duration) => {
  try {
    return minutesToHHmm(hhmmToMinutes(startTime) + Number(duration || 0));
  } catch {
    return '--:--';
  }
};

const initialActivityForm = {
  name: '',
  icon: '',
  defaultDurationMin: '5',
  description: '',
  tags: '',
};

function App() {
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState('');

  const [parentName, setParentName] = useState('');
  const [routineName, setRoutineName] = useState('');
  const [description, setDescription] = useState('');
  const [scheduledFor, setScheduledFor] = useState(todayDateInput());
  const [steps, setSteps] = useState([]);

  const [saving, setSaving] = useState(false);
  const [formErrors, setFormErrors] = useState({});
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState('success');

  const [existingRoutines, setExistingRoutines] = useState([]);
  const [routinesError, setRoutinesError] = useState('');

  const [showActivityForm, setShowActivityForm] = useState(false);
  const [activityForm, setActivityForm] = useState(initialActivityForm);
  const [activityFormErrors, setActivityFormErrors] = useState({});
  const [creatingActivity, setCreatingActivity] = useState(false);

  const [editingRoutineId, setEditingRoutineId] = useState('');
  const [routineDeletingId, setRoutineDeletingId] = useState('');

  const libraryRef = useRef(null);
  const heroRef = useRef(null);
  const plannerRef = useRef(null);
  const historyRef = useRef(null);
  const activityManagerRef = useRef(null);

  const scrollToSection = (ref) => {
    if (ref?.current) {
      ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollToLibrary = () => {
    scrollToSection(activityManagerRef);
    setTimeout(() => scrollToSection(libraryRef), 120);
  };

  const totalDuration = steps.reduce((total, step) => total + Number(step.durationMin || 0), 0);
  const nextStartTime = computeNextStart(steps);

  const focusActivityForm = () => {
    setShowActivityForm(true);
    setTimeout(() => scrollToSection(activityManagerRef), 60);
  };

  const focusActivityLibrary = () => {
    setShowActivityForm(false);
    scrollToLibrary();
  };

  const resetRoutine = () => {
    if (editingRoutineId) {
      clearRoutineState({ preserveParentName: true });
      return;
    }
    setSteps([]);
    setFormErrors((prev) => ({ ...prev, steps: undefined }));
  };

  useEffect(() => {
    let isMounted = true;
    fetchActivities()
      .then((data) => {
        if (!isMounted) return;
        const normalized = normalizeActivities(data?.activities || []);
        setActivities(sortActivitiesByName(normalized));
        setActivitiesError('');
        setActivitiesLoading(false);
      })
      .catch((error) => {
        if (!isMounted) return;
        setActivitiesError(error.message || 'Could not load activity library');
        setActivitiesLoading(false);
      });

    fetchRoutines()
      .then((data) => {
        if (!isMounted) return;
        setExistingRoutines(data.routines || []);
      })
      .catch((error) => {
        if (!isMounted) return;
        setRoutinesError(error.message || 'Unable to load routines');
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }
    const timer = setTimeout(() => setFeedback(''), 3500);
    return () => clearTimeout(timer);
  }, [feedback]);

  const addActivityToRoutine = (activity) => {
    if (!activity) {
      return;
    }
    const activityId = resolveActivityId(activity);
    if (!activityId) {
      setFeedbackType('error');
      setFeedback('Unable to add this activity right now. Try refreshing your library.');
      return;
    }
    const duration = activity.defaultDurationMin || 5;
    const newStep = {
      id: generateId(),
      activityId,
      activity,
      label: activity.name,
      startTime: nextStartTime,
      durationMin: Number(duration),
    };
    setSteps((prev) => [...prev, newStep]);
    setFormErrors((prev) => ({ ...prev, steps: undefined }));
  };

  const updateStep = (stepId, updates) => {
    setSteps((prev) => prev.map((step) => (step.id === stepId ? { ...step, ...updates } : step)));
  };

  const removeStep = (stepId) => {
    setSteps((prev) => prev.filter((step) => step.id !== stepId));
  };

  const moveStep = (stepId, direction) => {
    setSteps((prev) => {
      const index = prev.findIndex((step) => step.id === stepId);
      if (index === -1) {
        return prev;
      }
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) {
        return prev;
      }
      const updated = [...prev];
      const [removed] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, removed);
      return updated;
    });
  };

  const validateRoutine = () => {
    const errors = {};
    if (!parentName.trim()) {
      errors.parentName = 'Tell us who is building this routine.';
    }
    if (!routineName.trim()) {
      errors.routineName = 'Give your routine a name.';
    }
    if (steps.length === 0) {
      errors.steps = 'Add at least one step to your routine.';
    }
    for (const step of steps) {
      if (!resolveActivityId(step.activityId, step.activity)) {
        errors.steps = 'Each step needs a valid activity.';
        break;
      }
      if (!/^\d{2}:\d{2}$/.test(step.startTime)) {
        errors.steps = 'Each step needs a valid start time (HH:mm).';
        break;
      }
      if (!Number.isFinite(Number(step.durationMin)) || Number(step.durationMin) <= 0) {
        errors.steps = 'Each step needs a positive duration.';
        break;
      }
    }
    if (detectOverlaps(steps)) {
      errors.steps = 'Steps overlap. Adjust the start time or duration.';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const clearRoutineState = ({ preserveParentName = true } = {}) => {
    if (!preserveParentName) {
      setParentName('');
    }
    setRoutineName('');
    setDescription('');
    setScheduledFor(todayDateInput());
    setSteps([]);
    setFormErrors({});
    setEditingRoutineId('');
  };

  const handleSave = async () => {
    if (!validateRoutine()) {
      setFeedback('Check the form and fix the highlighted issues.');
      setFeedbackType('error');
      return;
    }
    setSaving(true);
    try {
      const payload = {
        parentName: parentName.trim(),
        name: routineName.trim(),
        description: description.trim(),
        scheduledFor,
        steps: steps.map((step) => ({
          activityId: resolveActivityId(step.activityId, step.activity),
          label: step.label?.trim(),
          startTime: step.startTime,
          durationMin: Number(step.durationMin),
        })),
      };

      if (editingRoutineId) {
        const response = await updateRoutine(editingRoutineId, payload);
        setFeedback('Routine updated! Changes saved.');
        setFeedbackType('success');
        if (response?.routine) {
          setExistingRoutines((prev) =>
            prev.map((routine) => (routine._id === editingRoutineId ? response.routine : routine))
          );
          setRoutinesError('');
        }
        clearRoutineState({ preserveParentName: true });
      } else {
        const response = await createRoutine(payload);
        setFeedback('Routine saved! Your child will see it today.');
        setFeedbackType('success');
        clearRoutineState({ preserveParentName: true });
        if (response?.routine) {
          setExistingRoutines((prev) => [response.routine, ...prev]);
          setRoutinesError('');
        }
      }
    } catch (error) {
      setFeedback(error.message || 'Something went wrong while saving.');
      setFeedbackType('error');
    } finally {
      setSaving(false);
    }
  };
  const handleActivityInputChange = (event) => {
    const { name, value } = event.target;
    setActivityForm((prev) => ({ ...prev, [name]: value }));
    setActivityFormErrors((prev) => ({ ...prev, [name]: undefined, general: undefined }));
  };

  const resetActivityForm = () => {
    setActivityForm(initialActivityForm);
    setActivityFormErrors({});
  };

  const handleCreateActivity = async (event) => {
    event.preventDefault();
    const errors = {};
    const trimmedName = activityForm.name.trim();
    const durationValue = Number(activityForm.defaultDurationMin);

    if (!trimmedName) {
      errors.name = 'Give the activity a name.';
    }
    if (!Number.isFinite(durationValue) || durationValue <= 0) {
      errors.defaultDurationMin = 'Duration must be greater than zero.';
    }

    if (Object.keys(errors).length > 0) {
      setActivityFormErrors(errors);
      return;
    }

    setCreatingActivity(true);
    try {
      const payload = {
        name: trimmedName,
        icon: activityForm.icon.trim(),
        defaultDurationMin: durationValue,
        description: activityForm.description.trim(),
        tags: activityForm.tags,
      };
      const response = await createActivity(payload);
      if (response?.activity) {
        const createdActivity = normalizeActivity(response.activity);
        if (createdActivity) {
          setActivities((prev) => {
            const previous = Array.isArray(prev) ? prev : [];
            const filtered = previous.filter((item) => resolveActivityId(item) !== createdActivity._id);
            return sortActivitiesByName([...filtered, createdActivity]);
          });
        }
        setFeedbackType('success');
        setFeedback('Activity added to your library.');
        resetActivityForm();
        setActivitiesError('');
        setShowActivityForm(false);
        (async () => {
          try {
            const latest = await fetchActivities();
            const normalized = normalizeActivities(latest?.activities || []);
            setActivities(sortActivitiesByName(normalized));
            setActivitiesError('');
          } catch (refreshError) {
            console.error('Failed to refresh activities after create', refreshError);
          }
        })();
      }
    } catch (error) {
      setActivityFormErrors((prev) => ({
        ...prev,
        general: error.message || 'Unable to add activity right now.',
      }));
      setFeedbackType('error');
      setFeedback(error.message || 'Unable to add activity right now.');
    } finally {
      setCreatingActivity(false);
    }
  };

  const handleDeleteActivity = async (activityId) => {
    const activity = activities.find((item) => item._id === activityId);
    const confirmMessage = activity
      ? `Remove "${activity.name}" from your library?`
      : 'Remove this activity?';
    if (!window.confirm(confirmMessage)) {
      return;
    }
    try {
      await deleteActivity(activityId);
      const normalizedId = resolveActivityId(activityId);
      setActivities((prev) => prev.filter((item) => item._id !== normalizedId));
      setSteps((prev) => prev.filter((step) => resolveActivityId(step.activityId, step.activity) !== normalizedId));
      setFeedbackType('success');
      setFeedback('Activity removed from library.');
    } catch (error) {
      setFeedbackType('error');
      setFeedback(error.message || 'Unable to delete activity right now.');
    }
  };

  const beginEditRoutine = (routine) => {
    if (!routine?._id) {
      return;
    }
    const activityLookup = new Map(
      activities
        .map((activity) => {
          const id = resolveActivityId(activity);
          return id ? [id, activity] : null;
        })
        .filter(Boolean)
    );
    let missingActivity = false;
    const nextSteps = (routine.steps || []).map((step) => {
      const rawActivity = step.activity;
      const activityId = resolveActivityId(rawActivity, step.activityId);
      if (!activityId) {
        missingActivity = true;
      }
      const fallbackActivity =
        rawActivity && typeof rawActivity === 'object' && rawActivity !== null ? rawActivity : null;
      const resolvedActivity = activityLookup.get(activityId) || fallbackActivity;

      return {
        id: generateId(),
        activityId,
        activity: resolvedActivity || null,
        label: step.label || '',
        startTime: step.startTime,
        durationMin: Number(step.durationMin) || Number(resolvedActivity?.defaultDurationMin) || 5,
      };
    });

    if (missingActivity) {
      setFeedbackType('error');
      setFeedback('Some steps reference missing activities. Re-add them from the library before saving.');
    }

    setParentName(routine.parentName || '');
    setRoutineName(routine.name || '');
    setDescription(routine.description || '');
    setScheduledFor(toDateInputValue(routine.scheduledFor));
    setSteps(nextSteps);
    setFormErrors({});
    setEditingRoutineId(routine._id);
    setShowActivityForm(false);
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeleteRoutine = async (routineId) => {
    if (!routineId) {
      return;
    }
    const routine = existingRoutines.find((item) => item._id === routineId);
    const confirmMessage = routine ? `Delete "${routine.name}"?` : 'Delete this routine?';
    if (!window.confirm(confirmMessage)) {
      return;
    }
    setRoutineDeletingId(routineId);
    try {
      await deleteRoutine(routineId);
      setExistingRoutines((prev) => prev.filter((item) => item._id !== routineId));
      setFeedbackType('success');
      setFeedback('Routine deleted.');
      setRoutinesError('');
      if (editingRoutineId === routineId) {
        clearRoutineState({ preserveParentName: true });
      }
    } catch (error) {
      setFeedbackType('error');
      setFeedback(error.message || 'Unable to delete routine right now.');
    } finally {
      setRoutineDeletingId('');
    }
  };
  const totalActivities = activities.length;
  const plannedSteps = steps.length;
  const totalRoutines = existingRoutines.length;

  return (
    <div className="dashboard-shell">
      <nav className="top-nav">
        <div className="brand">
          <span className="brand-logo">LS</span>
          <div className="brand-copy">
            <strong>Little Stars</strong>
            <span>Routine Studio</span>
          </div>
        </div>
        <div className="nav-links">
          <button type="button" onClick={() => scrollToSection(heroRef)}>Overview</button>
          <button type="button" onClick={() => scrollToSection(plannerRef)}>Planner</button>
          <button type="button" onClick={() => scrollToSection(historyRef)}>History</button>
          <button type="button" onClick={focusActivityLibrary}>Library</button>
        </div>
        <div className="nav-user">
          <div className="avatar">LS</div>
        </div>
      </nav>

      <main className="dashboard-content">
        <section ref={heroRef} className="hero-card">
          <div>
            <p className="hero-kicker">Planner overview</p>
            <h1>Create the perfect routine for your child</h1>
            <p className="hero-sub">
              Drag from your activity library, personalise each step, and publish when everything feels right.
            </p>
          </div>
          <div className="hero-stats">
            <div className="stat-tile">
              <span className="stat-label">Activities</span>
              <strong>{totalActivities}</strong>
            </div>
            <div className="stat-tile">
              <span className="stat-label">Steps in progress</span>
              <strong>{plannedSteps}</strong>
            </div>
            <div className="stat-tile">
              <span className="stat-label">Saved routines</span>
              <strong>{totalRoutines}</strong>
            </div>
          </div>
        </section>

        <div className="layout-grid">
          <div className="layout-main">
            <section ref={plannerRef} className="card routine-builder-card">
              <header className="card-header card-header--tight routine-builder-header">
                <div>
                  <h2>Routine planner</h2>
                  <p>Give your routine a name, choose the day, and line up every activity.</p>
                </div>
                <div className="planner-actions">
                  <button
                    type="button"
                    className="ghost"
                    onClick={resetRoutine}
                    disabled={saving}
                  >
                    {editingRoutineId ? 'Cancel edit' : 'Reset plan'}
                  </button>
                  <button type="button" className="primary" onClick={handleSave} disabled={saving}>
                    {saving
                      ? editingRoutineId
                        ? 'Updating...'
                        : 'Saving...'
                      : editingRoutineId
                      ? 'Update routine'
                      : 'Publish routine'}
                  </button>
                </div>
              </header>
              <div className="card-body routine-builder-body">
                <div className="builder-column form-column">
                  <div className="column-heading">
                    <h3>Routine details</h3>
                    <p>Share the plan with grown-ups before your child sees it.</p>
                  </div>
                  <div className="builder-stats">
                    <div className="builder-stat">
                      <strong>{steps.length}</strong>
                      <span>steps planned</span>
                    </div>
                    <div className="builder-stat">
                      <strong>{totalDuration}</strong>
                      <span>minutes total</span>
                    </div>
                    <div className="builder-stat">
                      <strong>{nextStartTime}</strong>
                      <span>next slot</span>
                    </div>
                  </div>
                  <div className="form-grid">
                    <label className="field">
                      <span>Parent name</span>
                      <input
                        type="text"
                        value={parentName}
                        onChange={(event) => {
                          setParentName(event.target.value);
                          setFormErrors((prev) => ({ ...prev, parentName: undefined }));
                        }}
                        placeholder="e.g. Taylor"
                      />
                      {formErrors.parentName && <small className="error-text">{formErrors.parentName}</small>}
                    </label>
                    <label className="field">
                      <span>Routine name</span>
                      <input
                        type="text"
                        value={routineName}
                        onChange={(event) => {
                          setRoutineName(event.target.value);
                          setFormErrors((prev) => ({ ...prev, routineName: undefined }));
                        }}
                        placeholder="Rise and Shine"
                      />
                      {formErrors.routineName && <small className="error-text">{formErrors.routineName}</small>}
                    </label>
                    <label className="field">
                      <span>Scheduled for</span>
                      <input type="date" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} />
                    </label>
                    <label className="field field--full">
                      <span>Notes for grown-ups (optional)</span>
                      <textarea
                        rows={3}
                        value={description}
                        onChange={(event) => setDescription(event.target.value)}
                        placeholder="Add reminders or helpful context."
                      />
                    </label>
                  </div>
                </div>
                <div className="builder-column timeline-column">
                  <div className="column-heading">
                    <h3>Routine timeline</h3>
                    <p>Rename steps, adjust times, and keep everything in order.</p>
                  </div>
                  <div className="timeline-actions">
                    <button type="button" className="secondary" onClick={focusActivityLibrary}>
                      Add from library
                    </button>
                    <button type="button" className="ghost" onClick={focusActivityForm}>
                      Manage activities
                    </button>
                  </div>
                  <div className="timeline-surface">
                    {formErrors.steps && <p className="error-text">{formErrors.steps}</p>}
                    {steps.length === 0 ? (
                      <div className="timeline-empty">
                        <p>Choose activities from the library to start building your routine.</p>
                        <button type="button" className="secondary" onClick={focusActivityLibrary}>
                          Open activity library
                        </button>
                      </div>
                    ) : (
                      <div className="timeline-scroll">
                        <ul className="timeline-list">
                          {steps.map((step, index) => (
                            <li key={step.id} className="timeline-item">
                              <div className="step-order">
                                <span>{index + 1}</span>
                                <div className="step-order-controls">
                                  <button
                                    type="button"
                                    onClick={() => moveStep(step.id, -1)}
                                    disabled={index === 0}
                                    title="Move up"
                                  >
                                    Up
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => moveStep(step.id, 1)}
                                    disabled={index === steps.length - 1}
                                    title="Move down"
                                  >
                                    Down
                                  </button>
                                </div>
                              </div>
                              <div className="step-details">
                                <div className="step-heading">
                                  <div className="activity-icon large">{step.activity?.icon || '?'}</div>
                                  <div>
                                    <p className="activity-name">{step.activity?.name}</p>
                                    <label>
                                      <span>Label for your child</span>
                                      <input
                                        type="text"
                                        value={step.label}
                                        maxLength={120}
                                        onChange={(event) => updateStep(step.id, { label: event.target.value })}
                                      />
                                    </label>
                                  </div>
                                </div>
                                <div className="step-inputs">
                                  <label>
                                    <span>Start at</span>
                                    <input
                                      type="time"
                                      value={step.startTime}
                                      onChange={(event) => updateStep(step.id, { startTime: event.target.value })}
                                    />
                                  </label>
                                  <label>
                                    <span>Duration (min)</span>
                                    <input
                                      type="number"
                                      min={1}
                                      max={480}
                                      value={step.durationMin}
                                      onChange={(event) =>
                                        updateStep(step.id, { durationMin: Number(event.target.value) })
                                      }
                                    />
                                  </label>
                                  <div className="step-end">
                                    <span>Ends</span>
                                    <strong>{getEndTimeDisplay(step.startTime, step.durationMin)}</strong>
                                  </div>
                                </div>
                              </div>
                              <button type="button" className="remove-step" onClick={() => removeStep(step.id)}>
                                Remove
                              </button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {feedback && <div className={`toast ${feedbackType}`}>{feedback}</div>}

            <section ref={historyRef} className="card history-card">
              <header className="card-header card-header--tight">
                <div>
                  <h2>Recent routines</h2>
                  <p>Everything you have already planned.</p>
                </div>
                <div className="history-summary">
                  <span className="stat-chip">{existingRoutines.length}</span>
                  <span className="summary-label">saved</span>
                </div>
              </header>
              <div className="card-body history-body">
                {routinesError && <p className="error-text">{routinesError}</p>}
                {existingRoutines.length === 0 ? (
                  <div className="empty-state">
                    <p>No routines yet. Create one to see it here.</p>
                  </div>
                ) : (
                  <ul className="history-grid">
                    {existingRoutines.map((routine) => {
                      const isEditing = editingRoutineId === routine._id;
                      return (
                        <li
                          key={routine._id}
                          className={`history-card-item${isEditing ? ' is-editing' : ''}`}
                        >
                          <header className="history-card-header">
                            <div>
                              <strong>{routine.name}</strong>
                              <span className="history-date">
                                {new Date(routine.scheduledFor).toLocaleDateString()}
                              </span>
                            </div>
                            <span className="history-count">{routine.steps?.length || 0} steps</span>
                          </header>
                          <div className="history-steps">
                            {routine.steps?.map((step) => (
                              <span key={`${routine._id}-${step.order}`} className="tag-chip subtle">
                                {step.label}
                              </span>
                            ))}
                          </div>
                          <div className="history-actions">
                            <button
                              type="button"
                              className="ghost"
                              onClick={() => beginEditRoutine(routine)}
                              disabled={saving || routineDeletingId === routine._id}
                            >
                              {isEditing ? 'Editing...' : 'Edit'}
                            </button>
                            <button
                              type="button"
                              className="ghost danger"
                              onClick={() => handleDeleteRoutine(routine._id)}
                              disabled={routineDeletingId === routine._id}
                            >
                              {routineDeletingId === routine._id ? 'Deleting...' : 'Delete'}
                            </button>
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                )}
              </div>
            </section>
          </div>

          <aside className="layout-side">
            <section ref={activityManagerRef} className="card activity-card">
              <header className="card-header card-header--tight">
                <div>
                  <h2>Activity manager</h2>
                  <p>Your personalised library of ready-to-use tasks.</p>
                </div>
                <div className="activity-card-actions">
                  <button
                    type="button"
                    className={`outline${showActivityForm ? ' outline--active' : ''}`}
                    onClick={() => setShowActivityForm((prev) => !prev)}
                  >
                    {showActivityForm ? 'Close form' : 'New activity'}
                  </button>
                </div>
              </header>
              <div className="card-body activity-body">
                {showActivityForm && (
                  <div className="activity-form-panel">
                    <div className="column-heading">
                      <h3>Create activity</h3>
                      <p>Fill in the details to add it to your library.</p>
                    </div>
                    <form className="stack" onSubmit={handleCreateActivity}>
                      <label className="field">
                        <span>Name</span>
                        <input
                          name="name"
                          type="text"
                          value={activityForm.name}
                          onChange={handleActivityInputChange}
                          placeholder="Brush teeth with blue toothbrush"
                        />
                        {activityFormErrors.name && (
                          <small className="error-text">{activityFormErrors.name}</small>
                        )}
                      </label>
                      <div className="form-inline">
                        <label className="field">
                          <span>Icon</span>
                          <input
                            name="icon"
                            type="text"
                            value={activityForm.icon}
                            onChange={handleActivityInputChange}
                            placeholder="e.g. star"
                            maxLength={4}
                          />
                        </label>
                        <label className="field">
                          <span>Default duration</span>
                          <input
                            name="defaultDurationMin"
                            type="number"
                            min={1}
                            max={480}
                            value={activityForm.defaultDurationMin}
                            onChange={handleActivityInputChange}
                          />
                          {activityFormErrors.defaultDurationMin && (
                            <small className="error-text">
                              {activityFormErrors.defaultDurationMin}
                            </small>
                          )}
                        </label>
                      </div>
                      <label className="field">
                        <span>Description</span>
                        <textarea
                          name="description"
                          rows={2}
                          value={activityForm.description}
                          onChange={handleActivityInputChange}
                          placeholder="Add a friendly hint or reminder."
                        />
                      </label>
                      <label className="field">
                        <span>Tags (comma separated)</span>
                        <input
                          name="tags"
                          type="text"
                          value={activityForm.tags}
                          onChange={handleActivityInputChange}
                          placeholder="morning, hygiene"
                        />
                      </label>
                      {activityFormErrors.general && (
                        <small className="error-text">{activityFormErrors.general}</small>
                      )}
                      <div className="form-actions">
                        <button
                          type="button"
                          className="secondary"
                          onClick={resetActivityForm}
                          disabled={creatingActivity}
                        >
                          Clear
                        </button>
                        <button type="submit" className="primary" disabled={creatingActivity}>
                          {creatingActivity ? 'Adding...' : 'Save activity'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
                <div ref={libraryRef} className="activity-panel library-panel">
                  <div className="column-heading">
                    <h3>Activity library</h3>
                    <p>Send ready-made steps straight into the routine.</p>
                  </div>
                  <div className="activity-list">
                    {activitiesLoading && <p className="info-text">Loading activities...</p>}
                    {activitiesError && <p className="error-text">{activitiesError}</p>}
                    {!activitiesLoading && activities.length === 0 && !activitiesError && (
                      <p className="info-text">No activities yet. Use "New activity" above to add one.</p>
                    )}
                    {activities.map((activity) => (
                      <article key={activity._id} className="activity-row">
                        <div className="activity-row-icon">{activity.icon || '?'}</div>
                        <div className="activity-row-copy">
                          <strong>{activity.name}</strong>
                          <p>{activity.description}</p>
                          <div className="activity-tags">
                            <span className="tag-chip">{activity.defaultDurationMin || 5} min</span>
                            {(activity.tags || []).slice(0, 3).map((tag) => (
                              <span key={tag} className="tag-chip subtle">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="activity-row-actions">
                          <button
                            type="button"
                            className="ghost"
                            onClick={() => addActivityToRoutine(activity)}
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            className="ghost danger"
                            onClick={() => handleDeleteActivity(activity._id)}
                          >
                            Delete
                          </button>
                        </div>
                      </article>
                    ))}
                  </div>
                </div>
              </div>
            </section>
          </aside>
        </div>
      </main>
    </div>
  );
}

export default App;



















