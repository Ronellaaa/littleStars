// backend/index.js
import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import contentsRouter from "./routes/contents.js";
import uploadRouter from "./routes/upload.js"; // 👈
import path from "path";
import { fileURLToPath } from "url";
import attemptsRouter from "./routes/attempts1.js";
import thresholdsRouter from "./routes/thresholds.js";
import authRouter from "./routes/auth.js";
import childSettingsRouter from "./routes/childSettings.js";
import childrenRoutes from "./routes/children.js"; 
import scenariosRoutes from "./routes/scenarios.js";

dotenv.config();
const app = express();
app.use(cors({ origin: "http://localhost:5173" }));

app.use(express.json());

const { PORT, MONGODB_URI } = process.env;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
// app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // 👈
const uploadsDir = path.resolve(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDir));

await mongoose.connect(MONGODB_URI);
console.log("✅ MongoDB connected");

app.get("/health", (req, res) => res.json({ ok: true }));
 app.use("/api/upload", uploadRouter);    
app.use("/api/contents", contentsRouter);

app.use("/api/attempts", attemptsRouter);
app.use("/api/thresholds", thresholdsRouter);
app.use("/api/auth", authRouter);
// backend/index.js
app.use("/models", express.static(path.join(__dirname, "models")));
app.use("/api/child-settings", 
childSettingsRouter);
app.use("/api/children", childrenRoutes); 
app.use("/api/upload", uploadRouter);
app.use("/api/scenarios", scenariosRoutes);
app.use((req, res) => res.status(404).json({ message: "Not found" }));

app.listen(PORT, () => console.log(`✅ API listening on http://localhost:${PORT}`));
