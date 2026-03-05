const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const {
  createPrescription
} = require("../controllers/prescriptionController");

router.post(
  "/",
  protect,
  authorizeRoles("doctor"),
  createPrescription
);

module.exports = router;