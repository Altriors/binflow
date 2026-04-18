const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/response");

const SALT_ROUNDS = 10;
const JWT_EXPIRES = "7d";

function signToken(user) {
  const secret = process.env.JWT_SECRET;
  return jwt.sign({ sub: user._id.toString(), role: user.role }, secret, {
    expiresIn: JWT_EXPIRES,
  });
}

async function register(req, res) {
  try {
    const { name, email, password, phone, ward, role } = req.body;

    if (!name || !email || !password) {
      return sendError(res, "Name, email, and password are required");
    }

    if (typeof password !== "string" || password.length < 6) {
      return sendError(res, "Password must be at least 6 characters");
    }

    if (role && role !== "citizen") {
      return sendError(res, "Only citizen self-registration is allowed");
    }

    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return sendError(res, "Email already registered", 409);
    }

    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      passwordHash,
      role: "citizen",
      phone: phone || "",
      ward: ward || "",
    });

    const token = signToken(user);

    return sendSuccess(
      res,
      {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone,
          ward: user.ward,
        },
        token,
      },
      "Registered successfully",
      201
    );
  } catch (err) {
    return sendError(res, err.message || "Registration failed", 500);
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return sendError(res, "Email and password are required");
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select(
      "+passwordHash"
    );
    if (!user) {
      return sendError(res, "Invalid credentials", 401);
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      return sendError(res, "Invalid credentials", 401);
    }

    const token = signToken(user);

    return sendSuccess(res, {
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        ward: user.ward,
      },
      token,
    });
  } catch (err) {
    return sendError(res, err.message || "Login failed", 500);
  }
}

async function me(req, res) {
  try {
    const user = await User.findById(req.user.id);
    if (!user) {
      return sendError(res, "User not found", 404);
    }

    return sendSuccess(res, {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      ward: user.ward,
    });
  } catch (err) {
    return sendError(res, err.message || "Failed to load profile", 500);
  }
}

module.exports = { register, login, me };
