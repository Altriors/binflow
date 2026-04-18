const { configureCloudinary } = require("../config/cloudinary");

async function uploadImageBuffer(buffer, mimetype) {
  const cloudinary = configureCloudinary();
  const dataUri = `data:${mimetype};base64,${buffer.toString("base64")}`;
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: "binflow/complaints",
    resource_type: "image",
  });
  return result.secure_url;
}

module.exports = { uploadImageBuffer };
