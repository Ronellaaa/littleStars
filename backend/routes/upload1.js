// backend/routes/upload.js
import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();

// ✅ use a single absolute folder (project-root/uploads)
const uploadsDir = path.resolve(process.cwd(), "uploads");
fs.mkdirSync(uploadsDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname || "");
    cb(null, Date.now() + "-" + file.fieldname + ext);
  },
});

const ALLOWED = new Set([
  "image/png","image/jpeg","image/gif","image/webp",
  "video/mp4","video/webm",
  "application/json" // lottie
]);

const upload = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (ALLOWED.has(file.mimetype)) cb(null, true);
    else cb(new Error("File type not allowed: " + file.mimetype));
  }
});

// 👉 (optional but recommended) restrict who can upload
// import { requireAuth, requireRole } from "../middleware/auth.js";

router.post(
  "/single",
  // requireAuth, requireRole("mentor"),
  upload.single("file"),
  (req, res) => {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });
    // Return a URL the frontend can use directly
    const url = `${req.protocol}://${req.get("host")}/uploads/${req.file.filename}`;
    res.json({ url, filename: req.file.filename, mimetype: req.file.mimetype, size: req.file.size });
  }
);

export default router;