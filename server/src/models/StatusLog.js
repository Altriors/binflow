const mongoose = require("mongoose");

const statusLogSchema = new mongoose.Schema({
  complaintId: { type: mongoose.Schema.Types.ObjectId, ref: "Complaint", required: true },
  updatedBy:   { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  oldStatus:   { type: String },
  newStatus:   { type: String, required: true },
  comment:     { type: String },
  timestamp:   { type: Date, default: Date.now },
});

module.exports = mongoose.model("StatusLog", statusLogSchema);