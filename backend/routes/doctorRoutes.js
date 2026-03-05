const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/authMiddleware");
const { searchPatient, createConsultation ,getConsultationHistory,getPatientPrescriptions , getAllConsultations , getAllPrescriptions} = require("../controllers/doctorController");

router.get(
  "/patient/:patientId",
  protect,
  authorizeRoles("doctor"),
  searchPatient
);

router.post(
  "/consultation",
  protect,
  authorizeRoles("doctor"),
  createConsultation
);

router.get(
  "/consultations/:patientId",
  protect,
  authorizeRoles("doctor"),
  getConsultationHistory
);



router.get(
  "/prescriptions/:patientId",
  protect,
  authorizeRoles("doctor"),
  getPatientPrescriptions
);

router.get(
  "/consultations",
  protect,
  authorizeRoles("doctor"),
  getAllConsultations
);

router.get(
  "/prescriptions",
  protect,
  authorizeRoles("doctor"),
  getAllPrescriptions
);

module.exports = router;