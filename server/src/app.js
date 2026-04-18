const express = require("express");
const cors = require("cors");
const multer = require("multer");
const authRoutes = require("./routes/authRoutes");
const complaintRoutes = require("./routes/complaintRoutes");
const adminRoutes = require("./routes/adminRoutes");
const { sendError, sendSuccess } = require("./utils/response");

const app = express();

app.use(
  cors({
    origin: process.env.CLIENT_URL || true,
    credentials: true,
  })
);
app.use(express.json({ limit: "1mb" }));

app.get("/", (_req, res) => {
  return sendSuccess(
    res,
    {
      name: "BinFlow API",
      health: "/health",
      auth: "/api/auth",
      complaints: "/api/complaints",
      admin: "/api/admin",
      hint: "The React UI runs separately (usually http://localhost:5173 — npm run dev in client/).",
    },
    "BinFlow backend is running."
  );
});

app.get("/health", (_req, res) => {
  res.status(200).json({ success: true, data: { ok: true }, message: "" });
});

app.use("/api/auth", authRoutes);
app.use("/api/complaints", complaintRoutes);
app.use("/api/admin", adminRoutes);

app.use((err, _req, res, _next) => {
  if (err instanceof multer.MulterError) {
    return sendError(res, err.message || "Upload error", 400);
  }
  if (err && err.message === "Only image files are allowed") {
    return sendError(res, err.message, 400);
  }
  return sendError(res, err.message || "Internal server error", 500);
});

module.exports = app;
