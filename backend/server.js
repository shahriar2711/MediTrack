const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

dotenv.config();
connectDB();

const app = express();

const allowedOrigins = [
  "http://localhost:5173",           // local dev
  "https://medi-track-lake-seven.vercel.app/",    // your Vercel URL (update after deploying frontend)
  /\.vercel\.app$/                   // any vercel preview URL
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.some(o =>
      typeof o === "string" ? o === origin : o.test(origin)
    )) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true
}));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running...");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use("/api/auth", require("./routes/authRoutes"));

const { protect, authorizeRoles } = require("./middleware/authMiddleware");

app.get("/api/protected", protect, (req, res) => {
  res.json({
    message: "Protected route accessed",
    user: req.user
  });
});

app.use("/api/doctor", require("./routes/doctorRoutes"));

app.use("/api/patient", require("./routes/patientRoutes"));

app.use("/api/prescriptions", require("./routes/prescriptionRoutes"));