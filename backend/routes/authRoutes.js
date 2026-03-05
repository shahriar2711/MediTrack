const express = require("express");
const router = express.Router();

const {
  registerPatient,
  registerDoctor,
  login
} = require("../controllers/authController");

// 🔹 IMPORT MIDDLEWARE
const { protect, authorizeRoles } = require("../middleware/authMiddleware");


// Public
router.post("/register/patient", registerPatient);

// Admin only
router.post("/register-doctor", protect, authorizeRoles("admin"), registerDoctor);

router.post("/login", login);

module.exports = router;