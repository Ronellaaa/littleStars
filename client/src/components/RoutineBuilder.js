import { useEffect, useMemo, useState } from 'react';
import { createRoutine, fetchActivities, fetchRoutines } from '../api';
import { detectOverlaps, hhmmToMinutes, minutesToHHmm, sortStepsByStart } from '../utils/time';

const weekdayOptions = [
  { value: 0, label: 'Sun' },
  { value: 1, label: 'Mon' },
  { value: 2, label: 'Tue' },
  { value: 3, label: 'Wed' },
  { value: 4, label: 'Thu' },
  { value: 5, label: 'Fri' },
  { value: 6, label: 'Sat' },
];

const generateId = () => {
  if (globalThis.crypto?.randomUUID) {
    return globalThis.crypto.randomUUID();
  }
  return `step-${Math.random().toString(16).slice(2)}`;
};

const defaultStartTime = '07:00';

const computeNextStart = (steps) => {
  if (!steps || steps.length === 0) {
    return defaultStartTime;
  }
  const ordered = sortStepsByStart(steps);
  const last = ordered[ordered.length - 1];
  const endMinutes = hhmmToMinutes(last.startTime) + Number(last.durationMin || 0);
  return minutesToHHmm(endMinutes);
};

const sanitizeLabel = (value) => value?.trim() || '';

