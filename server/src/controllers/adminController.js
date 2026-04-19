const Complaint = require("../models/Complaint");
const { sendSuccess, sendError } = require("../utils/response");

async function getStats(req, res) {
  try {
    const [total, reported, assigned, in_progress, resolved, closed] = await Promise.all([
      Complaint.countDocuments(),
      Complaint.countDocuments({ status: "reported" }),
      Complaint.countDocuments({ status: "assigned" }),
      Complaint.countDocuments({ status: "in_progress" }),
      Complaint.countDocuments({ status: "resolved" }),
      Complaint.countDocuments({ status: "closed" }),
    ]);
    return sendSuccess(res, { total, reported, assigned, in_progress, resolved, closed }, "Stats fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
}

async function getTrends(req, res) {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const trends = await Complaint.aggregate([
      { $match: { createdAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
      { $project: { date: "$_id", count: 1, _id: 0 } },
    ]);

    return sendSuccess(res, trends, "Trends fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
}

async function getCategories(req, res) {
  try {
    const categories = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { category: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);
    return sendSuccess(res, categories, "Categories fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
}

async function getWards(req, res) {
  try {
    const wards = await Complaint.aggregate([
      { $match: { ward: { $ne: null, $ne: "" } } },
      { $group: { _id: "$ward", count: { $sum: 1 } } },
      { $project: { ward: "$_id", count: 1, _id: 0 } },
      { $sort: { count: -1 } },
    ]);
    return sendSuccess(res, wards, "Wards fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
}

module.exports = { getStats, getTrends, getCategories, getWards };