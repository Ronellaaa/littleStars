import { Router } from "express";
import { createRoutine, deleteRoutine, listRoutines, updateRoutine } from "../controllers/routineController.js";

const router = Router();

router.get("/", listRoutines);
router.post("/", createRoutine);
router.put("/:routineId", updateRoutine);
router.delete("/:routineId", deleteRoutine);

export default router;
