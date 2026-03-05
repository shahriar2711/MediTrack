const User = require("../models/User");

const searchPatient = async (req, res) => {
  try {
    const patient = await User.findOne({
      patientId: req.params.patientId,
      role: "patient"
    }).select("-password");

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    res.json(patient);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const Consultation = require("../models/Consultation");

const createConsultation = async (req, res) => {
  try {
    const { patientId, symptoms, diagnosis, notes } = req.body;

    const patient = await User.findOne({
      patientId,
      role: "patient"
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const consultation = await Consultation.create({
      patient: patient._id,
      doctor: req.user._id,
      symptoms,
      diagnosis,
      notes
    });

    res.status(201).json(consultation);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

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

const getConsultationHistory = async (req, res) => {
  try {
    const patient = await User.findOne({
      patientId: req.params.patientId,
      role: "patient"
    });

    if (!patient) {
      return res.status(404).json({ message: "Patient not found" });
    }

    const consultations = await Consultation.find({
      patient: patient._id
    })
      .populate("doctor", "name")
      .sort({ createdAt: -1 });

    res.json(consultations);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

const Prescription = require("../models/Prescription");

const getPatientPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription.find({
      patient: req.params.patientId
    })
      .populate("consultation", "diagnosis createdAt")
      .sort({ createdAt: -1 });

    res.json(prescriptions);
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};



const getAllConsultations = async (req, res) => {
  try {
    const consultations = await Consultation
      .find()
      .populate("patient", "name patientId")
      .sort({ createdAt: -1 });

    res.json(consultations);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Failed to fetch consultations" });
  }
};



const getAllPrescriptions = async (req, res) => {
  try {
    const prescriptions = await Prescription
      .find()
      .populate({
        path: "consultation",
        populate: {
          path: "patient",
          select: "name patientId"
        }
      });

    res.json(prescriptions);

  } catch (error) {
    res.status(500).json({ message: "Failed to fetch prescriptions" });
  }
};

module.exports = { searchPatient, createConsultation, getPatientConsultations, getConsultationHistory , getPatientPrescriptions , getAllConsultations, getAllPrescriptions};