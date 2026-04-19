const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    userId:           { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo:       { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    category:         { type: String, enum: ["overflowing_bin", "missed_pickup", "roadside_dumping", "dead_animal", "other"], required: true },
    title:            { type: String, required: true, trim: true },
    description:      { type: String, required: true },
    imageUrl:         { type: String },
    beforeImageUrl:   { type: String },
    afterImageUrl:    { type: String },
    latitude:         { type: Number, required: true },
    longitude:        { type: Number, required: true },
    address:          { type: String },
    ward:             { type: String },
    status:           { type: String, enum: ["reported", "assigned", "in_progress", "resolved", "closed"], default: "reported" },
    priority:         { type: String, enum: ["low", "medium", "high"], default: "medium" },
    resolutionNote:   { type: String },
    dispatchNote:     { type: String },
    estimatedArrival: { type: String },
    resolvedAt:       { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);