const Consultation = require("../models/Consultation");

const getPatientConsultations = async (req, res) => {
  try {
    const consultations = await Consultation.find({
      patient: req.user._id
    })
      .populate("doctor", "name email")
      .sort({ createdAt: -1 });

    res.json(consultations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const Prescription = require("../models/Prescription");

const getMyPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      patient: req.user._id
    })
      .populate("doctor", "name email")
      .populate("consultation", "diagnosis createdAt")
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = {
  getPatientConsultations,
  getMyPrescriptions
};