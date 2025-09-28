import express from "express";
import cors from "cors";
import morgan from "morgan";
import activityRoutes from "./routes/activityRoutes.js";
import routineRoutes from "./routes/routineRoutes.js";
import { notFound, errorHandler } from "./middleware/errorHandler.js";

export const createApp = () => {
  const app = express();

  app.use(
    cors({
      origin: process.env.CLIENT_ORIGIN?.split(",") || "*",
    })
  );
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(morgan("dev"));

  app.get("/health", (_req, res) => {
    res.json({ success: true, status: "ok" });
  });

  app.use("/api/activities", activityRoutes);
  app.use("/api/routines", routineRoutes);

  app.use(notFound);
  app.use(errorHandler);

  return app;
};

export default createApp;
