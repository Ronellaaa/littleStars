// backend/index.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// —— Routers from EmotionSimulator branch ——
import contentsRouter from "./routes/contents.js";
import uploadRouter from "./routes/upload.js";
import attemptsRouter from "./routes/attempts1.js";
import thresholdsRouter from "./routes/thresholds.js";
import authRouter from "./routes/auth.js";
import childSettingsRouter from "./routes/childSettings.js";
import childrenRoutes from "./routes/children.js";
import scenariosRoutes from "./routes/scenarios.js";

// —— Routers from test-branch1 ——
import BlogsRoutes from "./routes/BlogsRoute.js";
import NurseryVideos from "./routes/NurseryRoute.js";

dotenv.config();

const app = express();

// CORS: allow both localhost and 127.0.0.1 (Vite)
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: false,
  })
);

// Body parsing (Express has these built-in; no body-parser needed)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static: uploads (single source of truth)
const uploadsDir = path.resolve(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDir));

// Static: models (for face-api or other models)
app.use("/models", express.static(path.join(__dirname, "models")));

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// —— API routes ——
// From EmotionSimulator
app.use("/api/upload", uploadRouter);        
app.use("/api/contents", contentsRouter);
app.use("/api/attempts", attemptsRouter);
app.use("/api/thresholds", thresholdsRouter);
app.use("/api/auth", authRouter);
app.use("/api/child-settings", childSettingsRouter);
app.use("/api/children", childrenRoutes);
app.use("/api/scenarios", scenariosRoutes);

// From test-branch1
app.use("/api/blogs", BlogsRoutes);
app.use("/api/videos", NurseryVideos);

// 404 fallback
app.use((req, res) => res.status(404).json({ message: "Not found" }));

// DB + server
const { MONGODB_URI } = process.env;
const PORT = process.env.PORT ?? 3000;

try {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ MongoDB connected");
  app.listen(PORT, () => {
    console.log(`✅ API listening on http://localhost:${PORT}`);
  });
} catch (err) {
  console.error("❌ MongoDB connection failed:", err?.message || err);
  process.exit(1);
}
