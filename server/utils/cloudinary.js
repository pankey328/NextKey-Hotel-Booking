const cloudinary = require("cloudinary").v2;

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

exports.uploadImage = async (files) => {
  console.log(`>>>>>>files`, files);

  const fileArray = Object.values(files);
  const results = [];

  for (const file of fileArray) {
    try {
      const result = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream((error, result) => {
            if (error) {
              reject(error);
            } else {
              resolve(result);
            }
          })
          .end(file.data);
      });

      results.push(result);
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  }

  return results;
};
