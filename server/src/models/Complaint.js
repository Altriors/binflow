const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        "overflowing_bin",
        "missed_pickup",
        "roadside_dumping",
        "dead_animal",
        "other",
      ],
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    imageUrl: { type: String, required: true },
    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },
    address: { type: String, trim: true, default: "" },
    ward: { type: String, trim: true, default: "" },
    status: {
      type: String,
      enum: ["reported", "assigned", "in_progress", "resolved", "closed"],
      default: "reported",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    resolutionNote: { type: String, trim: true, default: "" },
    resolvedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
