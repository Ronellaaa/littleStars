import { Router } from "express";
import {
  listContents,
  getContent,
  createContent,
  updateContent,
  deleteContent,
} from "../controllers/contentsController.js";

import { requireAuth, requireRole } from "../middleware/auth.js";

const router = Router();

// Everyone (kids) can list active content. Mentors can pass includeInactive=1
router.get("/", requireAuth, listContents);   // role not required to read
router.get("/:id", requireAuth, getContent);

// Mentor-only writes
router.post("/",   requireAuth, requireRole("mentor"), createContent);
router.put("/:id", requireAuth, requireRole("mentor"), updateContent);
router.delete("/:id", requireAuth, requireRole("mentor"), deleteContent);

export default router;



// const router = Router();

// router.get("/",    listContents);  
// router.get("/:id", getContent);   
// router.post("/",   createContent); 
// router.put("/:id", updateContent); 
// router.delete("/:id", deleteContent); 

// export default router;
