const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const upload = require("../middleware/upload");
const { getProfile, updateProfile, updatePassword, updateAvatar } = require("../controllers/userController");

router.get("/me", auth, getProfile);
router.put("/me", auth, updateProfile);
router.put("/me/password", auth, updatePassword);
router.put("/me/avatar", auth, upload.single("avatar"), updateAvatar);

module.exports = router;
