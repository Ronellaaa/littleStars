// controllers/children.controller.js
import mongoose from "mongoose";
import Child from "../models/Child.js";

const O = (id) => new mongoose.Types.ObjectId(id);


export const getOrCreateDefaultChild = async (req, res, next) => {
  try {
    const parentId = new mongoose.Types.ObjectId(req.user.sub);

    // find one child for this parent
    let child = await Child.findOne({ parentId }).sort({ createdAt: 1 });

    if (!child) {
      // create a placeholder if none exists
      // (you can pass ?name= in query or let frontend rename later)
      const defaultName =
        (req.query.name && String(req.query.name).trim()) ||
        "My Child";
      child = await Child.create({
        name: defaultName,
        parentId,
        mentorIds: [],
      });
      return res.status(201).json(child);
    }

    return res.json(child);
  } catch (e) { next(e); }
};




// Parent creates a child profile
export const createChild = async (req, res, next) => {
  try {
    const doc = await Child.create({
      name: (req.body.name || "").trim(),
      parentId: O(req.user.sub),
      mentorIds: [],
    });
    res.status(201).json(doc);
  } catch (e) { next(e); }
};

// Mentor lists ONLY children assigned to them
export const listForMentor = async (req, res, next) => {
  try {
    const items = await Child
      .find({ mentorIds: O(req.user.sub) })
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (e) { next(e); }
};

// Parent lists their own children
export const listMine = async (req, res, next) => {
  try {
    const items = await Child
      .find({ parentId: O(req.user.sub) })
      .sort({ createdAt: -1 });
    res.json(items);
  } catch (e) { next(e); }
};

// Assign a mentor to a child (parent or mentor can call)
export const assignMentor = async (req, res, next) => {
  try {
    const { mentorId } = req.body;
    if (!mentorId) return res.status(400).json({ message: "mentorId required" });

    const doc = await Child.findByIdAndUpdate(
      O(req.params.childId),
      { $addToSet: { mentorIds: O(mentorId) } },
      { new: true }
    );
    if (!doc) return res.status(404).json({ message: "Child not found" });
    res.json(doc);
  } catch (e) { next(e); }
};
