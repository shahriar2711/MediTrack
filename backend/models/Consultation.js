const mongoose = require("mongoose");

const consultationSchema = mongoose.Schema(
  {
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    symptoms: {
      type: String,
      required: true
    },
    diagnosis: {
      type: String,
      required: true
    },
    notes: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Consultation", consultationSchema);