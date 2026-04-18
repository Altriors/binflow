const Complaint = require("../models/Complaint");
const StatusLog = require("../models/StatusLog");
const User = require("../models/User");
const { uploadImageBuffer } = require("../services/cloudinaryUpload");
const { sendSuccess, sendError } = require("../utils/response");

function parseNumber(value, label) {
  const n = typeof value === "number" ? value : parseFloat(value);
  if (Number.isNaN(n)) {
    throw new Error(`Invalid ${label}`);
  }
  return n;
}

async function createComplaint(req, res) {
  try {
    if (!req.file) {
      return sendError(res, "Image is required");
    }

    const {
      category,
      title,
      description,
      latitude,
      longitude,
      address,
      ward,
      priority,
    } = req.body;

    if (!category || !title || !description) {
      return sendError(res, "Category, title, and description are required");
    }

    let lat;
    let lng;
    try {
      lat = parseNumber(latitude, "latitude");
      lng = parseNumber(longitude, "longitude");
    } catch (e) {
      return sendError(res, e.message);
    }

    const imageUrl = await uploadImageBuffer(req.file.buffer, req.file.mimetype);

    const complaint = await Complaint.create({
      userId: req.user.id,
      category,
      title: title.trim(),
      description: description.trim(),
      imageUrl,
      latitude: lat,
      longitude: lng,
      address: (address || "").trim(),
      ward: (ward || "").trim(),
      priority: priority || "medium",
    });

    await StatusLog.create({
      complaintId: complaint._id,
      updatedBy: req.user.id,
      oldStatus: "n/a",
      newStatus: complaint.status,
      comment: "Complaint created",
    });

    return sendSuccess(res, { complaint }, "Complaint submitted", 201);
  } catch (err) {
    return sendError(res, err.message || "Could not create complaint", 500);
  }
}

async function getMyComplaints(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 10, 50);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      Complaint.find({ userId: req.user.id })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Complaint.countDocuments({ userId: req.user.id }),
    ]);

    return sendSuccess(res, { items, page, limit, total });
  } catch (err) {
    return sendError(res, err.message || "Could not load complaints", 500);
  }
}

function buildAdminFilters(query) {
  const filter = {};
  if (query.status) filter.status = query.status;
  if (query.category) filter.category = query.category;
  if (query.ward) filter.ward = query.ward;
  if (query.from || query.to) {
    filter.createdAt = {};
    if (query.from) filter.createdAt.$gte = new Date(query.from);
    if (query.to) filter.createdAt.$lte = new Date(query.to);
  }
  return filter;
}

async function listComplaintsAdmin(req, res) {
  try {
    const page = Math.max(parseInt(req.query.page, 10) || 1, 1);
    const limit = Math.min(parseInt(req.query.limit, 10) || 20, 100);
    const skip = (page - 1) * limit;
    const filter = buildAdminFilters(req.query);

    const [items, total] = await Promise.all([
      Complaint.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("userId", "name email phone")
        .populate("assignedTo", "name email phone role")
        .lean(),
      Complaint.countDocuments(filter),
    ]);

    return sendSuccess(res, { items, page, limit, total });
  } catch (err) {
    return sendError(res, err.message || "Could not list complaints", 500);
  }
}

function mapVisibilityFilter(req) {
  const { role, id } = req.user;
  if (role === "admin") return {};
  if (role === "citizen") return { userId: id };
  if (role === "worker") return { assignedTo: id };
  return { userId: id };
}

async function getMapComplaints(req, res) {
  try {
    const base = mapVisibilityFilter(req);
    const filter = { ...base, ...buildAdminFilters(req.query) };

    const items = await Complaint.find(filter)
      .select(
        "_id title category status priority latitude longitude ward createdAt userId assignedTo"
      )
      .sort({ createdAt: -1 })
      .limit(2000)
      .lean();

    return sendSuccess(res, { items });
  } catch (err) {
    return sendError(res, err.message || "Could not load map data", 500);
  }
}

async function getComplaintById(req, res) {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("userId", "name email phone ward")
      .populate("assignedTo", "name email phone role");

    if (!complaint) {
      return sendError(res, "Complaint not found", 404);
    }

    const { role, id } = req.user;
    const ownerId = complaint.userId?._id
      ? complaint.userId._id.toString()
      : String(complaint.userId);
    if (role === "citizen" && ownerId !== id) {
      return sendError(res, "Forbidden", 403);
    }
    if (
      role === "worker" &&
      (!complaint.assignedTo || complaint.assignedTo._id.toString() !== id)
    ) {
      return sendError(res, "Forbidden", 403);
    }

    const logs = await StatusLog.find({ complaintId: complaint._id })
      .sort({ timestamp: -1 })
      .populate("updatedBy", "name email role")
      .lean();

    return sendSuccess(res, { complaint, logs });
  } catch (err) {
    return sendError(res, err.message || "Could not load complaint", 500);
  }
}

async function updateStatus(req, res) {
  try {
    const { status, comment, resolutionNote } = req.body;
    if (!status) {
      return sendError(res, "status is required");
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, "Complaint not found", 404);
    }

    const oldStatus = complaint.status;
    if (oldStatus === status) {
      return sendError(res, "No change in status", 400);
    }

    complaint.status = status;
    if (resolutionNote !== undefined) {
      complaint.resolutionNote = String(resolutionNote).trim();
    }
    if (status === "resolved" || status === "closed") {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    await StatusLog.create({
      complaintId: complaint._id,
      updatedBy: req.user.id,
      oldStatus,
      newStatus: status,
      comment: (comment || "").trim(),
    });

    const fresh = await Complaint.findById(complaint._id)
      .populate("userId", "name email phone")
      .populate("assignedTo", "name email phone role");

    return sendSuccess(res, { complaint: fresh }, "Status updated");
  } catch (err) {
    return sendError(res, err.message || "Could not update status", 500);
  }
}

async function assignComplaint(req, res) {
  try {
    const { workerId } = req.body;
    if (!workerId) {
      return sendError(res, "workerId is required");
    }

    const worker = await User.findById(workerId);
    if (!worker || worker.role !== "worker") {
      return sendError(res, "Invalid worker", 400);
    }

    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return sendError(res, "Complaint not found", 404);
    }

    const oldStatus = complaint.status;
    complaint.assignedTo = workerId;
    if (complaint.status === "reported") {
      complaint.status = "assigned";
    }
    await complaint.save();

    await StatusLog.create({
      complaintId: complaint._id,
      updatedBy: req.user.id,
      oldStatus,
      newStatus: complaint.status,
      comment: `Assigned to worker ${worker.name}`,
    });

    const fresh = await Complaint.findById(complaint._id)
      .populate("userId", "name email phone")
      .populate("assignedTo", "name email phone role");

    return sendSuccess(res, { complaint: fresh }, "Complaint assigned");
  } catch (err) {
    return sendError(res, err.message || "Could not assign complaint", 500);
  }
}

module.exports = {
  createComplaint,
  getMyComplaints,
  listComplaintsAdmin,
  getMapComplaints,
  getComplaintById,
  updateStatus,
  assignComplaint,
};
