import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import cardRoutes from './routes/SpeechTherapyRoute.js';
import attemptRoutes from "./routes/AttemptRoute.js";
import cors from "cors";
import uploadRoutes from "./routes/upload.js";


dotenv.config();

const app = express();

app.use(express.json());

// ✅ Allow only your Vite frontend to talk
app.use(cors({
  origin: "http://localhost:5173"
}));

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    connectDB();
    console.log("Server is started at http://localhost:5000");
});

app.use("/api/cards", cardRoutes );
app.use("/api/attempts", attemptRoutes);
app.use("/api/upload", uploadRoutes);














