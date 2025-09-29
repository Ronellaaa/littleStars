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
    // Check current URL to determine which token to prioritize
    const currentPath = window.location.pathname;
    const isChildPath = currentPath.startsWith('/child/');
    
    if (isChildPath) {
      // For child paths, prioritize child auth
      const childAuth = JSON.parse(localStorage.getItem("childAuth") || "null");
      if (childAuth?.token) {
        return { Authorization: `Bearer ${childAuth.token}` };
      }
    } else {
      // For parent/mentor paths, prioritize parent auth
      const u = JSON.parse(localStorage.getItem("user") || "null");
      if (u?.token) {
        return { Authorization: `Bearer ${u.token}` };
      }
    }
    
    // Fallback: check the other token type
    const childAuth = JSON.parse(localStorage.getItem("childAuth") || "null");
    const parentAuth = JSON.parse(localStorage.getItem("user") || "null");
    
    if (childAuth?.token) {
      return { Authorization: `Bearer ${childAuth.token}` };
    }
    if (parentAuth?.token) {
      return { Authorization: `Bearer ${parentAuth.token}` };
    }
    
    return {};
  } catch { 
    return {}; 
  }
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
  create: (data) => http("/api/children", { method: "POST", body: data }),
  assign: (childId, mentorId) =>
    http(`/api/children/${childId}/assign`, { method: "PUT", body: { mentorId } }),
  createAccount: (childId, data) =>
    http(`/api/children/${childId}/account`, { method: "POST", body: data }),
  delete: (childId) =>
    http(`/api/children/${childId}`, { method: "DELETE" }),
};

export const ChildAuthAPI = {
  login: (data) => http("/api/child-auth/login", { method: "POST", body: data }),
  me: () => http("/api/child-auth/me"),
};

export const ChildRoutinesAPI = {
  list: () => http("/api/child-routines"),
  get: (id) => http(`/api/child-routines/${id}`),
  start: (id) => http(`/api/child-routines/${id}/start`, { method: "POST" }),
  completeStep: (id, stepIndex) => 
    http(`/api/child-routines/${id}/step/${stepIndex}/complete`, { method: "POST" }),
  finish: (id) => http(`/api/child-routines/${id}/finish`, { method: "POST" }),
};


// export async function uploadFile(file) {
//   const fd = new FormData();
//   fd.append("file", file);
//   return http("/api/upload/single", { method: "POST", body: fd });
// }

