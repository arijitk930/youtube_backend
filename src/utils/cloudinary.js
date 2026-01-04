import { v2 as cloudinary } from "cloudinary";
import fs from "fs";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) return null;

    //upload the file
    const res = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    //file has been uploaded

    /* console.log("File is uploaded.", res.url); */
    fs.unlinkSync(localFilePath);
    return res;
  } catch (error) {
    fs.unlinkSync(localFilePath); //remove the locally saved temporary file as the upload opeartion got failed
    return null;
  }
};

const deleteFromCloudinary = async (publicId) => {
  try {
    if (!publicId) return null; // If no publicId is provided, exit early
    // delete the file from cloudinary
    const response = await cloudinary.uploader.destroy(publicId, {
      resource_type: "auto",
    }); // "resource_type: 'auto'" allows images, videos, pdfs, etc.
    return response; // Response will contain { result: 'ok' } if deleted
  } catch (error) {
    console.error("Error deleting file from Cloudinary:", error);
    return null; // Return null so the calling function knows deletion failed
  }
};

export { uploadOnCloudinary, deleteFromCloudinary };
