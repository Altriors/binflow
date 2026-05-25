const router = require("express").Router();
const {
  createComplaint,
  getMyComplaints,
  getAssignedComplaints,
  getAllComplaints,
  getComplaintById,
  updateStatus,
  assignComplaint,
  dispatchComplaint,
  getMapComplaints,
} = require("../controllers/complaintController");
const { verifyToken, requireRole } = require("../middleware/auth");
const upload = require("../middleware/upload");

router.post("/", verifyToken, requireRole("citizen"), upload.single("image"), createComplaint);
router.get("/my", verifyToken, requireRole("citizen"), getMyComplaints);
router.get("/assigned", verifyToken, requireRole("worker"), getAssignedComplaints);
router.get("/map", verifyToken, requireRole("admin"), getMapComplaints);
router.get("/", verifyToken, requireRole("admin"), getAllComplaints);
router.get("/:id", verifyToken, getComplaintById);
router.patch("/:id/status", verifyToken, requireRole("admin", "worker"), updateStatus);
router.patch("/:id/assign", verifyToken, requireRole("admin"), assignComplaint);
router.patch("/:id/dispatch", verifyToken, requireRole("admin"), dispatchComplaint);

module.exports = router;