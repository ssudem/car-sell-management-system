const express = require("express");
const router = express.Router();
const { auth, adminAuth } = require("../middleware/auth");
const {
  getAllCars,
  getCarById,
  addCar,
  updateCar,
  deleteCar,
} = require("../controllers/carController");

// Public routes
router.get("/", getAllCars);
router.get("/:id", getCarById);

// Admin-only routes
router.post("/", adminAuth, addCar);
router.put("/:id", adminAuth, updateCar);
router.delete("/:id", adminAuth, deleteCar);

module.exports = router;
