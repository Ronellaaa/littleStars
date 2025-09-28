// routes/attempts.js
import { Router } from "express";
import { createAttempt, listAttempts, statsAttempts } from "../controllers/attemptsController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { canViewChild } from "../middleware/canViewChild.js";

const r = Router();

r.post("/", requireAuth, createAttempt);
r.get("/",  requireAuth, requireRole("mentor"), listAttempts);

// 👇 allow mentors OR parents (own child)
r.get("/stats", requireAuth, async (req, res, next) => {
  if (req.user.role === "mentor") return next();
  if (req.user.role === "parent" && req.query.childId) {
    req.params.childId = req.query.childId; // canViewChild expects :childId
    return canViewChild(req, res, next);
  }
  return res.status(403).json({ message: "Forbidden" });
}, statsAttempts);

export default r;
