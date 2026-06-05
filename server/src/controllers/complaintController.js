const Complaint = require("../models/Complaint");
const StatusLog = require("../models/StatusLog");
const { uploadToCloudinary } = require("../services/cloudinaryUpload");
const { sendSuccess, sendError } = require("../utils/response");

async function createComplaint(req, res) {
  try {
    const { category, title, description, latitude, longitude, address, ward, priority } = req.body;
    if (!category || !title || !description || !latitude || !longitude) {
      return sendError(res, "category, title, description, latitude, longitude are required");
    }

    let imageUrl = "";
    if (req.file) {
      imageUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    }

    const complaint = await Complaint.create({
      userId: req.user._id,
      category,
      title,
      description,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      address,
      ward,
      priority: priority || "medium",
      imageUrl,
    });

    return sendSuccess(res, complaint, "Complaint submitted", 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
}

async function getMyComplaints(req, res) {
  try {
    const items = await Complaint.find({ userId: req.user._id }).sort({ createdAt: -1 });
    return sendSuccess(res, { items, total: items.length }, "Complaints fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
}

async function getAllComplaints(req, res) {
  try {
    const { status, category, ward, from, to, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (category) filter.category = category;
    if (ward) filter.ward = ward;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = new Date(from);
      if (to) filter.createdAt.$lte = new Date(to);
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [items, total] = await Promise.all([
      Complaint.find(filter)
        .populate("userId", "name email")
        .populate("assignedTo", "name email")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Complaint.countDocuments(filter),
    ]);

    return sendSuccess(res, { items, total, page: parseInt(page), limit: parseInt(limit) }, "Complaints fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
}

async function getAssignedComplaints(req, res) {
  try {
    const items = await Complaint.find({
      assignedTo: req.user._id,
      status: { $in: ["assigned", "in_progress", "resolved", "closed"] },
    })
      .sort({ createdAt: -1 })
      .lean();
    return sendSuccess(res, { items, total: items.length }, "Assigned complaints fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
}

async function getComplaintById(req, res) {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("userId", "name email phone")
      .populate("assignedTo", "name email phone");
    if (!complaint) return sendError(res, "Complaint not found", 404);

    if (req.user.role === "citizen" && complaint.userId._id.toString() !== req.user._id.toString()) {
      return sendError(res, "Access denied", 403);
    }
    if (req.user.role === "worker") {
      const assignedId = complaint.assignedTo?._id?.toString() || complaint.assignedTo?.toString();
      if (assignedId !== req.user._id.toString()) {
        return sendError(res, "Access denied", 403);
      }
    }

    // Fetch chronological status log history
    const statusLogs = await StatusLog.find({ complaintId: complaint._id })
      .populate("updatedBy", "name role")
      .sort({ createdAt: 1 })
      .lean();

    const complaintObj = complaint.toObject();
    complaintObj.statusLogs = statusLogs || [];

    return sendSuccess(res, complaintObj, "Complaint fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
}

async function updateStatus(req, res) {
  try {
    const { status, comment } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return sendError(res, "Complaint not found", 404);

    if (req.user.role === "worker") {
      if (complaint.assignedTo?.toString() !== req.user._id.toString()) {
        return sendError(res, "Access denied", 403);
      }
      const allowed = ["in_progress", "resolved"];
      if (!allowed.includes(status)) {
        return sendError(res, "Workers can only set status to in_progress or resolved", 403);
      }
      if (status === "resolved") {
        if (!req.file) {
          return sendError(res, "Resolution photo proof is required to resolve the complaint", 400);
        }
        if (!comment || !comment.trim()) {
          return sendError(res, "Resolution description/note is required to resolve the complaint", 400);
        }
      }
    }

    let afterImageUrl = complaint.afterImageUrl;
    if (req.file) {
      afterImageUrl = await uploadToCloudinary(req.file.buffer, req.file.mimetype);
    }

    const oldStatus = complaint.status;
    complaint.status = status;
    if (status === "resolved") {
      complaint.resolvedAt = new Date();
      complaint.afterImageUrl = afterImageUrl;
      complaint.resolutionNote = comment || "";
    }
    await complaint.save();

    await StatusLog.create({
      complaintId: complaint._id,
      updatedBy: req.user._id,
      oldStatus,
      newStatus: status,
      comment: comment || "",
    });

    return sendSuccess(res, complaint, "Status updated");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
}

async function assignComplaint(req, res) {
  try {
    const { workerId } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return sendError(res, "Complaint not found", 404);

    const oldStatus = complaint.status;
    complaint.assignedTo = workerId;
    complaint.status = "assigned";
    await complaint.save();

    await StatusLog.create({
      complaintId: complaint._id,
      updatedBy: req.user._id,
      oldStatus,
      newStatus: "assigned",
      comment: "Assigned to worker",
    });

    return sendSuccess(res, complaint, "Complaint assigned");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
}

async function dispatchComplaint(req, res) {
  try {
    const { workerId, dispatchNote, estimatedArrival } = req.body;
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) return sendError(res, "Complaint not found", 404);

    const oldStatus = complaint.status;
    complaint.assignedTo = workerId;
    complaint.status = "assigned";
    complaint.dispatchNote = dispatchNote || "";
    complaint.estimatedArrival = estimatedArrival || "";
    await complaint.save();

    await StatusLog.create({
      complaintId: complaint._id,
      updatedBy: req.user._id,
      oldStatus,
      newStatus: "assigned",
      comment: "Dispatched: " + (dispatchNote || ""),
    });

    const populated = await complaint.populate("assignedTo", "name email");
    return sendSuccess(res, populated, "Truck dispatched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
}

async function getMapComplaints(req, res) {
  try {
    const complaints = await Complaint.find({})
      .select("title latitude longitude status category")
      .lean();
    return sendSuccess(res, complaints, "Map data fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
}

module.exports = {
  createComplaint,
  getMyComplaints,
  getAssignedComplaints,
  getAllComplaints,
  getComplaintById,
  updateStatus,
  assignComplaint,
  dispatchComplaint,
  getMapComplaints,
};