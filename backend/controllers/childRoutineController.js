import mongoose from "mongoose";
import { Routine } from "../models/Routine.js";
import Child from "../models/Child.js";

const toObjectId = (value) => new mongoose.Types.ObjectId(value);

// Model to track child routine progress
const childRoutineProgressSchema = new mongoose.Schema({
  childId: { type: mongoose.Schema.Types.ObjectId, ref: "Child", required: true },
  routineId: { type: mongoose.Schema.Types.ObjectId, ref: "Routine", required: true },
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  currentStep: { type: Number, default: 0 },
  completedSteps: [{ type: Number }],
  status: { 
    type: String, 
    enum: ["not_started", "in_progress", "completed", "paused"], 
    default: "not_started" 
  },
}, { timestamps: true });

const ChildRoutineProgress = mongoose.models.ChildRoutineProgress || 
  mongoose.model("ChildRoutineProgress", childRoutineProgressSchema);

// Get all routines assigned to the authenticated child
export const getChildRoutines = async (req, res, next) => {
  try {
    console.log("Child routines request:");
    console.log("- User:", req.user);
    console.log("- Headers:", req.headers.authorization);
    
    const childId = toObjectId(req.user.childId || req.user.sub);
    console.log("- Child ID:", childId.toString());
    
    // Get today's date for filtering
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Find routines assigned to this child for today
    const routines = await Routine.find({
      child: childId,
      scheduledFor: { $gte: today, $lt: tomorrow }
    })
    .populate('steps.activity', 'name description icon')
    .sort({ scheduledFor: 1 });

    // Get progress for each routine
    const routinesWithProgress = await Promise.all(
      routines.map(async (routine) => {
        const progress = await ChildRoutineProgress.findOne({
          childId,
          routineId: routine._id
        });

        return {
          ...routine.toObject(),
          progress: progress || { 
            status: "not_started", 
            currentStep: 0, 
            completedSteps: [] 
          }
        };
      })
    );

    res.json(routinesWithProgress);
  } catch (error) {
    next(error);
  }
};

// Get a specific routine with progress
export const getChildRoutine = async (req, res, next) => {
  try {
    const childId = toObjectId(req.user.childId);
    const routineId = toObjectId(req.params.routineId);

    const routine = await Routine.findOne({
      _id: routineId,
      child: childId
    }).populate('steps.activity', 'name description icon');

    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    const progress = await ChildRoutineProgress.findOne({
      childId,
      routineId
    });

    res.json({
      ...routine.toObject(),
      progress: progress || { 
        status: "not_started", 
        currentStep: 0, 
        completedSteps: [] 
      }
    });
  } catch (error) {
    next(error);
  }
};

// Start a routine
export const startRoutine = async (req, res, next) => {
  try {
    const childId = toObjectId(req.user.childId);
    const routineId = toObjectId(req.params.routineId);

    // Verify routine belongs to child
    const routine = await Routine.findOne({
      _id: routineId,
      child: childId
    });

    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    // Create or update progress
    let progress = await ChildRoutineProgress.findOne({
      childId,
      routineId
    });

    if (!progress) {
      progress = new ChildRoutineProgress({
        childId,
        routineId,
        status: "in_progress",
        startedAt: new Date(),
        currentStep: 0,
        completedSteps: []
      });
    } else {
      progress.status = "in_progress";
      progress.startedAt = new Date();
    }

    await progress.save();

    res.json({ 
      message: "Routine started successfully",
      progress: progress.toObject()
    });
  } catch (error) {
    next(error);
  }
};

// Complete a step in the routine
export const completeStep = async (req, res, next) => {
  try {
    const childId = toObjectId(req.user.childId);
    const routineId = toObjectId(req.params.routineId);
    const stepIndex = parseInt(req.params.stepIndex);

    // Verify routine belongs to child
    const routine = await Routine.findOne({
      _id: routineId,
      child: childId
    });

    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    if (stepIndex < 0 || stepIndex >= routine.steps.length) {
      return res.status(400).json({ message: "Invalid step index" });
    }

    // Get or create progress
    let progress = await ChildRoutineProgress.findOne({
      childId,
      routineId
    });

    if (!progress) {
      progress = new ChildRoutineProgress({
        childId,
        routineId,
        status: "in_progress",
        startedAt: new Date(),
        currentStep: 0,
        completedSteps: []
      });
    }

    // Mark step as completed
    if (!progress.completedSteps.includes(stepIndex)) {
      progress.completedSteps.push(stepIndex);
    }

    // Update current step to next incomplete step
    let nextStep = stepIndex + 1;
    while (nextStep < routine.steps.length && progress.completedSteps.includes(nextStep)) {
      nextStep++;
    }

    progress.currentStep = nextStep;

    // Check if all steps are completed
    if (progress.completedSteps.length === routine.steps.length) {
      progress.status = "completed";
      progress.completedAt = new Date();
    }

    await progress.save();

    res.json({
      message: "Step completed successfully",
      progress: progress.toObject(),
      isRoutineComplete: progress.status === "completed"
    });
  } catch (error) {
    next(error);
  }
};

// Finish/complete entire routine
export const finishRoutine = async (req, res, next) => {
  try {
    const childId = toObjectId(req.user.childId);
    const routineId = toObjectId(req.params.routineId);

    // Verify routine belongs to child
    const routine = await Routine.findOne({
      _id: routineId,
      child: childId
    });

    if (!routine) {
      return res.status(404).json({ message: "Routine not found" });
    }

    // Update progress
    let progress = await ChildRoutineProgress.findOne({
      childId,
      routineId
    });

    if (!progress) {
      progress = new ChildRoutineProgress({
        childId,
        routineId,
        startedAt: new Date(),
        completedSteps: []
      });
    }

    progress.status = "completed";
    progress.completedAt = new Date();
    
    // Mark all steps as completed if not already
    for (let i = 0; i < routine.steps.length; i++) {
      if (!progress.completedSteps.includes(i)) {
        progress.completedSteps.push(i);
      }
    }
    progress.currentStep = routine.steps.length;

    await progress.save();

    res.json({
      message: "Routine completed successfully!",
      progress: progress.toObject()
    });
  } catch (error) {
    next(error);
  }
};

// Pause routine
export const pauseRoutine = async (req, res, next) => {
  try {
    const childId = toObjectId(req.user.childId);
    const routineId = toObjectId(req.params.routineId);

    const progress = await ChildRoutineProgress.findOne({
      childId,
      routineId
    });

    if (!progress) {
      return res.status(404).json({ message: "Routine progress not found" });
    }

    progress.status = "paused";
    await progress.save();

    res.json({
      message: "Routine paused",
      progress: progress.toObject()
    });
  } catch (error) {
    next(error);
  }
};
