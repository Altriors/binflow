const Complaint = require("../models/Complaint");
const { sendSuccess, sendError } = require("../utils/response");

async function getStats(req, res) {
  try {
    const [total, byStatus, byCategory] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.aggregate([
        { $group: { _id: "$status", count: { $sum: 1 } } },
      ]),
      Complaint.aggregate([
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
    ]);

    const statusMap = Object.fromEntries(byStatus.map((x) => [x._id, x.count]));
    const open =
      (statusMap.reported || 0) +
      (statusMap.assigned || 0) +
      (statusMap.in_progress || 0);

    return sendSuccess(res, {
      total,
      open,
      resolved: (statusMap.resolved || 0) + (statusMap.closed || 0),
      byStatus: statusMap,
      byCategory: Object.fromEntries(byCategory.map((x) => [x._id, x.count])),
    });
  } catch (err) {
    return sendError(res, err.message || "Could not load stats", 500);
  }
}

async function getTrends(req, res) {
  try {
    const days = Math.min(parseInt(req.query.days, 10) || 30, 90);
    const start = new Date();
    start.setDate(start.getDate() - days);
    start.setHours(0, 0, 0, 0);

    const rows = await Complaint.aggregate([
      { $match: { createdAt: { $gte: start } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return sendSuccess(res, { points: rows.map((r) => ({ date: r._id, count: r.count })) });
  } catch (err) {
    return sendError(res, err.message || "Could not load trends", 500);
  }
}

async function getCategoryBreakdown(req, res) {
  try {
    const rows = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return sendSuccess(res, {
      items: rows.map((r) => ({ category: r._id, count: r.count })),
    });
  } catch (err) {
    return sendError(res, err.message || "Could not load categories", 500);
  }
}

async function getWards(req, res) {
  try {
    const rows = await Complaint.aggregate([
      { $match: { ward: { $nin: [null, ""] } } },
      { $group: { _id: "$ward", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    return sendSuccess(res, {
      items: rows.map((r) => ({ ward: r._id, count: r.count })),
    });
  } catch (err) {
    return sendError(res, err.message || "Could not load wards", 500);
  }
}

module.exports = { getStats, getTrends, getCategoryBreakdown, getWards };
