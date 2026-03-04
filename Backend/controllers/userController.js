const db = require("../config/db");
const bcrypt = require("bcryptjs");
const cloudinary = require("../config/cloudinary");
const fs = require("fs");

exports.getProfile = async (req, res) => {
  try {
    const [rows] = await db.query("SELECT id, name, email, phone, address, avatar, role, created_at FROM users WHERE id = ?", [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });
    res.json(rows[0]);
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  const { name, phone, address, avatar } = req.body;
  try {
    const query = "UPDATE users SET name = COALESCE(?, name), phone = COALESCE(?, phone), address = COALESCE(?, address), avatar = COALESCE(?, avatar) WHERE id = ?";
    await db.query(query, [name, phone, address, avatar, req.user.id]);
    // Return updated user
    const [rows] = await db.query("SELECT id, name, email, phone, address, avatar, role, created_at FROM users WHERE id = ?", [req.user.id]);
    res.json({ message: "Profile updated successfully", user: rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updatePassword = async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  if (!oldPassword || !newPassword) return res.status(400).json({ message: "Both passwords are required" });

  try {
    const [rows] = await db.query("SELECT password FROM users WHERE id = ?", [req.user.id]);
    if (rows.length === 0) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(oldPassword, rows[0].password);
    if (!isMatch) return res.status(400).json({ message: "Incorrect old password" });

    const hashed = await bcrypt.hash(newPassword, 10);
    await db.query("UPDATE users SET password = ? WHERE id = ?", [hashed, req.user.id]);
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

exports.updateAvatar = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: "No file uploaded" });

    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(req.file.path, {
      folder: "visioncars_avatars",
      transformation: [{ width: 300, height: 300, crop: "fill", gravity: "face" }],
    });
    fs.unlinkSync(req.file.path); // Delete temp file

    // Save URL to database
    await db.query("UPDATE users SET avatar = ? WHERE id = ?", [result.secure_url, req.user.id]);

    // Return updated user
    const [rows] = await db.query("SELECT id, name, email, phone, address, avatar, role, created_at FROM users WHERE id = ?", [req.user.id]);
    res.json({ message: "Avatar updated", avatarUrl: result.secure_url, user: rows[0] });
  } catch (err) {
    res.status(500).json({ message: "Avatar upload failed", error: err.message });
  }
};
