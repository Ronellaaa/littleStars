import { Router } from "express";
import BlogsController from "../controllers/BlogsController.js";
import upload from "../config/multer.js";

const router = Router();
router.post("/", upload.single("imageFile"), BlogsController.AddBlogs);
router.get("/", BlogsController.BlogList);
router.get("/:id", BlogsController.GetBlog);
router.put("/:id", upload.single("imageFile"), BlogsController.UpdateBlog);
router.delete("/:id", BlogsController.DeleteBlog);
export default router;
