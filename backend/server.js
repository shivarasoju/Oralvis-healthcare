const express = require("express");
const cors = require("cors");
require("dotenv").config();

const authRoutes = require("./routes/authRoutes");
const scanRoutes = require("./routes/scanRoutes");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api", scanRoutes);

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
