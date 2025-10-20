// backend/index.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import path from "path";
import { fileURLToPath } from "url";

// —— Routers from EmotionSimulator branch ——
import contentsRouter from "./routes/contents.js";
import uploadLocalRouter from "./routes/upload1.js";       // local uploader
import uploadRouter from "./routes/upload.js";             // cloud/unified uploader (if you keep it)
import emotionAttemptsRouter from "./routes/attempts1.js"; // Emotion Simulator attempts (auth)
import thresholdsRouter from "./routes/thresholds.js";
import authRouter from "./routes/auth.js";
import childAuthRouter from "./routes/childAuth.js";
import childSettingsRouter from "./routes/childSettings.js";
import childrenRoutes from "./routes/children.js";
import childRoutinesRouter from "./routes/childRoutines.js";
import scenariosRoutes from "./routes/scenarios.js";

// —— Routers from test-branch1 ——
import BlogsRoutes from "./routes/BlogsRoute.js";
import NurseryVideos from "./routes/NurseryRoute.js";

// —— Routers from Speech Therapy tool ——
import speechAttemptsRouter from "./routes/AttemptRoute.js";
import cardRoutes from "./routes/SpeechTherapyRoute.js";

// —— Routine Builder ——
import { Activity } from "./models/Activity.js";
import { defaultActivities } from "./data/defaultActivities.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

//Games
import gameRouter from "./routes/GameRoutes.js"; //import game routes

dotenv.config();

const app = express();
const { MONGODB_URI, PORT: PORT_ENV } = process.env;
const PORT = PORT_ENV ?? 5050;
const MONGO_URL = MONGODB_URI || "mongodb://localhost:27017/littlestars";

// —— CORS (adjust allowList as needed) ——
const allowList = new Set([
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:5174",
  "http://127.0.0.1:5174",
  "http://localhost:3001",
  "http://127.0.0.1:3001",

]);
app.use(
  cors({
    origin(origin, cb) {
      if (!origin || allowList.has(origin)) return cb(null, true);
      return cb(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: false,
  })
);

// —— Body parsing ——
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// —— Paths / static ——
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const uploadsDir = path.resolve(process.cwd(), "uploads");

app.use("/uploads", express.static(uploadsDir));
app.use("/models", express.static(path.join(__dirname, "models")));

// —— Health & root ——
app.get("/health", (_req, res) => res.json({ ok: true }));
app.get("/", (_req, res) => res.send("LittleStars backend is running"));

// —— API routes (mount each ONCE) ————————————————
// Emotion Simulator
app.use("/api/contents", contentsRouter);
app.use("/api/emotion/attempts", emotionAttemptsRouter);
app.use("/api/thresholds", thresholdsRouter);
app.use("/api/auth", authRouter);
app.use("/api/child-auth", childAuthRouter);
app.use("/api/child-settings", childSettingsRouter);
app.use("/api/children", childrenRoutes);
app.use("/api/child-routines", childRoutinesRouter);
app.use("/api/scenarios", scenariosRoutes);

// Uploads — keep both with different prefixes (or comment one out)
app.use("/api/upload/local", uploadLocalRouter); // local-only
app.use("/api/upload", uploadRouter);            // cloud/unified

// test-branch1
app.use("/api/blogs", BlogsRoutes);
app.use("/api/learn", NurseryVideos);

// Speech Therapy
app.use("/api/cards", cardRoutes);
app.use("/api/speech/attempts", speechAttemptsRouter);

// Routine Builder
import activityRoutes from "./routes/activityRoutes.js";
import routineRoutes from "./routes/routineRoutes.js";
app.use("/api/activities", activityRoutes);
app.use("/api/routines", routineRoutes);

//Games
app.use("/game", gameRouter); 

// —— Error handlers (keep last) ——
app.use(notFound);
app.use(errorHandler);

// —— DB + server start ——
try {
  await mongoose.connect(MONGO_URL);
  console.log("✅ MongoDB connected");

  // Seed default activities if empty
  const count = await Activity.countDocuments();
  if (count === 0) {
    await Activity.insertMany(defaultActivities);
    console.log(` Seeded ${defaultActivities.length} default activities.`);
  }

  app.listen(PORT, () => {
    console.log(`✅ API listening on http://localhost:${PORT}`);
  });
} catch (err) {
  console.error("❌ MongoDB connection failed:", err?.message || err);
  process.exit(1);
}
