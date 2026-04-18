const jwt = require("jsonwebtoken");
const { sendError } = require("../utils/response");

function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return sendError(res, "No token provided", 401);
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      return sendError(res, "Server misconfiguration", 500);
    }

    const payload = jwt.verify(token, secret);
    req.user = { id: payload.sub, role: payload.role };
    return next();
  } catch {
    return sendError(res, "Invalid or expired token", 401);
  }
}

function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return sendError(res, "Unauthorized", 401);
    }
    if (!roles.includes(req.user.role)) {
      return sendError(res, "Forbidden", 403);
    }
    return next();
  };
}

module.exports = { authenticate, requireRole };
