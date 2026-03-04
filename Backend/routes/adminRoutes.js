const express = require("express");
const router = express.Router();
const { adminAuth } = require("../middleware/auth");
const { getStats, getActivity } = require("../controllers/adminController");

router.get("/stats", adminAuth, getStats);
router.get("/activity", adminAuth, getActivity);

module.exports = router;
