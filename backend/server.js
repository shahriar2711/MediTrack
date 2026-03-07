const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// ── CORS — must be FIRST before any routes ───────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:5173",
    "http://localhost:3000",
    "https://medi-track-lake-seven.vercel.app",
    /\.vercel\.app$/,
  ],
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
}));

// ✅ FIX: "/(.*)" instead of "*" — required for Express 5 + path-to-regexp v8
app.options("/(.*)", cors());

// ── Body parser ───────────────────────────────────────────────────────────────
app.use(express.json());

// ── Database ──────────────────────────────────────────────────────────────────
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("MongoDB connected ✅"))
  .catch((err) => console.error("MongoDB error:", err));

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.json({ message: "MediTrack API is running ✅" });
});

// ── Middleware ────────────────────────────────────────────────────────────────
const { protect } = require("./middleware/authMiddleware");

// ── Routes ────────────────────────────────────────────────────────────────────
const authRoutes    = require("./routes/authRoutes");
const doctorRoutes  = require("./routes/doctorRoutes");
const patientRoutes = require("./routes/patientRoutes");

app.use("/api/auth",    authRoutes);
app.use("/api/doctor",  doctorRoutes);
app.use("/api/patient", patientRoutes);

// ── Protected route ───────────────────────────────────────────────────────────
app.get("/api/protected", protect, (req, res) => {
  res.json({ user: req.user });
});

// ── 404 fallback ──────────────────────────────────────────────────────────────
app.use((req, res) => {
  console.log(`404 → ${req.method} ${req.url}`);
  res.status(404).json({ message: `Route ${req.method} ${req.url} not found` });
});

// ── Start server ──────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));