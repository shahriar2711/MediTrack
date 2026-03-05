const Prescription = require("../models/Prescription");
const Consultation = require("../models/Consultation");

const createPrescription = async (req, res) => {
  try {
    const { consultationId, medicines, notes } = req.body;

    //  Validation — FIRST
    if (!consultationId) {
      return res.status(400).json({ message: "Consultation ID is required" });
    }

    if (!medicines || medicines.length === 0) {
      return res.status(400).json({ message: "Medicines required" });
    }

    //  Now database work
    const consultation = await Consultation.findById(consultationId);

    if (!consultation) {
      return res.status(404).json({ message: "Consultation not found" });
    }

    //  Ownership check
    if (consultation.doctor.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Not authorized" });
    }

    //  Duplicate prevention
    const existing = await Prescription.findOne({
      consultation: consultationId
    });

    if (existing) {
      return res
        .status(400)
        .json({ message: "Prescription already exists" });
    }

    //  Create prescription
    const prescription = await Prescription.create({
      consultation: consultation._id,
      doctor: consultation.doctor,
      patient: consultation.patient,
      medicines,
      notes
    });

    res.status(201).json(prescription);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

module.exports = { createPrescription };