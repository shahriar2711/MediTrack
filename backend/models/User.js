const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true,
      unique: true
    },
    password: {
      type: String,
      required: true
    },
    role: {
      type: String,
      enum: ["patient", "doctor", "admin"],
      default: "patient"
    },
    patientId: {
      type: String,
      unique: true,
      sparse: true
    },
    licenseNumber: {
      type: String,
      unique: true,
      sparse: true,           // only doctors have this
      uppercase: true,        // normalize to uppercase always
      trim: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);