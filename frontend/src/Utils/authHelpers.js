export function getUserIdFromToken(token, fallback = "child123") {
  try {
    if (!token) return fallback;
    const payload = JSON.parse(atob(token.split(".")[1]));
    return payload.sub || fallback;
  } catch {
    return fallback;
  }
}