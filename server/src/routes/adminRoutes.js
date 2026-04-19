const router = require("express").Router();
const { getStats, getTrends, getCategories, getWards } = require("../controllers/adminController");
const { verifyToken, requireRole } = require("../middleware/auth");

router.use(verifyToken, requireRole("admin"));

router.get("/stats", getStats);
router.get("/trends", getTrends);
router.get("/categories", getCategories);
router.get("/wards", getWards);

module.exports = router;