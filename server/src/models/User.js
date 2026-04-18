const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: { type: String, required: true, select: false },
    role: {
      type: String,
      enum: ["citizen", "admin", "worker"],
      default: "citizen",
    },
    phone: { type: String, trim: true, default: "" },
    ward: { type: String, trim: true, default: "" },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

module.exports = mongoose.model("User", userSchema);
