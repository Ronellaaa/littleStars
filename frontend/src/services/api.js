const API_BASE_URL = (import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5050/api').replace(/\/$/, '');

const buildHeaders = () => ({
  'Content-Type': 'application/json'
});

const handleResponse = async (response) => {
  const data = await response.json().catch(() => null);
  if (!response.ok) {
    const message = data?.message || `Request failed with status ${response.status}`;
    const error = new Error(message);
    error.details = data;
    error.status = response.status;
    throw error;
  }
  return data;
};

export const fetchActivities = async () => {
  const response = await fetch(`${API_BASE_URL}/activities`, {
    method: 'GET',
    headers: buildHeaders(),
  });
  return handleResponse(response);
};

export const createActivity = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/activities`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const deleteActivity = async (activityId) => {
  const response = await fetch(`${API_BASE_URL}/activities/${activityId}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });
  return handleResponse(response);
};

export const fetchRoutines = async () => {
  const response = await fetch(`${API_BASE_URL}/routines`, {
    method: 'GET',
    headers: buildHeaders(),
  });
  return handleResponse(response);
};

export const createRoutine = async (payload) => {
  const response = await fetch(`${API_BASE_URL}/routines`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};


export const updateRoutine = async (routineId, payload) => {
  const response = await fetch(`${API_BASE_URL}/routines/${routineId}`, {
    method: 'PUT',
    headers: buildHeaders(),
    body: JSON.stringify(payload),
  });
  return handleResponse(response);
};

export const deleteRoutine = async (routineId) => {
  const response = await fetch(`${API_BASE_URL}/routines/${routineId}`, {
    method: 'DELETE',
    headers: buildHeaders(),
  });
  return handleResponse(response);
};
