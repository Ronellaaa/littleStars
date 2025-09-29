export const API_BASE = "http://localhost:5050".replace(/\/+$/, ""); // ← add this
const API = API_BASE;

function isFormData(v) {
  return typeof FormData !== "undefined" && v instanceof FormData;
}
async function http(path, { method = "GET", body, headers } = {}) {
  const url = `${API}${path.startsWith("/") ? "" : "/"}${path}`;
  const opts = { method, headers: { ...authHeader(), ...(headers || {}) } };
  if (body !== undefined) {
    if (isFormData(body)) opts.body = body;
    else { opts.headers["Content-Type"] = "application/json"; opts.body = JSON.stringify(body); }
  }
  const res = await fetch(url, opts);
  if (!res.ok) {
    const txt = await res.text().catch(() => "");
    throw new Error(`HTTP ${res.status}: ${txt || res.statusText}`);
  }
  return res.status === 204 ? null : res.json();
}


// 👇 add this
// src/api/http.js
export async function uploadFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch(`${API}/api/upload/local/single`, {
    method: "POST",
    headers: { ...authHeader() },
    body: fd,
  });
  if (!res.ok) throw new Error(`Upload failed`);
  return res.json();
}

export const ContentsAPI = {
  list: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return http(`/api/contents${qs ? `?${qs}` : ""}`);
  },
  get: (id) => http(`/api/contents/${id}`),
  create: (data) => http(`/api/contents`, { method: "POST", body: data }),
  update: (id, data) =>
    http(`/api/contents/${id}`, { method: "PUT", body: data }),
  remove: (id) => http(`/api/contents/${id}`, { method: "DELETE" }),
};




export const ScenariosAPI = {
  list: (emotion) => http(`/api/scenarios${emotion ? `?emotionName=${emotion}` : ""}`),
  create: (data) => http(`/api/scenarios`, { method: "POST", body: data }),
  update: (id, data) => http(`/api/scenarios/${id}`, { method: "PUT", body: data }),
  remove: (id) => http(`/api/scenarios/${id}`, { method: "DELETE" }),
};




// export async function uploadFile(file) {
//   const fd = new FormData();
//   fd.append("file", file);
//   return http("/api/uploads", { method:"POST", body: fd });
// }

export const AttemptsAPI = {
  log: (data) => http("api/emotion/attempts", { method: "POST", body: data }),
  list: (params = {}) => http(`api/emotion/attempts?${new URLSearchParams(params)}`),
  stats: (params = {}) =>
    http(`api/emotion/attempts/stats?${new URLSearchParams(params)}`),
};

export const ThresholdsAPI = {
  get: (childId, emotion) => http(`/api/thresholds/${childId}/${emotion}`),
  set: (childId, emotion, data) =>
    http(`/api/thresholds/${childId}/${emotion}`, {
      method: "PUT",
      body: data,
    }),
};

function authHeader() {
  try {
    const u = JSON.parse(localStorage.getItem("user") || "null");
    return u?.token ? { Authorization: `Bearer ${u.token}` } : {};
  } catch { return {}; }
}

export const AuthAPI = {
  signup: (data) => http("/api/auth/signup", { method: "POST", body: data }),
  login:  (data) => http("/api/auth/login",  { method: "POST", body: data }),
  me:     ()     => http("/api/auth/me"),
};


// export const ChildSettingsAPI = {
//   get: (childId) => http(`/api/child-settings/${childId}`),
//   set: (childId, data) => http(`/api/child-settings/${childId}`, { method:"PUT", body:data }),
// };







export const ChildrenAPI = {
  // NEW: auto-create / auto-resolve a child for the logged-in parent
  // Optional: pass { name: "My Kid" } to set the initial name
  default: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return http(`/api/children/default${qs ? `?${qs}` : ""}`);
  },

  list:   () => http("/api/children"),            // mentor view
  mine:   () => http("/api/children/mine"),       // parent view
  create: (name) => http("/api/children", { method: "POST", body: { name } }),
  assign: (childId, mentorId) =>
    http(`/api/children/${childId}/assign`, { method: "PUT", body: { mentorId } }),
};


// export async function uploadFile(file) {
//   const fd = new FormData();
//   fd.append("file", file);
//   return http("/api/upload/single", { method: "POST", body: fd });
// }
