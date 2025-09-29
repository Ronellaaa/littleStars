import mongoose from "mongoose";
import { Activity } from "../models/Activity.js";
import { Routine } from "../models/Routine.js";
import Child from "../models/Child.js";
import { detectOverlaps, hhmmToMinutes, minutesToHHmm } from "../utils/time.js";

const ensureObjectId = (value, message = "Invalid identifier") => {
  if (value === null || value === undefined) {
    const error = new Error(message);
    error.status = 400;
    throw error;
  }
  if (!mongoose.Types.ObjectId.isValid(value)) {
    const error = new Error(message);
    error.status = 400;
    throw error;
  }
  return new mongoose.Types.ObjectId(value);
};

const parseScheduledFor = (input) => {
  if (!input) {
    return new Date(new Date().setHours(0, 0, 0, 0));
  }
  const parsed = new Date(input);
  if (Number.isNaN(parsed.getTime())) {
    const error = new Error("scheduledFor must be a valid date");
    error.status = 400;
    throw error;
  }
  parsed.setHours(0, 0, 0, 0);
  return parsed;
};

const normalizeLabel = (activity, override) => {
  const trimmed = override?.trim();
  if (trimmed && trimmed.length > 0) {
    return trimmed;
  }
  return activity.name;
};

const validateStepPayload = (step, index) => {
  if (!step.activityId) {
    const error = new Error(`Step ${index + 1} is missing an activityId`);
    error.status = 400;
    throw error;
  }
  if (!/^\d{2}:\d{2}$/.test(step.startTime || "")) {
    const error = new Error(`Step ${index + 1} has an invalid start time`);
    error.status = 400;
    throw error;
  }
  const duration = Number(step.durationMin);
  if (!Number.isFinite(duration) || duration <= 0) {
    const error = new Error(`Step ${index + 1} must have a positive duration`);
    error.status = 400;
    throw error;
  }
};

const buildRoutineData = async (body, context = {}) => {
  const parentName = body?.parentName?.trim();
  const routineName = body?.name?.trim();
  const description = body?.description?.trim() || "";
  const scheduledFor = parseScheduledFor(body?.scheduledFor);
  const stepsPayload = Array.isArray(body?.steps) ? body.steps : [];

  if (!parentName) {
    const error = new Error("parentName is required");
    error.status = 400;
    throw error;
  }
  if (!routineName) {
    const error = new Error("Routine name is required");
    error.status = 400;
    throw error;
  }
  if (stepsPayload.length === 0) {
    const error = new Error("Add at least one step to build a routine");
    error.status = 400;
    throw error;
  }

  stepsPayload.forEach(validateStepPayload);

  const activityIds = stepsPayload.map((step) => ensureObjectId(step.activityId, "Invalid activity id"));
  const activities = await Activity.find({ _id: { $in: activityIds } });
  const activityMap = new Map(activities.map((activity) => [activity._id.toString(), activity]));

  if (activityMap.size !== activityIds.length) {
    const error = new Error("One or more activities were not found");
    error.status = 404;
    throw error;
  }

  const steps = stepsPayload.map((step, index) => {
    const activityId = activityIds[index];
    const activity = activityMap.get(activityId.toString());
    const order = index + 1;
    const startTime = step.startTime;
    const durationMin = Number(step.durationMin);
    const endTime = minutesToHHmm(hhmmToMinutes(startTime) + durationMin);

    return {
      order,
      activity: activityId,
      label: normalizeLabel(activity, step.label),
      startTime,
      durationMin,
      endTime,
    };
  });

  if (detectOverlaps(steps)) {
    const error = new Error("Routine steps overlap. Adjust start times or durations.");
    error.status = 400;
    throw error;
  }

  const data = {
    parentName,
    name: routineName,
    description,
    scheduledFor,
    steps,
  };

  if (context.parentUserId) {
    data.parentUserId = context.parentUserId;
  }

  if (Object.prototype.hasOwnProperty.call(body || {}, "childId")) {
    if (body.childId) {
      const childId = ensureObjectId(body.childId, "Invalid child id");
      const childDoc = await Child.findById(childId).select("name parentId").lean();
      if (!childDoc) {
        const error = new Error("Child not found");
        error.status = 404;
        throw error;
      }

      if (context.parentUserId && childDoc.parentId && String(childDoc.parentId) !== String(context.parentUserId)) {
        const error = new Error("You do not have permission to assign this child");
        error.status = 403;
        throw error;
      }

      data.child = childId;
      data.childSnapshot = { name: childDoc.name };
      if (!data.parentUserId && childDoc.parentId) {
        data.parentUserId = childDoc.parentId;
      }
    } else {
      data.child = null;
      data.childSnapshot = undefined;
    }
  }

  return data;
};

const applyRoutinePopulate = (target) =>
  target.populate([
    { path: "steps.activity", select: "name icon defaultDurationMin" },
    { path: "child", select: "name" },
  ]);

export const listRoutines = async (_req, res, next) => {
  try {
    const routines = await applyRoutinePopulate(Routine.find().sort({ createdAt: -1 })).lean();
    res.json({ success: true, routines });
  } catch (error) {
    next(error);
  }
};

export const createRoutine = async (req, res, next) => {
  try {
    let parentUserId;
    if (req.user?.role === "parent") {
      parentUserId = ensureObjectId(req.user.sub, "Invalid parent id");
    }
    const routineData = await buildRoutineData(req.body, { parentUserId });
    const routine = await Routine.create(routineData);
    const created = await applyRoutinePopulate(routine);
    res.status(201).json({ success: true, routine: created });
  } catch (error) {
    next(error);
  }
};

export const updateRoutine = async (req, res, next) => {
  try {
    const routineId = ensureObjectId(req.params?.routineId, "Invalid routine id");
    const routine = await Routine.findById(routineId);
    if (!routine) {
      const error = new Error("Routine not found");
      error.status = 404;
      throw error;
    }

    let parentUserId;
    if (req.user?.role === "parent") {
      parentUserId = ensureObjectId(req.user.sub, "Invalid parent id");
    }

    const routineData = await buildRoutineData(req.body, { parentUserId });
    routine.set(routineData);
    await routine.save();
    const updated = await applyRoutinePopulate(routine);
    res.json({ success: true, routine: updated });
  } catch (error) {
    next(error);
  }
};

export const deleteRoutine = async (req, res, next) => {
  try {
    const routineId = ensureObjectId(req.params?.routineId, "Invalid routine id");
    const result = await Routine.findByIdAndDelete(routineId);
    if (!result) {
      const error = new Error("Routine not found");
      error.status = 404;
      throw error;
    }
    res.json({ success: true, routineId: routineId.toString() });
  } catch (error) {
    next(error);
  }
};

export const listChildAssignedRoutines = async (req, res, next) => {
  try {
    const childId = ensureObjectId(req.user.childId || req.user.sub, "Invalid child id");
    const routines = await applyRoutinePopulate(
      Routine.find({ child: childId }).sort({ scheduledFor: 1, createdAt: -1 })
    ).lean();
    res.json({ success: true, routines });
  } catch (error) {
    next(error);
  }
};

export const listRoutinesForChild = async (req, res, next) => {
  try {
    const childId = ensureObjectId(req.params.childId, "Invalid child id");
    const routines = await applyRoutinePopulate(
      Routine.find({ child: childId }).sort({ scheduledFor: 1, createdAt: -1 })
    ).lean();
    res.json({ success: true, routines });
  } catch (error) {
    next(error);
  }
};



