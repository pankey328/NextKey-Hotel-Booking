const cloudinary = require("cloudinary").v2;
const sharp = require("sharp");

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadImage = async (files) => {
  const fileArray = Object.values(files).flat();
  const results = [];

  const MAX_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/jpg", "image/png"];

  for (const file of fileArray) {
    try {
      if (!ALLOWED_TYPES.includes(file.mimetype)) {
        throw new Error(
          `Upload failed: ${file.name} is not a valid format. Only JPG, JPEG, and PNG are allowed.`,
        );
      }

      if (file.size > MAX_SIZE) {
        throw new Error(
          `Upload failed: ${file.name} exceeds the 5MB size limit.`,
        );
      }

      let compressedBuffer;
      if (file.mimetype === "image/png") {
        compressedBuffer = await sharp(file.data)
          .png({ quality: 70 })
          .toBuffer();
      } else {
        compressedBuffer = await sharp(file.data)
          .jpeg({ quality: 70 })
          .toBuffer();
      }

      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream((error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          })
          .end(compressedBuffer);
      });

      results.push(result);
    } catch (error) {
      console.error("Error processing/uploading file:", error.message);
      throw error;
    }
  }

  return results;
};
