const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { getPatientConsultations,getMyPrescriptions } = require("../controllers/patientController");

router.get(
  "/consultations",
  protect,
  authorizeRoles("patient"),
  getPatientConsultations
);

router.get(
  "/prescriptions",
  protect,
  authorizeRoles("patient"),
  getMyPrescriptions
);

module.exports = router;