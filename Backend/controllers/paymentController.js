const db = require("../config/db");
const getISTTimestamp = require("../utils/getISTTimestamp");

exports.createPayment = async (req, res) => {
  const { carId, amount } = req.body;
  if (!carId || !amount) return res.status(400).json({ message: "Car ID and amount are required" });

  try {
    await db.query("INSERT INTO transactions (user_id, car_id, amount, payment_status, created_at) VALUES (?, ?, ?, 'Completed', ?)", [req.user.id, carId, amount, getISTTimestamp()]);
    await db.query("UPDATE cars SET status = 'Sold' WHERE id = ?", [carId]);
    res.status(201).json({ message: "Payment successful" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getMyPayments = async (req, res) => {
  try {
    const query = `
      SELECT t.*, c.title AS car_title
      FROM transactions t
      JOIN cars c ON t.car_id = c.id
      WHERE t.user_id = ?
      ORDER BY t.created_at DESC
    `;
    const [transactions] = await db.query(query, [req.user.id]);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllPayments = async (req, res) => {
  try {
    const query = `
      SELECT t.*, c.title AS car_title, u.name AS buyer_name
      FROM transactions t
      JOIN cars c ON t.car_id = c.id
      JOIN users u ON t.user_id = u.id
      ORDER BY t.created_at DESC
    `;
    const [transactions] = await db.query(query);
    res.json(transactions);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
