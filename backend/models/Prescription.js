const mongoose = require("mongoose");

const prescriptionSchema = mongoose.Schema(
  {
    consultation: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Consultation",
      required: true,
      unique: true
    },
    doctor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    patient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    medicines: [
      {
        name: {
          type: String,
          required: true
        },
        dosage: {
          type: String,
          required: true
        },
        frequency: {
          type: String,
          required: true
        },
        duration: {
          type: String,
          required: true
        }
      }
    ],
    notes: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Prescription", prescriptionSchema);