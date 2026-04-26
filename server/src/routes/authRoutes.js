const router = require("express").Router();
const { register, login, getMe } = require("../controllers/authController");
const { verifyToken, requireRole } = require("../middleware/auth");
const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/response");

router.post("/register", register);
router.post("/login", login);
router.get("/me", verifyToken, getMe);

// Workers list for admin dispatch
router.get("/workers", verifyToken, requireRole("admin"), async (req, res) => {
  try {
    const workers = await User.find({ role: "worker" }).select("-passwordHash");
    return sendSuccess(res, workers, "Workers fetched");
  } catch (err) {
    return sendError(res, err.message, 500);
  }
});

module.exports = router;