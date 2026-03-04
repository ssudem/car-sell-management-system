const db = require("../config/db");

exports.getStats = async (req, res) => {
  try {
    const query = `
      SELECT
        (SELECT COUNT(*) FROM cars) AS totalCars,
        (SELECT COUNT(*) FROM transactions WHERE payment_status = 'Completed') AS carsSold,
        (SELECT COUNT(*) FROM cars WHERE status = 'Available') AS carsAvailable,
        (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE payment_status = 'Completed') AS revenue,
        (SELECT COUNT(*) FROM inquiries) AS totalInquiries,
        (SELECT COUNT(*) FROM users WHERE role = 'user') AS totalUsers
    `;
    const [rows] = await db.query(query);
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.getActivity = async (req, res) => {
  try {
    const query = `
      (SELECT t.id, 'Sale' AS type, CONCAT('Payment of $', t.amount, ' for ', c.title) AS description, t.created_at
       FROM transactions t JOIN cars c ON t.car_id = c.id)
      UNION ALL
      (SELECT i.id, 'Inquiry' AS type, CONCAT('Inquiry from ', i.name, ' about ', c.title) AS description, i.created_at
       FROM inquiries i JOIN cars c ON i.car_id = c.id)
      UNION ALL
      (SELECT id, 'New Listing' AS type, CONCAT(title, ' listed at $', price) AS description, created_at
       FROM cars)
      UNION ALL
      (SELECT id, 'New User' AS type, CONCAT(name, ' registered') AS description, created_at
       FROM users WHERE role = 'user')
      UNION ALL
      (SELECT id, type, description, created_at FROM activity_log)
      ORDER BY created_at DESC LIMIT 15
    `;
    const [activities] = await db.query(query);
    res.json(activities);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
