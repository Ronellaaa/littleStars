import {
  getVideos,
  addVideos,
  deleteVideos,
} from "../controllers/NurseryController";
import express from "express";

const router = express.Router();

router.get("/:topic/videos", getVideos);
router.post("/:topic/videos", addVideos);
router.delete("/:topic/videos/:id", deleteVideos);

export default router;
