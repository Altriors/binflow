const mongoose = require("mongoose");

const statusLogSchema = new mongoose.Schema({
  complaintId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Complaint",
    required: true,
    index: true,
  },
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  oldStatus: { type: String, required: true },
  newStatus: { type: String, required: true },
  comment: { type: String, trim: true, default: "" },
  timestamp: { type: Date, default: Date.now },
});

module.exports = mongoose.model("StatusLog", statusLogSchema);
