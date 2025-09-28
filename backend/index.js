import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import bodyParser from "body-parser";
import BlogsRoutes from "./routes/BlogsRoute.js";
import NurseryVideos from "./routes/NurseryRoute.js"
import { fileURLToPath } from "url";
import mongoose from "mongoose";

import path from "path";

const app = express();
const port = 3000;


dotenv.config();

app.use(
  cors({
    origin: 'http://localhost:5173' || 'http://127.0.0.1:5173',
    credentials: false,
  })
);

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended:true}));

const __fileName = fileURLToPath(import.meta.url);
const __dirName = path.dirname(__fileName);
app.use('/uploads',express.static(path.join(__dirName,'uploads')));

app.get("/health", (_req, res) => res.send("ok"));

 app.use("/api/blogs",BlogsRoutes);
 app.use("/api/videos",NurseryVideos);

await mongoose.connect(process.env.MONGODB_URI);



app.listen(port,()=>{
console.log(`Server is running on port ${port}`);
})

