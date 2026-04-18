const express = require("express");
const {
  createComplaint,
  getMyComplaints,
  listComplaintsAdmin,
  getMapComplaints,
  getComplaintById,
  updateStatus,
  assignComplaint,
} = require("../controllers/complaintController");
const { authenticate, requireRole } = require("../middleware/auth");
const { upload } = require("../middleware/upload");

const router = express.Router();

router.post(
  "/",
  authenticate,
  requireRole("citizen"),
  upload.single("image"),
  createComplaint
);

router.get("/my", authenticate, requireRole("citizen"), getMyComplaints);
router.get("/map", authenticate, getMapComplaints);
router.get("/", authenticate, requireRole("admin"), listComplaintsAdmin);

router.patch("/:id/status", authenticate, requireRole("admin"), updateStatus);
router.patch("/:id/assign", authenticate, requireRole("admin"), assignComplaint);
router.get("/:id", authenticate, getComplaintById);

module.exports = router;
