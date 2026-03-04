const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
if (!fs.existsSync("./uploads")) {
  fs.mkdirSync("./uploads");
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) => cb(null, Date.now() + "-" + Math.round(Math.random() * 1e9) + path.extname(file.originalname)),
});

const upload = multer({
  storage,
  limits: { fileSize: 1 * 1024 * 1024 }, // 1MB limit
  fileFilter: (req, file, cb) => {
    const types = /jpeg|jpg|png|webp/;
    const extname = types.test(path.extname(file.originalname).toLowerCase());
    const mimetype = types.test(file.mimetype);
    if (extname && mimetype) cb(null, true);
    else cb(new Error("Only image files (jpeg, jpg, png, webp) are allowed"));
  },
});

module.exports = upload;
