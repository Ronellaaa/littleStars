import { Router } from "express";
import { requireAuth, requireRole } from "../middleware/auth.js";
import {
  createChild, listForMentor, listMine, assignMentor,
  getOrCreateDefaultChild,   // ⬅ add
} from "../controllers/childrenController.js";
import { validateObjectId } from "../middleware/validateObjectId.js"; // from earlier reply

const r = Router();

r.post("/", requireAuth, requireRole("parent"), createChild);
r.get("/",  requireAuth, requireRole("mentor"), listForMentor);
r.get("/mine", requireAuth, requireRole("parent"), listMine);

// new: auto-provision / resolve a single child for the parent
r.get("/default", requireAuth, requireRole("parent"), getOrCreateDefaultChild);

r.put("/:childId/assign",
  requireAuth,
  requireRole("parent","mentor"),
  validateObjectId("childId"),
  assignMentor
);

export default r;
