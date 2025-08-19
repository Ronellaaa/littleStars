import express from 'express';
import dotenv from 'dotenv';
import { connectDB } from './config/db.js';
import cardRoutes from './routes/SpeechTherapyRoute.js';

dotenv.config();

const app = express();

app.use(express.json());

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    connectDB();
    console.log("Server is started at http://localhost:5000");
});

app.use("/api/cards", cardRoutes );














