import { Router } from "express";
import { listScenarios, createScenario, updateScenario, deleteScenario } from "../controllers/scenariosController.js";
import { requireAuth, requireRole } from "../middleware/auth.js";

const r = Router();

// anyone logged in can list (or loosen if you want)
// r.get("/", requireAuth, listScenarios);
r.get("/", listScenarios);
// mentor-only writes
r.post("/", requireAuth, requireRole("mentor"), createScenario);
r.put("/:id", requireAuth, requireRole("mentor"), updateScenario);
r.delete("/:id", requireAuth, requireRole("mentor"), deleteScenario);

export default r;
