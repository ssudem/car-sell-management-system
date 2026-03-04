const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { uploadImages } = require("../controllers/uploadController");

// Upload up to 10 images at once
router.post("/", adminAuth, upload.array("images", 10), uploadImages);

module.exports = router;
