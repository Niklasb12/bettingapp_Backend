const express = require("express");
const router = express.Router();
const pool = require("../db");
const authenticateToken = require("../middleware/authMiddleware");

router.get("/me", authenticateToken, async (req, res) => {
  const userId = req.user.userId;

  const result = await pool.query(
    "SELECT id, email, firstname, lastname, username FROM users WHERE id = $1",
    [userId]
  );

  if (result.rows.length === 0) {
    return res.status(404).json({ message: "User not found" });
  }

  return res.json(result.rows[0]);
});

module.exports = router;
