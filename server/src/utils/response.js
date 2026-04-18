function sendSuccess(res, data = null, message = "", status = 200) {
  return res.status(status).json({ success: true, data, message });
}

function sendError(res, message = "Something went wrong", status = 400) {
  return res.status(status).json({ success: false, data: null, message });
}

module.exports = { sendSuccess, sendError };
