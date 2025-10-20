import mongoose from "mongoose";
import { detectOverlaps, hhmmToMinutes, minutesToHHmm } from "../utils/time.js";

const routineStepSchema = new mongoose.Schema(
  {
    order: { type: Number, required: true, min: 1 },
    activity: { type: mongoose.Schema.Types.ObjectId, ref: "Activity", required: true },
    label: { type: String, required: true, trim: true, maxlength: 120 },
    startTime: {
      type: String,
      required: true,
      validate: {
        validator: (value) => /^\d{2}:\d{2}$/.test(value),
        message: "Start time must be HH:mm",
      },
    },
    durationMin: { type: Number, required: true, min: 1, max: 480 },
    endTime: {
      type: String,
      required: true,
      validate: {
        validator: (value) => /^\d{2}:\d{2}$/.test(value),
        message: "End time must be HH:mm",
      },
    },
  },
  { _id: false }
);

const routineSchema = new mongoose.Schema(
  {
    parentUserId: { type: mongoose.Schema.Types.ObjectId, ref: "User", index: true },
    parentName: { type: String, required: true, trim: true, maxlength: 120 },
    name: { type: String, required: true, trim: true, maxlength: 120 },
    description: { type: String, default: "" },
    scheduledFor: { type: Date, required: true },
    steps: { type: [routineStepSchema], default: [] },
    child: { type: mongoose.Schema.Types.ObjectId, ref: "Child", index: true, default: null },
    childSnapshot: {
      name: { type: String, trim: true },
    },
  },
  { timestamps: true }
);

routineSchema.index({ parentName: 1, name: 1, scheduledFor: 1 });

routineSchema.methods.ensureStepOrder = function ensureStepOrder() {
  if (!Array.isArray(this.steps)) {
    return;
  }
  this.steps.sort((a, b) => a.order - b.order);
  this.steps.forEach((step, index) => {
    step.order = index + 1;
    step.endTime = minutesToHHmm(hhmmToMinutes(step.startTime) + Number(step.durationMin || 0));
  });
};

routineSchema.pre("validate", function validateSteps(next) {
  this.ensureStepOrder();
  if (!this.steps || this.steps.length === 0) {
    const error = new mongoose.Error.ValidationError(this);
    error.addError(
      "steps",
      new mongoose.Error.ValidatorError({ path: "steps", message: "Routine must include at least one step" })
    );
    return next(error);
  }
  if (detectOverlaps(this.steps)) {
    const error = new mongoose.Error.ValidationError(this);
    error.addError(
      "steps",
      new mongoose.Error.ValidatorError({ path: "steps", message: "Routine steps overlap" })
    );
    return next(error);
  }
  return next();
});

export const Routine = mongoose.model("Routine", routineSchema);
