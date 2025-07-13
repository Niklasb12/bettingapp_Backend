// routes/auth.js
const express = require("express");
const router = express.Router();
const pool = require("../db");
const jwt = require("jsonwebtoken");

const JWT_SECRET = process.env.JWT_SECRET || "supersecret";

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);

  if (user.rows.length === 0) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const isPasswordValid = user.rows[0].password_hash === password;
  if (!isPasswordValid) {
    return res.status(401).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign({ userId: user.rows[0].id }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return res.json({ message: "Login successful", token });
});

router.post("/register", async (req, res) => {
  const { firstname, lastname, username, email, password } = req.body;

  const existingUser = await pool.query(
    "SELECT * FROM users WHERE email = $1 OR username = $2",
    [email, username]
  );

  if (existingUser.rows.length > 0) {
    return res
      .status(409)
      .json({ message: "Email or Username already exists" });
  }

  const newUser = await pool.query(
    "INSERT INTO users (email, password_hash, firstname, lastname, username) VALUES ($1, $2, $3, $4, $5) RETURNING *",
    [email, password, firstname, lastname, username]
  );

  const token = jwt.sign({ userId: newUser.rows[0].id }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return res.json({ message: "Registration successful", token });
});

module.exports = router;
