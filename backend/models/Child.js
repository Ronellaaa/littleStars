import mongoose from "mongoose";

const ChildSchema = new mongoose.Schema({
  name: { type:String, required:true, trim:true },
  parentId: { type: mongoose.Schema.Types.ObjectId, ref:"User", required:true, index:true },
  mentorIds: [{ type: mongoose.Schema.Types.ObjectId, ref:"User", index:true }],
  dob: Date,
}, { timestamps:true });

export default mongoose.models.Child || mongoose.model("Child", ChildSchema);
