const db = require("../config/db");

exports.getWishlist = async (req, res) => {
  try {
    const query = `
      SELECT w.id AS wishlist_id, w.created_at AS saved_at, c.*
      FROM wishlist w
      JOIN cars c ON w.car_id = c.id
      WHERE w.user_id = ?
      ORDER BY w.created_at DESC
    `;
    const [wishlist] = await db.query(query, [req.user.id]);
    res.json(wishlist);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.addToWishlist = async (req, res) => {
  const { carId } = req.body;
  if (!carId) return res.status(400).json({ message: "Car ID is required" });

  try {
    await db.query("INSERT IGNORE INTO wishlist (user_id, car_id) VALUES (?, ?)", [req.user.id, carId]);
    res.status(201).json({ message: "Car added to wishlist" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.removeFromWishlist = async (req, res) => {
  try {
    await db.query("DELETE FROM wishlist WHERE user_id = ? AND car_id = ?", [req.user.id, req.params.carId]);
    res.json({ message: "Car removed from wishlist" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.checkWishlist = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT COUNT(*) AS count FROM wishlist WHERE user_id = ? AND car_id = ?", [req.user.id, req.params.carId]);
    res.json({ inWishlist: rows[0].count > 0 });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
