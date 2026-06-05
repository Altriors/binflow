const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const { sendSuccess, sendError } = require("../utils/response");

function signToken(user) {
  return jwt.sign(
    { _id: user._id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function safeUser(user) {
  const obj = user.toObject();
  delete obj.passwordHash;
  return obj;
}

async function register(req, res) {
  try {
    const { name, email, password, phone, ward } = req.body;
    if (!name || !email || !password) {
      return sendError(res, "Name, email, and password are required");
    }
    const existing = await User.findOne({ email });
    if (existing) return sendError(res, "Email already registered");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, passwordHash, phone, ward });
    const token = signToken(user);
    return sendSuccess(res, { token, user: safeUser(user) }, "Registration successful", 201);
  } catch (error) {
    return sendError(res, error.message, 500);
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password) return sendError(res, "Email and password are required");

    const user = await User.findOne({ email });
    if (!user) return sendError(res, "Invalid credentials", 401);

    const match = await user.comparePassword(password);
    if (!match) return sendError(res, "Invalid credentials", 401);

    const token = signToken(user);
    return sendSuccess(res, { token, user: safeUser(user) }, "Login successful");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
}

async function getMe(req, res) {
  try {
    const user = await User.findById(req.user._id).select("-passwordHash");
    if (!user) return sendError(res, "User not found", 404);
    return sendSuccess(res, user, "User fetched");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
}

async function updateProfile(req, res) {
  try {
    const { name, phone, ward } = req.body;
    const user = await User.findById(req.user._id);
    if (!user) return sendError(res, "User not found", 404);

    if (name) user.name = name;
    if (phone !== undefined) user.phone = phone;
    if (ward !== undefined) user.ward = ward;

    await user.save();

    const token = signToken(user);
    return sendSuccess(res, { token, user: safeUser(user) }, "Profile updated successfully");
  } catch (error) {
    return sendError(res, error.message, 500);
  }
}

module.exports = { register, login, getMe, updateProfile };