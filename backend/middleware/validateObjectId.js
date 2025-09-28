// backend/middleware/validateObjectId.js
import mongoose from "mongoose";

export function validateObjectId(paramName = "id") {
  return (req, res, next) => {
    const val = req.params[paramName];
    if (!val || !mongoose.isValidObjectId(val)) {
      return res.status(400).json({ message: `${paramName} must be a valid ObjectId` });
    }
    next();
  };
}
