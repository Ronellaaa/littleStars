const API_ROOT = (process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api').replace(/\/$/, '');

const buildHeaders = (token, extra = {}) => {
  const headers = { 'Content-Type': 'application/json', ...extra };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

const parseResponse = async (response) => {
  let data;
  try {
    data = await response.json();
  } catch (error) {
    data = null;
  }
  if (!response.ok) {
    const message = data?.message || `Request failed with status ${response.status}`;
    const err = new Error(message);
    err.status = response.status;
    err.details = data;
    throw err;
  }
  return data;
};

export const login = async ({ email, password }) => {
  const response = await fetch(`${API_ROOT}/auth/login`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ email, password }),
  });
  return parseResponse(response);
};

export const register = async ({ name, email, password, timezone }) => {
  const response = await fetch(`${API_ROOT}/auth/register`, {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify({ name, email, password, timezone }),
  });
  return parseResponse(response);
};

export const fetchProfile = async (token) => {
  const response = await fetch(`${API_ROOT}/auth/me`, {
    method: 'GET',
    headers: buildHeaders(token),
  });
  return parseResponse(response);
};

export const fetchActivities = async ({ token, query, tags, signal }) => {
  const params = new URLSearchParams();
  if (query) {
    params.set('q', query);
  }
  if (Array.isArray(tags) && tags.length > 0) {
    params.set('tags', tags.join(','));
  }
  const qs = params.toString();
  const url = qs ? `${API_ROOT}/activities?${qs}` : `${API_ROOT}/activities`;
  const response = await fetch(url, {
    method: 'GET',
    headers: buildHeaders(token),
    signal,
  });
  return parseResponse(response);
};

export const fetchRoutines = async ({ token }) => {
  const response = await fetch(`${API_ROOT}/routines`, {
    method: 'GET',
    headers: buildHeaders(token),
  });
  return parseResponse(response);
};

export const createRoutine = async ({ token, payload }) => {
  const response = await fetch(`${API_ROOT}/routines`, {
    method: 'POST',
    headers: buildHeaders(token),
    body: JSON.stringify(payload),
  });
  return parseResponse(response);
};
