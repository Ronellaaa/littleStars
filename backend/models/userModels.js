import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required, trim: true, unique: true },
    password: { type: String, required: true },
    isAdmin: { type: Boolean, default: false },
    userRole: { type: String, enum: ["Parent", "Therapist,Teacher"] },
  },
  { timestamps: true }
);
