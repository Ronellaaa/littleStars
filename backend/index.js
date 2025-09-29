import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const app = express();

//Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Database Connection
const URL = process.env.MONGODB_URI || "mongodb://localhost:27017/littlestars";

mongoose.connect(URL)
  .then(() => {
    console.log("MongoDB connection successfully");
  })
  .catch((error) => {
    console.error("MongoDB connection error:", error);
    process.exit(1);
  });

// Routes
app.get("/", (req, res) => {
  res.send("LittleStars backend is running");
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});


