const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// --------------------
// PATIENT REGISTRATION
// --------------------
const registerPatient = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const patient = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "patient",
      patientId: "P" + Date.now()
    });

    res.status(201).json({
      message: "Patient registered successfully"
    });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------
// DOCTOR REGISTRATION  (Admin only — protect this route with authorizeRoles("admin"))
// --------------------
const registerDoctor = async (req, res) => {
  try {
    const { name, email, password, licenseNumber } = req.body;

    // ── Validate all required fields ──────────────────────────────────────
    if (!name || !email || !password || !licenseNumber) {
      return res.status(400).json({
        message: "Name, email, password and license number are all required",
      });
    }

    // ── License format check: letters + digits, 6-20 chars ────────────────
    // Adjust the regex to match your country's medical council format
    // Examples: "MED-2024-001234", "BMDC12345", "GMC7654321"
    const licenseRegex = /^[A-Za-z0-9\-]{6,20}$/;
    if (!licenseRegex.test(licenseNumber)) {
      return res.status(400).json({
        message: "Invalid license number format. Use 6-20 alphanumeric characters.",
      });
    }

    // ── Check email uniqueness ────────────────────────────────────────────
    const emailExists = await User.findOne({ email });
    if (emailExists) {
      return res.status(400).json({ message: "A user with this email already exists" });
    }

    // ── Check license uniqueness ──────────────────────────────────────────
    const licenseExists = await User.findOne({
      licenseNumber: licenseNumber.toUpperCase(),
    });
    if (licenseExists) {
      return res.status(400).json({
        message: "A doctor with this license number is already registered",
      });
    }

    // ── Hash password ─────────────────────────────────────────────────────
    const hashedPassword = await bcrypt.hash(password, 10);

    // ── Create doctor ─────────────────────────────────────────────────────
    const doctor = await User.create({
      name,
      email,
      password: hashedPassword,
      role: "doctor",
      licenseNumber: licenseNumber.toUpperCase(),
    });

    res.status(201).json({
      message: "Doctor registered successfully",
      doctor: {
        id: doctor._id,
        name: doctor.name,
        email: doctor.email,
        licenseNumber: doctor.licenseNumber,
        role: doctor.role,
      },
    });
  } catch (error) {
    // Catch MongoDB duplicate key error as a fallback
    if (error.code === 11000) {
      const field = Object.keys(error.keyPattern)[0];
      return res.status(400).json({
        message: `A user with this ${field === "licenseNumber" ? "license number" : field} already exists`,
      });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// --------------------
// LOGIN (UNCHANGED)
// --------------------
const login = async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    return res.status(400).json({ message: "Invalid credentials" });
  }

  const token = jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  res.json({ token });
};

module.exports = { registerPatient, registerDoctor, login };