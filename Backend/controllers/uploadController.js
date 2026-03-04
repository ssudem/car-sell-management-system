const cloudinary = require("../config/cloudinary");
const fs = require("fs");

exports.uploadImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ message: "No files uploaded" });
    }

    const urls = [];
    for (const file of req.files) {
      const result = await cloudinary.uploader.upload(file.path, {
        folder: "visioncars_cars",
        transformation: [{ width: 800, height: 600, crop: "fill" }],
      });
      urls.push(result.secure_url);
      fs.unlinkSync(file.path); // Delete temp file after upload
    }

    res.json({ urls });
  } catch (err) {
    res.status(500).json({ message: "Upload failed", error: err.message });
  }
};
