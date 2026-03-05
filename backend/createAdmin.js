const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("./models/User");
require("dotenv").config();

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = "admin@meditrack.com";

    const existing = await User.findOne({ email });

    if (existing) {
      console.log("Admin already exists");
      process.exit();
    }

    const hashedPassword = await bcrypt.hash("admin123", 10);

    await User.create({
      name: "System Admin",
      email,
      password: hashedPassword,
      role: "admin",
    });

    console.log("Admin created successfully");
    process.exit();

  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

createAdmin();