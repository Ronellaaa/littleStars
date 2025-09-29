
import multer from "multer";
import path from "path";
import express from "express";
import { getVideos, addVideos, deleteVideos } from "../controllers/NurseryController.js";

const router = express.Router();

router.get("/:topic/videos", getVideos);
router.post("/:topic/videos", addVideos);
router.delete("/:topic/videos/:id", deleteVideos);

// --- Storage configs ---
// For thumbnails (images)
const imageStorage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, "thumb_" + Date.now() + path.extname(file.originalname)); // keep extension
  }
});
const uploadImage = multer({ storage: imageStorage });

// For videos
const videoStorage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
    cb(null, "video_" + Date.now() + path.extname(file.originalname)); // keep extension
  }
});
const uploadVideo = multer({ storage: videoStorage });

// --- Routes ---
// Thumbnail upload
router.post("/upload/thumbnail", uploadImage.single("thumb"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const fullUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ url: fullUrl });
});

// Video upload
router.post("/upload/video", uploadVideo.single("video"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const fullUrl = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
  res.json({ url: fullUrl });
});


export default router;

