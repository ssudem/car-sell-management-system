const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middleware/auth");
const { getStats, getActivity, getAllUsers, deleteUser, promoteUser, updateUserPassword } = require("../controllers/adminController");

router.get("/stats", adminAuth, getStats);
router.get("/activity", adminAuth, getActivity);

// User management
router.get("/users", adminAuth, getAllUsers);
router.delete("/users/:id", adminAuth, deleteUser);
router.patch("/users/:id/promote", adminAuth, promoteUser);
router.patch("/users/:id/password", adminAuth, updateUserPassword);

module.exports = router;
