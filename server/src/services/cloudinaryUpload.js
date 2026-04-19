const cloudinary = require("../config/cloudinary");

async function uploadToCloudinary(fileBuffer, mimetype) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "binflow", resource_type: "image" },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url);
      }
    );
    stream.end(fileBuffer);
  });
}

module.exports = { uploadToCloudinary };