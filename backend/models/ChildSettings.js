// backend/models/ChildSettings.js
import mongoose from "mongoose";
const schema = new mongoose.Schema({
  childId: { type:String, unique:true },
  shareWithMentor: { type:Boolean, default:false },
}, { timestamps:true });
export default mongoose.models.ChildSettings || mongoose.model("ChildSettings", schema);
