const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth");
const { purchaseLimiter } = require("../middleware/rateLimiter");
const { createPayment, getMyPayments, getAllPayments } = require("../controllers/paymentController");

router.post("/", auth, purchaseLimiter, createPayment);
router.get("/my", auth, getMyPayments);
router.get("/", adminAuth, getAllPayments);

module.exports = router;
