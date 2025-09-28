// backend/index.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";
// If you have a wrapper connectDB(), use it instead of mongoose.connect.
// import { connectDB } from "./config/db.js";

// —— Routers from EmotionSimulator branch ——
import contentsRouter from "./routes/contents.js";
import uploadLocalRouter from "./routes/upload1.js";       // local uploader
import uploadRouter from "./routes/upload.js";              // cloud / unified uploader (if you keep it)
import emotionAttemptsRouter from "./routes/attempts1.js";        // Emotion Simulator attempts (auth)
import thresholdsRouter from "./routes/thresholds.js";
import authRouter from "./routes/auth.js";
import childSettingsRouter from "./routes/childSettings.js";
import childrenRoutes from "./routes/children.js";
import scenariosRoutes from "./routes/scenarios.js";

// —— Routers from test-branch1 ——
import BlogsRoutes from "./routes/BlogsRoute.js";
import NurseryVideos from "./routes/NurseryRoute.js";

// —— Routers from Speech Therapy tool ——
import speechAttemptsRouter  from "./routes/AttemptRoute.js";     // Speech Therapy attempts (your controller above)
import cardRoutes from "./routes/SpeechTherapyRoute.js";




dotenv.config();

const app = express();
const { MONGODB_URI, PORT: PORT_ENV } = process.env;
const PORT = PORT_ENV ?? 5050;

// CORS
app.use(
  cors({
    origin: ["http://localhost:5173", "http://127.0.0.1:5173"],
    credentials: false,
  })
);

// Body parsing
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Static
const uploadsDir = path.resolve(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDir));
app.use("/models", express.static(path.join(__dirname, "models")));

// Health check
app.get("/health", (_req, res) => res.json({ ok: true }));

// —— API routes (mount each ONCE) ————————————————
// EmotionSimulator
app.use("/api/contents", contentsRouter);
app.use("/api/emotion/attempts", emotionAttemptsRouter);      
app.use("/api/thresholds", thresholdsRouter);
app.use("/api/auth", authRouter);
app.use("/api/child-settings", childSettingsRouter);
app.use("/api/children", childrenRoutes);
app.use("/api/scenarios", scenariosRoutes);

// Upload (choose ONE of these, comment out the other)
// Local-only uploads:
app.use("/api/upload/local", uploadLocalRouter);

// test-branch1
app.use("/api/blogs", BlogsRoutes);
app.use("/api/videos", NurseryVideos);

// Speech Therapy Tool
app.use("/api/cards", cardRoutes);
// Avoid path collision with emotion attempts: give speech its own prefix
app.use("/api/speech/attempts", speechAttemptsRouter);
// Cloud/unified uploads (if you implemented it):
app.use("/api/upload", uploadRouter);        

// 404 fallback
app.use((req, res) => res.status(404).json({ message: "Not found" }));

// —— DB + server start ————————————————————————
// Use ONE connection method. Here we use mongoose.connect directly:
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

/* If you prefer your own connectDB() wrapper, do this instead:

try {
  await connectDB();
  app.listen(PORT, () => console.log(`✅ API listening on http://localhost:${PORT}`));
} catch (err) {
  console.error("❌ DB connect failed:", err?.message || err);
  process.exit(1);
}

*/
