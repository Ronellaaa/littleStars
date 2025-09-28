// backend/middleware/canViewChild.js
import Child from "../models/Child.js";

export async function canViewChild(req, res, next) {
  const { childId } = req.params;
  const { sub, role } = req.user; // from requireAuth
  const child = await Child.findById(childId).lean();
  if (!child) return res.status(404).json({ message: "Child not found" });

  const isParent = role === "parent" && String(child.parentId) === sub;
  const isMentor = role === "mentor" && (child.mentorIds || []).some(id => String(id) === sub);

  if (isParent || isMentor) return next();
  return res.status(403).json({ message: "Forbidden" });
}
