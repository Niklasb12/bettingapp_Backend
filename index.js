const express = require("express");
const app = express();
const pool = require("./db");
const PORT = 3000;
const jwt = require("jsonwebtoken");
const JWT_SECRET = process.env.JWT_SECRET || "supersecret";
const cors = require("cors");

const corsOptions = {
  origin: "*", // 👈 tillåt alla under utveckling
  methods: ["GET", "POST", "OPTIONS"],
  allowedHeaders: ["Content-Type"],
};

app.use(cors(corsOptions));
// app.options("*", cors(corsOptions)); // 👈 viktig för preflight

app.use(express.json());

app.get("/users", async (req, res) => {
  const allUsers = await pool.query("SELECT id, email, created_at FROM users");
  return res.json(allUsers.rows);
});

app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  const user = await pool.query("SELECT * FROM users WHERE email = $1", [
    email,
  ]);
  console.log(user.rows);

  if (user.rows.length === 0) {
    return res
      .status(401)
      .json({ message: "Invalid credentials user.rows.length" });
  }

  const isPasswordValid = user.rows[0].password_hash === password;

  if (!isPasswordValid) {
    return res
      .status(401)
      .json({ message: "Invalid credentials isPasswordValid" });
  }

  const token = jwt.sign({ userId: user.rows[0].id }, JWT_SECRET, {
    expiresIn: "7d",
  });

  return res.json({ message: "Login successful", token });
});

app.post("/register", async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
