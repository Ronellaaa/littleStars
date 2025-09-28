import mongoose from "mongoose";
import { Activity } from "../models/Activity.js";
import { Routine } from "../models/Routine.js";

const parseTags = (input) => {
  if (!input) {
    return [];
  }
  if (Array.isArray(input)) {
    return [...new Set(input.map((tag) => tag?.trim()).filter(Boolean))];
  }
  if (typeof input === "string") {
    return input
      .split(",")
      .map((token) => token.trim())
      .filter(Boolean);
  }
  return [];
};

export const listActivities = async (_req, res, next) => {
  try {
    const activities = await Activity.find().sort({ name: 1 }).lean();
    res.json({ success: true, activities });
  } catch (error) {
    next(error);
  }
};

export const createActivity = async (req, res, next) => {
  try {
    const name = req.body?.name?.trim();
    const icon = req.body?.icon?.trim() || "";
    const description = req.body?.description?.trim() || "";
    const defaultDurationMin = Number(req.body?.defaultDurationMin) || 5;
    const tags = parseTags(req.body?.tags);

    if (!name) {
      const error = new Error("Activity name is required");
      error.status = 400;
      throw error;
    }
    if (!Number.isFinite(defaultDurationMin) || defaultDurationMin <= 0) {
      const error = new Error("defaultDurationMin must be a positive number");
      error.status = 400;
      throw error;
    }

    const activity = await Activity.create({
      name,
      icon,
      defaultDurationMin,
      description,
      tags,
    });

    res.status(201).json({ success: true, activity });
  } catch (error) {
    if (error?.code === 11000) {
      error.status = 409;
      error.message = "An activity with this name already exists";
    }
    next(error);
  }
};

export const deleteActivity = async (req, res, next) => {
  try {
    const { activityId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(activityId)) {
      const error = new Error("Invalid activity id");
      error.status = 400;
      throw error;
    }
    const result = await Activity.deleteOne({ _id: activityId });
    if (result.deletedCount === 0) {
      const error = new Error("Activity not found");
      error.status = 404;
      throw error;
    }
    await Routine.updateMany(
      { "steps.activity": activityId },
      { $pull: { steps: { activity: activityId } } }
    );
    res.json({ success: true, activityId });
  } catch (error) {
    next(error);
  }
};



















