const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5050/api').replace(/\/$/, '');

const getStoredToken = () => {
  try {
    const stored = JSON.parse(localStorage.getItem('user') || 'null');
    return stored?.token || '';
  } catch {
    return '';
  }
};

const buildHeaders = (extra = {}) => {
  const headers = { 'Content-Type': 'application/json', ...extra };
  const token = getStoredToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
};

const handleResponse = async (response) => {
  const text = await response.text();
  let data = null;
  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }
  if (!response.ok) {
    const message = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.details = data;
    error.status = response.status;
    throw error;
  }
  return data;
};

const request = async (path, options = {}) => {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    method: options.method || 'GET',
    headers: buildHeaders(options.headers),
    body: options.body ? JSON.stringify(options.body) : undefined,
  });
  return handleResponse(response);
};

export const fetchActivities = async () =>
  request('/activities');

export const createActivity = async (payload) =>
  request('/activities', { method: 'POST', body: payload });

export const deleteActivity = async (activityId) =>
  request(`/activities/${activityId}`, { method: 'DELETE' });

export const fetchRoutines = async () =>
  request('/routines');

export const createRoutine = async (payload) =>
  request('/routines', { method: 'POST', body: payload });

export const updateRoutine = async (routineId, payload) =>
  request(`/routines/${routineId}`, { method: 'PUT', body: payload });

export const deleteRoutine = async (routineId) =>
  request(`/routines/${routineId}`, { method: 'DELETE' });

export const fetchMyChildren = async () =>
  request('/children/mine');

export const createChildProfile = async (payload) => {
  const body = typeof payload === 'string' ? { name: payload } : payload;
  return request('/children', { method: 'POST', body });
};

export const updateChildAccount = async (childId, payload) =>
  request(`/children/${childId}/account`, { method: 'PUT', body: payload });

export const fetchChildAssignments = async () =>
  request('/routines/assigned/me');
