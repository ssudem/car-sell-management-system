const db = require("../config/db");
const getISTTimestamp = require("../utils/getISTTimestamp");

exports.sendInquiry = async (req, res) => {
  const { carId, name, email, message } = req.body;
  const userId = req.user ? req.user.id : null; 

  if (!carId || !name || !email || !message) {
    return res.status(400).json({ message: "All fields are required" });
  }

  try {
    await db.query(
      "INSERT INTO inquiries (car_id, user_id, name, email, message, created_at) VALUES (?, ?, ?, ?, ?, ?)",
      [carId, userId, name, email, message, getISTTimestamp()]
    );
    res.status(201).json({ message: "Inquiry sent successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getMyInquiries = async (req, res) => {
  try {
    const query = `
      SELECT i.*, c.title AS car_title
      FROM inquiries i
      JOIN cars c ON i.car_id = c.id
      WHERE i.user_id = ?
      ORDER BY i.created_at DESC
    `;
    const [inquiries] = await db.query(query, [req.user.id]);
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getAllInquiries = async (req, res) => {
  try {
    const query = `
      SELECT i.*, c.title AS car_title, u.name AS user_name
      FROM inquiries i
      JOIN cars c ON i.car_id = c.id
      LEFT JOIN users u ON i.user_id = u.id
      ORDER BY i.created_at DESC
    `;
    const [inquiries] = await db.query(query);
    res.json(inquiries);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.replyInquiry = async (req, res) => {
  try {
    const [inq] = await db.query("SELECT name FROM inquiries WHERE id = ?", [req.params.id]);
    await db.query("UPDATE inquiries SET status = 'Replied' WHERE id = ?", [req.params.id]);
    
    // Log reply activity
    if (inq.length > 0) {
      await db.query(
        "INSERT INTO activity_log (type, description, created_at) VALUES (?, ?, ?)",
        ['Inquiry Replied', `Admin replied to inquiry from ${inq[0].name}`, getISTTimestamp()]
      );
    }

    res.json({ message: "Inquiry marked as replied" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
