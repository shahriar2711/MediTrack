const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// PATIENT REGISTRATION
const registerPatient = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExists = await User.findOne({ email });
    if (userExists) return res.status(400).json({ message: "User already exists" });
    const hashedPassword = await bcrypt.hash(password, 10);
    await User.create({ name, email, password: hashedPassword, role: "patient", patientId: "P" + Date.now() });
    res.status(201).json({ message: "Patient registered successfully" });
  } catch (error) {
    console.error("registerPatient error:", error.message);
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

// DOCTOR REGISTRATION (Admin only)
const registerDoctor = async (req, res) => {
  try {
    const { name, email, password, licenseNumber } = req.body;
    if (!name || !email || !password || !licenseNumber)
      return res.status(400).json({ message: "All fields including license number are required" });
    const licenseRegex = /^[A-Za-z0-9\-]{6,20}$/;
    if (!licenseRegex.test(licenseNumber))
      return res.status(400).json({ message: "Invalid license number format. Use 6-20 alphanumeric characters." });
    const emailExists = await User.findOne({ email });
    if (emailExists) return res.status(400).json({ message: "A user with this email already exists" });
    const licenseExists = await User.findOne({ licenseNumber: licenseNumber.toUpperCase() });
    if (licenseExists) return res.status(400).json({ message: "A doctor with this license number is already registered" });
    const hashedPassword = await bcrypt.hash(password, 10);
    const doctor = await User.create({ name, email, password: hashedPassword, role: "doctor", licenseNumber: licenseNumber.toUpperCase() });
    res.status(201).json({ message: "Doctor registered successfully", doctor: { id: doctor._id, name: doctor.name, email: doctor.email, licenseNumber: doctor.licenseNumber, role: doctor.role } });
  } catch (error) {
    console.error("registerDoctor error:", error.message);
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({ message: `A user with this ${field === "licenseNumber" ? "license number" : field} already exists` });
    }
    res.status(500).json({ message: "Server error", detail: error.message });
  }
};

// ══════════════════════════════════════════════════════════════
// LOGIN  ← FIXED: now has try/catch + JWT_SECRET guard
// ══════════════════════════════════════════════════════════════
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // 1. Input validation
    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    // 2. JWT_SECRET guard — this is the #1 cause of 500 on new deployments
    if (!process.env.JWT_SECRET) {
      console.error("FATAL: JWT_SECRET environment variable is not set on Render");
      return res.status(500).json({ message: "Server config error: JWT_SECRET not set" });
    }

    // 3. Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 4. Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // 5. Sign token and return
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (error) {
    // Real error now visible in Render → Logs tab
    console.error("login error:", error.message);
    res.status(500).json({ message: "Server error during login", detail: error.message });
  }
};

module.exports = { registerPatient, registerDoctor, login };