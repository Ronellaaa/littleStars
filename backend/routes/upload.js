
import express from "express";
import multer from "multer"; // for handling multipart/form-data
import fs from "fs"; // to delete temp files
import cloudinary from "../config/cloudinary.js"; // cloudinary config

const router = express.Router(); // create router instance
const upload = multer({ dest: "uploads/" }); // temp storage

router.post("/", upload.single("image"), async (req, res) => { // single file upload with field name 'image'
  try {
    if (!req.file) { // no file uploaded
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const result = await cloudinary.uploader.upload(req.file.path, {  // upload to cloudinary from temp path
      folder: "speechcards",
    });

    fs.unlinkSync(req.file.path); // clean up local temp file
    res.json({ success: true, url: result.secure_url }); // return uploaded image URL
  } catch (err) {
    console.error("Upload error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;

