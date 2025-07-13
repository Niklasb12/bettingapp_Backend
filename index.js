const express = require("express");
const cors = require("cors");
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// 👇 Importera routes
const userRoutes = require("./routes/users");
const authRoutes = require("./routes/auth");

// 👇 Koppla in routes
app.use("/users", userRoutes);
app.use("/", authRoutes); // /login, /register

app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
