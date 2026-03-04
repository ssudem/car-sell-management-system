const express = require("express");
const router = express.Router();
const { auth } = require("../middleware/auth");
const { getWishlist, addToWishlist, removeFromWishlist, checkWishlist } = require("../controllers/wishlistController");

router.get("/", auth, getWishlist);
router.post("/", auth, addToWishlist);
router.delete("/:carId", auth, removeFromWishlist);
router.get("/check/:carId", auth, checkWishlist);

module.exports = router;
