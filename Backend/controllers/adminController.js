const db = require("../config/db");
const bcrypt = require("bcryptjs");

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

// ===== USER MANAGEMENT =====

exports.getAllUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      "SELECT id, name, email, phone, avatar, role, created_at FROM users ORDER BY created_at DESC"
    );
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.deleteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT id, name, role FROM users WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    if (rows[0].role === "admin") return res.status(403).json({ message: "Cannot delete an admin user" });

    const userName = rows[0].name;
    await db.query("DELETE FROM users WHERE id = ?", [id]);

    // Log activity
    await db.query(
      "INSERT INTO activity_log (type, description) VALUES (?, ?)",
      ["User Deleted", `User "${userName}" was deleted by admin`]
    );

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.promoteUser = async (req, res) => {
  const { id } = req.params;
  try {
    const [rows] = await db.query("SELECT id, name, role FROM users WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    if (rows[0].role === "admin") return res.status(400).json({ message: "User is already an admin" });

    const userName = rows[0].name;
    await db.query("UPDATE users SET role = 'admin' WHERE id = ?", [id]);

    // Log activity
    await db.query(
      "INSERT INTO activity_log (type, description) VALUES (?, ?)",
      ["Role Promoted", `User "${userName}" was promoted to admin`]
    );

    res.json({ message: "User promoted to admin successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateUserPassword = async (req, res) => {
  const { id } = req.params;
  const { oldPassword, newPassword } = req.body;

  if (!oldPassword || !newPassword) {
    return res.status(400).json({ message: "Both old and new passwords are required" });
  }

  try {
    const [rows] = await db.query("SELECT id, name, password FROM users WHERE id = ?", [id]);
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    // Verify old password
    const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
    if (!isMatch) return res.status(400).json({ message: "Old password is incorrect" });

    // Hash and update new password
    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, id]);

    // Log activity
    const userName = rows[0].name;
    await db.query(
      "INSERT INTO activity_log (type, description) VALUES (?, ?)",
      ["Password Updated", `Password updated for user "${userName}" by admin`]
    );

    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
