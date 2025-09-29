import jwt from "jsonwebtoken";

export function requireAuth(req, res, next) {
  const h = req.headers.authorization || "";
  const token = h.startsWith("Bearer ") ? h.slice(7) : null;
  if (!token) {
    console.log("Auth failed: Missing token");
    return res.status(401).json({ message: "Missing token" });
  }
  try {
    // put your real secret in env
    const payload = jwt.verify(token, process.env.JWT_SECRET || "dev-secret");
    console.log("Auth success:", payload);
    req.user = payload; // { sub, email, role: "mentor"|"child" }
    next();
  } catch (error) {
    console.log("Auth failed: Invalid token", error.message);
    res.status(401).json({ message: "Invalid token" });
  }
}

export function requireRole(...roles) {
  return (req, _res, next) => {
    console.log("Role check:", { userRole: req.user?.role, requiredRoles: roles });
    if (!req.user) return next({ status:401, message:"Unauthenticated" });
    if (!roles.includes(req.user.role)) {
      console.log("Role check failed: user has role", req.user.role, "but needs one of", roles);
      return next({ status:403, message:"Forbidden" });
    }
    console.log("Role check passed");
    next();
  };
}
