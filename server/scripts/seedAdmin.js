const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const existing = await User.findOne({ email: "admin@binflow.com" });
  if (existing) {
    console.log("Admin already exists");
    process.exit(0);
  }
  const passwordHash = await bcrypt.hash("admin123", 10);
  await User.create({ name: "BinFlow Admin", email: "admin@binflow.com", passwordHash, role: "admin" });
  console.log("Admin created: admin@binflow.com / admin123");
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });