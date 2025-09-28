import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) return res.status(401).json({ message: "Missing token" });
  try {
    // put your real secret in env
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    req.user = payload; // { sub, email, role: "mentor"|"child" }
    next();
  } catch {
    res.status(401).json({ message: "Invalid token" });
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    if (!req.user) return next({ status:401, message:"Unauthenticated" });
    if (!roles.includes(req.user.role)) {
      return next({ status:403, message:"Forbidden" });
    }
    next();
  };
}
