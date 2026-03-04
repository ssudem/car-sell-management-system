const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth");
const { sendInquiry, getMyInquiries, getAllInquiries, replyInquiry } = require("../controllers/inquiryController");
const jwt = require("jsonwebtoken");

const optionalAuth = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  if (token) {
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
    } catch (e) {}
  }
  next();
};

router.post("/", optionalAuth, sendInquiry);
router.get("/my", auth, getMyInquiries);
router.get("/", adminAuth, getAllInquiries);
router.put("/:id", adminAuth, replyInquiry);

module.exports = router;
