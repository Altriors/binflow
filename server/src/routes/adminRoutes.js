const express = require("express");
const {
  getStats,
  getTrends,
  getCategoryBreakdown,
  getWards,
} = require("../controllers/adminController");
const { authenticate, requireRole } = require("../middleware/auth");

const router = express.Router();

router.use(authenticate, requireRole("admin"));

router.get("/stats", getStats);
router.get("/trends", getTrends);
router.get("/categories", getCategoryBreakdown);
router.get("/wards", getWards);

module.exports = router;