function RoutineBuilder({ token, profile, onLogout }) {
  const [activityQuery, setActivityQuery] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [activities, setActivities] = useState([]);
  const [activitiesLoading, setActivitiesLoading] = useState(false);
  const [activitiesError, setActivitiesError] = useState('');

  const [steps, setSteps] = useState([]);
  const [routineName, setRoutineName] = useState('');
  const [description, setDescription] = useState('');
  const [childId, setChildId] = useState(profile.children?.[0]?._id || '');
  const [recurrenceType, setRecurrenceType] = useState('none');
  const [customDays, setCustomDays] = useState([]);

  const [formErrors, setFormErrors] = useState({});
  const [generalError, setGeneralError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [saving, setSaving] = useState(false);
  const [existingNames, setExistingNames] = useState([]);

  useEffect(() => {
    fetchRoutines({ token })
      .then((data) => {
        const names = Array.isArray(data.routines)
          ? data.routines.map((routine) => routine.name.toLowerCase())
          : [];
        setExistingNames(names);
      })
      .catch(() => {
        setExistingNames([]);
      });
  }, [token]);

  useEffect(() => {
    if (!successMessage) {
      return undefined;
    }
    const timer = setTimeout(() => setSuccessMessage(''), 4000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    let isMounted = true;
    const controller = new AbortController();
    setActivitiesLoading(true);
    setActivitiesError('');
    const handle = setTimeout(() => {
      fetchActivities({
        token,
        query: activityQuery.trim(),
        tags: selectedTags,
        signal: controller.signal,
      })
        .then((data) => {
          if (!isMounted) {
            return;
          }
          setActivities(data.activities || []);
        })
        .catch((error) => {
          if (error.name === 'AbortError') {
            return;
          }
          if (isMounted) {
            setActivitiesError(error.message || 'Could not load activities');
            setActivities([]);
          }
        })
        .finally(() => {
          if (isMounted) {
            setActivitiesLoading(false);
          }
        });
    }, 250);
    return () => {
      isMounted = false;
      controller.abort();
      clearTimeout(handle);
    };
  }, [token, activityQuery, selectedTags]);

  const allTags = useMemo(() => {
    const tagSet = new Set();
    activities.forEach((activity) => {
      (activity.tags || []).forEach((tag) => tagSet.add(tag));
    });
    return Array.from(tagSet).sort((a, b) => a.localeCompare(b));
  }, [activities]);

  const toggleTag = (tag) => {
    setSelectedTags((prev) =>
      prev.includes(tag) ? prev.filter((item) => item !== tag) : [...prev, tag]
    );
  };

  const addStepFromActivity = (activity) => {
    setSteps((prev) => {
      const nextStart = computeNextStart(prev);
      const duration = activity.defaultDurationMin || 10;
      return [
        ...prev,
        {
          id: generateId(),
          activityId: activity._id,
          activity,
          startTime: nextStart,
          durationMin: duration,
          labelOverride: '',
          iconOverride: '',
        },
      ];
    });
    setFormErrors((prev) => ({ ...prev, steps: undefined }));
  };

  const handleActivityDrag = (event, activity) => {
    event.dataTransfer.setData('application/json', JSON.stringify(activity));
    event.dataTransfer.effectAllowed = 'copy';
  };

  const handleDropOnTimeline = (event) => {
    event.preventDefault();
    try {
      const payload = event.dataTransfer.getData('application/json');
      if (!payload) {
        return;
      }
      const activity = JSON.parse(payload);
      if (activity?._id) {
        addStepFromActivity(activity);
      }
    } catch (error) {
      // ignore malformed drag payloads
    }
  };

  const handleDragOverTimeline = (event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'copy';
  };

  const updateStep = (id, field, value) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id
          ? {
              ...step,
              [field]: field === 'durationMin' ? Number(value) : value,
            }
          : step
      )
    );
  };

  const updateLabel = (id, value) => {
    setSteps((prev) =>
      prev.map((step) =>
        step.id === id
          ? {
              ...step,
              labelOverride: value,
            }
          : step
      )
    );
  };

  const removeStep = (id) => {
    setSteps((prev) => prev.filter((step) => step.id !== id));
  };

  const moveStep = (id, direction) => {
    setSteps((prev) => {
      const index = prev.findIndex((step) => step.id === id);
      if (index === -1) {
        return prev;
      }
      const newIndex = index + direction;
      if (newIndex < 0 || newIndex >= prev.length) {
        return prev;
      }
      const updated = [...prev];
      const [item] = updated.splice(index, 1);
      updated.splice(newIndex, 0, item);
      return updated;
    });
  };

  const recurrenceValue = useMemo(() => {
    if (recurrenceType === 'custom') {
      return { type: 'custom', byDay: [...customDays].sort((a, b) => a - b) };
    }
    return { type: recurrenceType };
  }, [recurrenceType, customDays]);

  const validateRoutine = (status) => {
    const trimmedName = routineName.trim();
    const errors = {};
    if (!trimmedName) {
      errors.name = 'Routine name is required.';
    } else if (existingNames.includes(trimmedName.toLowerCase())) {
      errors.name = 'You already have a routine with this name.';
    }
    if (steps.length === 0) {
      errors.steps = 'Add at least one step to your routine.';
    }
    const invalidStep = steps.find(
      (step) => !/^\d{2}:\d{2}$/.test(step.startTime) || Number(step.durationMin) <= 0
    );
    if (invalidStep) {
      errors.steps = 'Check that each step has a valid start time and duration.';
    }
    if (detectOverlaps(steps)) {
      errors.steps = 'Steps overlap. Adjust start times or durations.';
    }
    if (status === 'published' && recurrenceType === 'custom' && customDays.length === 0) {
      errors.recurrence = 'Select at least one day for a custom recurrence.';
    }
    setFormErrors(errors);
    return { isValid: Object.keys(errors).length === 0, trimmedName };
  };

  const buildPayload = (status, name) => {
    const orderedSteps = sortStepsByStart(steps).map((step) => ({
      activityId: step.activityId,
      startTime: step.startTime,
      durationMin: Number(step.durationMin),
      labelOverride: sanitizeLabel(step.labelOverride),
      iconOverride: sanitizeLabel(step.iconOverride),
    }));
    const payload = {
      name,
      description: description.trim(),
      status,
      steps: orderedSteps,
      recurrence: recurrenceValue,
      notificationPreferences: {},
    };
    if (childId) {
      payload.childId = childId;
    }
    return payload;
  };

  const saveRoutine = async (status) => {
    setGeneralError('');
    const { isValid, trimmedName } = validateRoutine(status);
    if (!isValid) {
      return;
    }
    setSaving(true);
    try {
      const payload = buildPayload(status, trimmedName);
      await createRoutine({ token, payload });
      setSuccessMessage(status === 'published' ? 'Routine published!' : 'Draft saved.');
      setExistingNames((prev) => [...prev, trimmedName.toLowerCase()]);
      setSteps([]);
      setRoutineName('');
      setDescription('');
      setRecurrenceType('none');
      setCustomDays([]);
      setFormErrors({});
    } catch (error) {
      setGeneralError(error.message || 'Something went wrong while saving the routine.');
    } finally {
      setSaving(false);
    }
  };

  const toggleCustomDay = (day) => {
    setCustomDays((prev) =>
      prev.includes(day) ? prev.filter((value) => value !== day) : [...prev, day]
    );
  };

  const getStepEndTime = (step) => {
    try {
      return minutesToHHmm(hhmmToMinutes(step.startTime) + Number(step.durationMin || 0));
    } catch (error) {
      return '--:--';
    }
  };

  return (
    <div className="routine-builder">
      <header className="builder-header">
        <div>
          <h2>Routine Builder</h2>
          <p>Building for {profile.parent?.name || 'your family'}</p>
        </div>
        <button type="button" className="link-button" onClick={onLogout}>
          Sign out
        </button>
      </header>

      <section className="routine-meta">
        <div className="field-group">
          <label>
            <span>Routine name</span>
            <input
              type="text"
              value={routineName}
              onChange={(event) => {
                setRoutineName(event.target.value);
                setFormErrors((prev) => ({ ...prev, name: undefined }));
              }}
              placeholder="e.g. School Morning"
            />
          </label>
          {formErrors.name && <p className="field-error">{formErrors.name}</p>}
        </div>
        <div className="field-group">
          <label>
            <span>Description</span>
            <textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Optional summary for parents"
              rows={2}
            />
          </label>
        </div>
        <div className="field-grid">
          <label>
            <span>Assign to child</span>
            <select value={childId} onChange={(event) => setChildId(event.target.value)}>
              <option value="">All children</option>
              {profile.children?.map((child) => (
                <option key={child._id} value={child._id}>
                  {child.name}
                </option>
              ))}
            </select>
          </label>
          <fieldset>
            <legend>Recurs</legend>
            <div className="recurrence-options">
              {['none', 'daily', 'weekdays', 'custom'].map((option) => (
                <label key={option}>
                  <input
                    type="radio"
                    name="recurrence"
                    value={option}
                    checked={recurrenceType === option}
                    onChange={(event) => {
                      setRecurrenceType(event.target.value);
                      setFormErrors((prev) => ({ ...prev, recurrence: undefined }));
                    }}
                  />
                  <span className="radio-label">
                    {option === 'none' ? 'Once' : option.charAt(0).toUpperCase() + option.slice(1)}
                  </span>
                </label>
              ))}
            </div>
            {recurrenceType === 'custom' && (
              <div className="custom-days">
                {weekdayOptions.map((day) => (
                  <label key={day.value}>
                    <input
                      type="checkbox"
                      checked={customDays.includes(day.value)}
                      onChange={() => toggleCustomDay(day.value)}
                    />
                    <span>{day.label}</span>
                  </label>
                ))}
              </div>
            )}
            {formErrors.recurrence && <p className="field-error">{formErrors.recurrence}</p>}
          </fieldset>
        </div>
      </section>

      <section className="builder-body">
        <aside className="activity-library">
          <div className="panel-header">
            <h3>Activity Library</h3>
            <p>Search or drag activities into your routine.</p>
          </div>
          <label className="search-field">
            <span>Search</span>
            <input
              type="text"
              value={activityQuery}
              onChange={(event) => setActivityQuery(event.target.value)}
              placeholder="Search for breakfast, teeth…"
            />
          </label>
          {allTags.length > 0 && (
            <div className="tag-filter">
              {allTags.map((tag) => (
                <button
                  type="button"
                  key={tag}
                  className={selectedTags.includes(tag) ? 'tag active' : 'tag'}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </button>
              ))}
            </div>
          )}
          <div className="activity-list">
            {activitiesLoading && <p className="info">Loading activities…</p>}
            {activitiesError && <p className="error">{activitiesError}</p>}
            {!activitiesLoading && activities.length === 0 && !activitiesError && (
              <p className="info">No activities match your search.</p>
            )}
            {activities.map((activity) => (
              <article
                key={activity._id}
                className="activity-card"
                draggable
                onDragStart={(event) => handleActivityDrag(event, activity)}
              >
                <div className="activity-icon">{activity.icon || '⭐'}</div>
                <div className="activity-content">
                  <header>
                    <h4>{activity.name}</h4>
                    <span className="activity-duration">{activity.defaultDurationMin || 10} min</span>
                  </header>
                  {activity.description && <p className="activity-description">{activity.description}</p>}
                  <div className="activity-tags">
                    {(activity.tags || []).slice(0, 3).map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                </div>
                <button type="button" onClick={() => addStepFromActivity(activity)}>
                  Add
                </button>
              </article>
            ))}
          </div>
        </aside>

        <main
          className="routine-timeline"
          onDragOver={handleDragOverTimeline}
          onDrop={handleDropOnTimeline}
        >
          <div className="panel-header">
            <h3>Routine Timeline</h3>
            <p>Set start times and durations in the order they happen.</p>
          </div>
          {formErrors.steps && <p className="field-error">{formErrors.steps}</p>}
          {steps.length === 0 ? (
            <div className="timeline-placeholder">
              <p>Drag activities here or tap Add to start building your routine.</p>
            </div>
          ) : (
            <ul className="timeline-list">
              {steps.map((step, index) => (
                <li key={step.id} className="timeline-item">
                  <div className="timeline-order">
                    <span>{index + 1}</span>
                    <div className="order-controls">
                      <button
                        type="button"
                        onClick={() => moveStep(step.id, -1)}
                        disabled={index === 0}
                        aria-label="Move step up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveStep(step.id, 1)}
                        disabled={index === steps.length - 1}
                        aria-label="Move step down"
                      >
                        ↓
                      </button>
                    </div>
                  </div>
                  <div className="timeline-details">
                    <div className="timeline-activity">
                      <div className="activity-icon large">{step.activity?.icon || '⭐'}</div>
                      <div>
                        <p className="timeline-activity-name">{step.activity?.name}</p>
                        <label>
                          <span>Label for kids (optional)</span>
                          <input
                            type="text"
                            value={step.labelOverride}
                            onChange={(event) => updateLabel(step.id, event.target.value)}
                            maxLength={80}
                          />
                        </label>
                      </div>
                    </div>
                    <div className="timeline-inputs">
                      <label>
                        <span>Starts</span>
                        <input
                          type="time"
                          value={step.startTime}
                          onChange={(event) => updateStep(step.id, 'startTime', event.target.value)}
                        />
                      </label>
                      <label>
                        <span>Duration (min)</span>
                        <input
                          type="number"
                          min={1}
                          max={480}
                          value={step.durationMin}
                          onChange={(event) => updateStep(step.id, 'durationMin', event.target.value)}
                        />
                      </label>
                      <div className="timeline-end">
                        <span>Ends</span>
                        <strong>{getStepEndTime(step)}</strong>
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="remove-step"
                    onClick={() => removeStep(step.id)}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          )}
        </main>
      </section>

      {(generalError || successMessage) && (
        <div className={generalError ? 'toast error' : 'toast success'}>
          {generalError || successMessage}
        </div>
      )}

      <footer className="builder-actions">
        <div className="action-hint">
          <p>Save as a draft to finish later, or publish so your child sees it today.</p>
        </div>
        <div className="action-buttons">
          <button type="button" disabled={saving} onClick={() => saveRoutine('draft')}>
            {saving ? 'Saving…' : 'Save Draft'}
          </button>
          <button
            type="button"
            className="primary"
            disabled={saving}
            onClick={() => saveRoutine('published')}
          >
            {saving ? 'Saving…' : 'Publish'}
          </button>
        </div>
      </footer>
    </div>
  );
}

export default RoutineBuilder;
