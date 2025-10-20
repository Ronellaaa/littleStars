
import { useEffect, useRef, useState } from 'react';
import '../../styles/routineBuilderStyles/RoutineHomeStyles.css';

import {
  createActivity,
  createRoutine,
  deleteActivity,
  deleteRoutine,
  fetchActivities,
  fetchRoutines,
  updateRoutine,
} from '../../services/api';

import { ChildrenAPI } from '../../api/http';

import { detectOverlaps, hhmmToMinutes, minutesToHHmm, sortByStartTime } from '../../utils/time';

const generateId = () =>
  globalThis.crypto?.randomUUID ? globalThis.crypto.randomUUID() : `step-${Math.random().toString(16).slice(2)}`;

const defaultStartTime = '07:00';

const computeNextStart = (steps) => {
  if (!steps || steps.length === 0) return defaultStartTime;
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
    if (!candidate) continue;
    if (typeof candidate === 'string' || typeof candidate === 'number') {
      const id = `${candidate}`.trim();
      if (id) return id;
      continue;
    }
    if (typeof candidate === 'object') {
      if (candidate._id) {
        const id = `${candidate._id}`.trim();
        if (id) return id;
      }
      if (candidate.id) {
        const id = `${candidate.id}`.trim();
        if (id) return id;
      }
    }
  }
  return '';
};

const normalizeTags = (input) => {
  if (Array.isArray(input)) {
    return input.map((tag) => `${tag}`.trim()).filter(Boolean);
  }
  if (typeof input === 'string') {
    return input.split(',').map((t) => t.trim()).filter(Boolean);
  }
  return [];
};

const normalizeActivity = (activity) => {
  if (!activity) return null;
  const activityId = resolveActivityId(activity, activity?._id);
  if (!activityId) return null;
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
  if (!value) return todayDateInput();
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return todayDateInput();
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

export default function RoutineHome() {
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [activitiesError, setActivitiesError] = useState('');

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

  // Child assignment
  const [children, setChildren] = useState([]);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [assigningRoutineId, setAssigningRoutineId] = useState('');
  const [selectedChildId, setSelectedChildId] = useState('');

  const libraryRef = useRef(null);
  const heroRef = useRef(null);
  const plannerRef = useRef(null);
  const historyRef = useRef(null);
  const activityManagerRef = useRef(null);
  const activityNameInputRef = useRef(null);

  const scrollToSection = (ref) => {
    if (ref?.current) ref.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };
  const scrollToLibrary = () => {
    scrollToSection(activityManagerRef);
    setTimeout(() => scrollToSection(libraryRef), 120);
  };

  const totalDuration = steps.reduce((total, step) => total + Number(step.durationMin || 0), 0);
  const nextStartTime = computeNextStart(steps);

  const closeActivityForm = () => {
    setShowActivityForm(false);
    setActivityFormErrors({});
  };
  const focusActivityForm = () => {
    setShowActivityForm(true);
  };
  const focusActivityLibrary = () => {
    closeActivityForm();
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

    // Load children for assignment
    ChildrenAPI.mine()
      .then((data) => {
        if (!isMounted) return;
        console.log('Loaded children for assignment:', data);
        setChildren(data || []);
      })
      .catch((error) => {
        if (!isMounted) return;
        console.error('Failed to load children:', error);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (!feedback) return undefined;
    const timer = setTimeout(() => setFeedback(''), 3500);
    return () => clearTimeout(timer);
  }, [feedback]);

  useEffect(() => {
    if (!showActivityForm) return undefined;
    if (typeof window === 'undefined' || typeof document === 'undefined') return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const timer = window.setTimeout(() => {
      activityNameInputRef.current?.focus();
    }, 80);

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setActivityFormErrors({});
        setShowActivityForm(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      window.clearTimeout(timer);
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showActivityForm]);

  const addActivityToRoutine = (activity) => {
    if (!activity) return;
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
      if (index === -1) return prev;
      const targetIndex = index + direction;
      if (targetIndex < 0 || targetIndex >= prev.length) return prev;
      const updated = [...prev];
      const [removed] = updated.splice(index, 1);
      updated.splice(targetIndex, 0, removed);
      return updated;
    });
  };

  const validateRoutine = () => {
    const errors = {};
    if (!routineName.trim()) errors.routineName = 'Give your routine a name.';
    if (steps.length === 0) errors.steps = 'Add at least one step to your routine.';

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

  const clearRoutineState = () => {
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
        clearRoutineState();
      } else {
        const response = await createRoutine(payload);
        setFeedback('Routine saved! Your child will see it today.');
        setFeedbackType('success');
        clearRoutineState();
        if (response?.routine) {
          setExistingRoutines((prev) => [response.routine, ...prev]);
          setRoutinesError('');
        }
      }
    } catch (error) {
      setFeedbackType('error');
      setFeedback(error.message || 'Something went wrong while saving.');
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

    if (!trimmedName) errors.name = 'Give the activity a name.';
    if (!Number.isFinite(durationValue) || durationValue <= 0) errors.defaultDurationMin = 'Duration must be greater than zero.';
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
    const confirmMessage = activity ? `Remove "${activity.name}" from your library?` : 'Remove this activity?';
    if (!window.confirm(confirmMessage)) return;
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
    if (!routine?._id) return;
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
      if (!activityId) missingActivity = true;
      const fallbackActivity = rawActivity && typeof rawActivity === 'object' && rawActivity !== null ? rawActivity : null;
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

    setRoutineName(routine.name || '');
    setDescription(routine.description || '');
    setScheduledFor(toDateInputValue(routine.scheduledFor));
    setSteps(nextSteps);
    setFormErrors({});
    setEditingRoutineId(routine._id);
    setShowActivityForm(false);
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleDeleteRoutine = async (routineId) => {
    if (!routineId) return;
    const routine = existingRoutines.find((item) => item._id === routineId);
    const confirmMessage = routine ? `Delete "${routine.name}"?` : 'Delete this routine?';
    if (!window.confirm(confirmMessage)) return;
    setRoutineDeletingId(routineId);
    try {
      await deleteRoutine(routineId);
      setExistingRoutines((prev) => prev.filter((item) => item._id !== routineId));
      setFeedbackType('success');
      setFeedback('Routine deleted.');
      setRoutinesError('');
      if (editingRoutineId === routineId) {
        clearRoutineState();
      }
    } catch (error) {
      setFeedbackType('error');
      setFeedback(error.message || 'Unable to delete routine right now.');
    } finally {
      setRoutineDeletingId('');
    }
  };

  const handleAssignChild = (routineId) => {
    setAssigningRoutineId(routineId);
    setShowAssignModal(true);
    setSelectedChildId('');
  };

  const handleAssignmentSubmit = async () => {
    if (!assigningRoutineId || !selectedChildId) return;
    
    console.log('Assigning routine:', assigningRoutineId, 'to child:', selectedChildId);
    console.log('Available children:', children);
    
    try {
      const response = await fetch(`http://localhost:5050/api/routines/${assigningRoutineId}/assign`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || '{}').token || ''}`
        },
        body: JSON.stringify({ childId: selectedChildId })
      });

      if (!response.ok) {
        const errorData = await response.text();
        console.error('Assignment error response:', response.status, errorData);
        let errorMessage = 'Failed to assign routine';
        try {
          const parsed = JSON.parse(errorData);
          errorMessage = parsed.message || errorMessage;
        } catch (e) {
          errorMessage = errorData || errorMessage;
        }
        throw new Error(`${response.status}: ${errorMessage}`);
      }

      const data = await response.json();
      
      // Update the routine in the list
      setExistingRoutines((prev) =>
        prev.map((routine) =>
          routine._id === assigningRoutineId ? data.routine : routine
        )
      );

      setFeedback('Routine assigned successfully!');
      setFeedbackType('success');
      setShowAssignModal(false);
      setAssigningRoutineId('');
      setSelectedChildId('');
    } catch (error) {
      setFeedback(error.message || 'Failed to assign routine');
      setFeedbackType('error');
    }
  };

  const handleUnassignChild = async (routineId) => {
    if (!window.confirm('Remove child assignment from this routine?')) return;
    
    try {
      const response = await fetch(`http://localhost:5050/api/routines/${routineId}/unassign`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${JSON.parse(localStorage.getItem('user') || '{}').token || ''}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to unassign routine');
      }

      const data = await response.json();
      
      // Update the routine in the list
      setExistingRoutines((prev) =>
        prev.map((routine) =>
          routine._id === routineId ? data.routine : routine
        )
      );

      setFeedback('Child assignment removed');
      setFeedbackType('success');
    } catch (error) {
      setFeedback(error.message || 'Failed to unassign routine');
      setFeedbackType('error');
    }
  };

  const totalActivities = activities.length;
  const plannedSteps = steps.length;
  const totalRoutines = existingRoutines.length;

  return (
    <div className="routine-dashboard-shell">
      <nav className="routine-top-nav">
        <div className="routine-brand">
          <span className="routine-brand-logo">LS</span>
          <div className="routine-brand-copy">
            <strong>Little Stars</strong>
            <span>Routine Studio</span>
          </div>
        </div>
        <div className="routine-nav-links">
          <button type="button" onClick={() => scrollToSection(heroRef)}>Overview</button>
          <button type="button" onClick={() => scrollToSection(plannerRef)}>Planner</button>
          <button type="button" onClick={() => scrollToSection(historyRef)}>History</button>
          <button type="button" onClick={focusActivityLibrary}>Library</button>
          <button 
            type="button" 
            className="routine-manage-children-btn"
            onClick={() => window.location.href = '/parent/children'}
          >
            👶 Manage Children
          </button>
        </div>
      </nav>

      <main className="routine-dashboard-content">
        <section ref={heroRef} className="routine-hero-card">
          <div>
            <p className="routine-hero-kicker">Planner overview</p>
            <h1>Create the perfect routine for your child</h1>
            <p className="routine-hero-sub">
              Drag from your activity library, personalise each step, and publish when everything feels right.
            </p>
          </div>
          <div className="routine-hero-stats">
            <div className="routine-stat-tile">
              <span className="routine-stat-label">Activities</span>
              <strong>{totalActivities}</strong>
            </div>
            <div className="routine-stat-tile">
              <span className="routine-stat-label">Steps in progress</span>
              <strong>{plannedSteps}</strong>
            </div>
            <div className="routine-stat-tile">
              <span className="routine-stat-label">Saved routines</span>
              <strong>{totalRoutines}</strong>
            </div>
          </div>
        </section>

        <div className="routine-layout-grid">
          <div className="routine-layout-main">
            <section ref={plannerRef} className="routine-card routine-routine-builder-card">
              <header className="routine-card-header routine-card-header--tight routine-routine-builder-header">
                <div>
                  <h2>Routine planner</h2>
                  <p>Give your routine a name, choose the day, and line up every activity.</p>
                </div>
                <div className="routine-planner-actions">
                  <button
                    type="button"
                    className="routine-ghost"
                    onClick={resetRoutine}
                    disabled={saving}
                  >
                    {editingRoutineId ? 'Cancel edit' : 'Reset plan'}
                  </button>
                  <button type="button" className="routine-primary" onClick={handleSave} disabled={saving}>
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
              <div className="routine-card-body routine-routine-builder-body">
                <div className="routine-builder-column routine-form-column">
                  <div className="routine-column-heading">
                    <h3>Routine details</h3>
                    <p>Share the plan with grown-ups before your child sees it.</p>
                  </div>
                  <div className="routine-builder-stats">
                    <div className="routine-builder-stat">
                      <strong>{steps.length}</strong>
                      <span>steps planned</span>
                    </div>
                    <div className="routine-builder-stat">
                      <strong>{totalDuration}</strong>
                      <span>minutes total</span>
                    </div>
                    <div className="routine-builder-stat">
                      <strong>{nextStartTime}</strong>
                      <span>next slot</span>
                    </div>
                  </div>
                  <div className="routine-form-grid">
                    <label className="routine-field">
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
                      {formErrors.routineName && <small className="routine-error-text">{formErrors.routineName}</small>}
                    </label>
                    <label className="routine-field">
                      <span>Scheduled for</span>
                      <input type="date" value={scheduledFor} onChange={(event) => setScheduledFor(event.target.value)} />
                    </label>
                    <label className="routine-field routine-field--full">
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
                <div className="routine-builder-column routine-timeline-column">
                  <div className="routine-column-heading">
                    <h3>Routine timeline</h3>
                    <p>Rename steps, adjust times, and keep everything in order.</p>
                  </div>
                  <div className="routine-timeline-actions">
                    <button type="button" className="routine-secondary" onClick={focusActivityLibrary}>
                      Add from library
                    </button>
                    <button type="button" className="routine-ghost" onClick={focusActivityForm}>
                      Manage activities
                    </button>
                  </div>
                  <div className="routine-timeline-surface">
                    {formErrors.steps && <p className="routine-error-text">{formErrors.steps}</p>}
                    {steps.length === 0 ? (
                      <div className="routine-timeline-empty">
                        <p>Choose activities from the library to start building your routine.</p>
                        <button type="button" className="routine-secondary" onClick={focusActivityLibrary}>
                          Open activity library
                        </button>
                      </div>
                    ) : (
                      <div className="routine-timeline-scroll">
                        <ul className="routine-timeline-list">
                          {steps.map((step, index) => (
                            <li key={step.id} className="routine-timeline-item">
                              <header className="routine-step-header">
                                <div className="routine-step-meta">
                                  <span className="routine-step-number">{index + 1}</span>
                                  <div className="routine-activity-icon routine-large">{step.activity?.icon || '?'}</div>
                                  <div className="routine-step-copy">
                                    <p className="routine-activity-name">{step.activity?.name}</p>
                                    <label className="routine-step-label">
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
                                <div className="routine-step-header-actions">
                                  <div className="routine-step-order-controls">
                                    <button
                                      type="button"
                                      className="routine-step-move"
                                      onClick={() => moveStep(step.id, -1)}
                                      disabled={index === 0}
                                      aria-label="Move step up"
                                    >
                                      &uarr;
                                    </button>
                                    <button
                                      type="button"
                                      className="routine-step-move"
                                      onClick={() => moveStep(step.id, 1)}
                                      disabled={index === steps.length - 1}
                                      aria-label="Move step down"
                                    >
                                      &darr;
                                    </button>
                                  </div>
                                  <button
                                    type="button"
                                    className="routine-remove-step"
                                    onClick={() => removeStep(step.id)}
                                  >
                                    Remove step
                                  </button>
                                </div>
                              </header>
                              <div className="routine-step-body">
                                <div className="routine-step-fields">
                                  <label className="routine-step-field">
                                    <span>Start at</span>
                                    <input
                                      type="time"
                                      value={step.startTime}
                                      onChange={(event) => updateStep(step.id, { startTime: event.target.value })}
                                    />
                                  </label>
                                  <label className="routine-step-field">
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
                                  <div className="routine-step-end">
                                    <span>Ends</span>
                                    <strong>{getEndTimeDisplay(step.startTime, step.durationMin)}</strong>
                                  </div>
                                </div>
                              </div>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            {feedback && <div className={`routine-toast ${feedbackType === 'success' ? 'routine-success' : 'routine-error'}`}>{feedback}</div>}

            <section ref={historyRef} className="routine-card routine-history-card">
              <header className="routine-card-header routine-card-header--tight">
                <div>
                  <h2>Recent routines</h2>
                  <p>Everything you have already planned.</p>
                </div>
                <div className="routine-history-summary">
                  <span className="routine-stat-chip">{existingRoutines.length}</span>
                  <span className="routine-summary-label">saved</span>
                </div>
              </header>
              <div className="routine-card-body routine-history-body">
                {routinesError && <p className="routine-error-text">{routinesError}</p>}
                {existingRoutines.length === 0 ? (
                  <div className="routine-empty-state">
                    <p>No routines yet. Create one to see it here.</p>
                  </div>
                ) : (
                  <ul className="routine-history-grid">
                    {existingRoutines.map((routine) => {
                      const isEditing = editingRoutineId === routine._id;
                      return (
                        <li
                          key={routine._id}
                          className={`routine-history-card-item${isEditing ? ' routine-is-editing' : ''}`}
                        >
                          <header className="routine-history-card-header">
                            <div>
                              <strong>{routine.name}</strong>
                              <span className="routine-history-date">
                                {new Date(routine.scheduledFor).toLocaleDateString()}
                              </span>
                            </div>
                            <span className="routine-history-count">{routine.steps?.length || 0} steps</span>
                          </header>
                          <div className="routine-history-steps">
                            {routine.steps?.map((step) => (
                              <span key={`${routine._id}-${step.order}`} className="routine-tag-chip routine-subtle">
                                {step.label}
                              </span>
                            ))}
                          </div>
                          <div className="routine-assignment">
                            {routine.childSnapshot?.name ? (
                              <div className="routine-assigned-child">
                                <span className="routine-child-indicator">👶 Assigned to: {routine.childSnapshot.name}</span>
                              </div>
                            ) : (
                              <div className="routine-unassigned">
                                <span className="routine-child-indicator">⚠️ Not assigned to any child</span>
                              </div>
                            )}
                          </div>
                          <div className="routine-history-actions">
                            <button
                              type="button"
                              className="routine-ghost"
                              onClick={() => beginEditRoutine(routine)}
                              disabled={saving || routineDeletingId === routine._id}
                            >
                              {isEditing ? 'Editing...' : 'Edit'}
                            </button>
                            <button
                              type="button"
                              className="routine-ghost routine-primary"
                              onClick={() => handleAssignChild(routine._id)}
                              disabled={saving}
                            >
                              Assign Child
                            </button>
                            <button
                              type="button"
                              className="routine-ghost routine-danger"
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

          <aside className="routine-layout-side">
            <section ref={activityManagerRef} className="routine-card routine-activity-card">
              <header className="routine-card-header routine-card-header--tight">
                <div>
                  <h2>Activity manager</h2>
                  <p>Your personalised library of ready-to-use tasks.</p>
                </div>
                <div className="routine-activity-card-actions">
                  <button
                    type="button"
                    className={`routine-outline${showActivityForm ? ' routine-outline--active' : ''}`}
                    onClick={() => (showActivityForm ? closeActivityForm() : setShowActivityForm(true))}
                  >
                    {showActivityForm ? 'Close form' : 'New activity'}
                  </button>
                </div>
              </header>
              <div className="routine-card-body routine-activity-body">
                <div ref={libraryRef} className="routine-activity-panel routine-library-panel">
                  <div className="routine-column-heading">
                    <h3>Activity library</h3>
                    <p>Send ready-made steps straight into the routine.</p>
                  </div>
                  <div className="routine-activity-list">
                    {activitiesLoading && <p className="routine-info-text">Loading activities...</p>}
                    {activitiesError && <p className="routine-error-text">{activitiesError}</p>}
                    {!activitiesLoading && activities.length === 0 && !activitiesError && (
                      <p className="routine-info-text">No activities yet. Use "New activity" above to add one.</p>
                    )}
                    {activities.map((activity) => (
                      <article key={activity._id} className="routine-activity-row">
                        <div className="routine-activity-row-icon">{activity.icon || '?'}</div>
                        <div className="routine-activity-row-copy">
                          <strong>{activity.name}</strong>
                          <p>{activity.description}</p>
                          <div className="routine-activity-tags">
                            <span className="routine-tag-chip">{activity.defaultDurationMin || 5} min</span>
                            {(activity.tags || []).slice(0, 3).map((tag) => (
                              <span key={tag} className="routine-tag-chip routine-subtle">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="routine-activity-row-actions">
                          <button
                            type="button"
                            className="routine-ghost"
                            onClick={() => addActivityToRoutine(activity)}
                          >
                            Add
                          </button>
                          <button
                            type="button"
                            className="routine-ghost routine-danger"
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
      {showActivityForm && (
        <div
          className="routine-modal-backdrop"
          role="presentation"
          onClick={closeActivityForm}
        >
          <div
            className="routine-modal routine-activity-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="routine-create-activity-heading"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="routine-modal-header">
              <div>
                <p className="routine-modal-kicker">Activity manager</p>
                <h2 id="routine-create-activity-heading">Create activity</h2>
                <p className="routine-modal-sub">
                  Fill in the details to add it to your library.
                </p>
              </div>
              <button
                type="button"
                className="routine-modal-close"
                onClick={closeActivityForm}
                aria-label="Close activity form"
              >
                X
              </button>
            </header>
            <form className="routine-modal-body routine-stack" onSubmit={handleCreateActivity}>
              <label className="routine-field">
                <span>Name</span>
                <input
                  ref={activityNameInputRef}
                  name="name"
                  type="text"
                  value={activityForm.name}
                  onChange={handleActivityInputChange}
                  placeholder="Brush teeth with blue toothbrush"
                />
                {activityFormErrors.name && (
                  <small className="routine-error-text">{activityFormErrors.name}</small>
                )}
              </label>
              <div className="routine-form-inline">
                <label className="routine-field">
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
                <label className="routine-field">
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
                    <small className="routine-error-text">
                      {activityFormErrors.defaultDurationMin}
                    </small>
                  )}
                </label>
              </div>
              <label className="routine-field">
                <span>Description</span>
                <textarea
                  name="description"
                  rows={2}
                  value={activityForm.description}
                  onChange={handleActivityInputChange}
                  placeholder="Add a friendly hint or reminder."
                />
              </label>
              <label className="routine-field">
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
                <small className="routine-error-text">{activityFormErrors.general}</small>
              )}
              <div className="routine-modal-actions">
                <button
                  type="button"
                  className="routine-secondary"
                  onClick={resetActivityForm}
                  disabled={creatingActivity}
                >
                  Clear
                </button>
                <button type="submit" className="routine-primary" disabled={creatingActivity}>
                  {creatingActivity ? 'Adding...' : 'Save activity'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Child Assignment Modal */}
      {showAssignModal && (
        <div 
          className="routine-modal-backdrop"
          onClick={() => setShowAssignModal(false)}
        >
          <div
            className="routine-modal-dialog"
            aria-modal="true"
            aria-labelledby="routine-assign-child-heading"
            onClick={(event) => event.stopPropagation()}
          >
            <header className="routine-modal-header">
              <div>
                <p className="routine-modal-kicker">Routine Assignment</p>
                <h2 id="routine-assign-child-heading">Assign to Child</h2>
                <p className="routine-modal-sub">
                  Choose which child should see this routine.
                </p>
              </div>
              <button
                type="button"
                className="routine-modal-close"
                onClick={() => setShowAssignModal(false)}
                aria-label="Close assignment modal"
              >
                X
              </button>
            </header>
            <div className="routine-modal-body routine-stack">
              {children.length === 0 ? (
                <div className="routine-empty-state">
                  <p>No children registered yet.</p>
                  <p>
                    <a href="/parent/children" className="routine-link">
                      Register a child first
                    </a>
                  </p>
                </div>
              ) : (
                <>
                  <div className="routine-field">
                    <span>Select Child:</span>
                    <div className="routine-child-options">
                      {children.map((child) => (
                        <label key={child._id} className="routine-child-option">
                          <input
                            type="radio"
                            name="selectedChild"
                            value={child._id}
                            checked={selectedChildId === child._id}
                            onChange={(e) => setSelectedChildId(e.target.value)}
                          />
                          <div className="routine-child-info">
                            <strong>{child.name}</strong>
                            {child.account ? (
                              <span className="routine-child-status routine-success">✓ Has login account</span>
                            ) : (
                              <span className="routine-child-status routine-warning">⚠ No login account</span>
                            )}
                          </div>
                        </label>
                      ))}
                    </div>
                  </div>
                  <div className="routine-modal-actions">
                    <button
                      type="button"
                      className="routine-ghost"
                      onClick={() => setShowAssignModal(false)}
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      className="routine-primary"
                      onClick={handleAssignmentSubmit}
                      disabled={!selectedChildId}
                    >
                      Assign Routine
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


