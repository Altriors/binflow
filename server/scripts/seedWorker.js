const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../.env") });

const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../src/models/User");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  const existing = await User.findOne({ email: "worker@binflow.com" });
  if (existing) {
    console.log("Worker already exists");
    process.exit(0);
  }
  const passwordHash = await bcrypt.hash("worker123", 10);
  await User.create({
    name: "Field Worker",
    email: "worker@binflow.com",
    passwordHash,
    role: "worker",
  });
  console.log("Worker created: worker@binflow.com / worker123");
  process.exit(0);
}

seed().catch((err) => { console.error(err); process.exit(1); });
