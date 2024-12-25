import { v2 as cloudinary } from 'cloudinary';
import fs from 'fs/promises'; // Use `fs/promises` for better async handling
import dotenv from "dotenv";
dotenv.config();
// Configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});
/**
 * Upload a file to Cloudinary.
 * @param {string} localFilePath - Path to the local file to upload.
 * @returns {Object|null} - Returns an object with Cloudinary details or null on failure.
 */
export const uploadOnCloudinary = async (localFilePath) => {
  try {
    if (!localFilePath) {
      console.error("Invalid file path provided for upload.");
      return null;
    }
    // Upload file to Cloudinary
    const result = await cloudinary.uploader.upload(localFilePath, {
      resource_type: "auto",
    });
    console.log("File uploaded to Cloudinary:", result.secure_url);
    // Remove local file after successful upload
    await fs.unlink(localFilePath);
    return result;
  } catch (error) {
    console.error("Error uploading to Cloudinary:", error);
    // Attempt to remove the local file even on failure
    try {
      await fs.unlink(localFilePath);
    } catch (unlinkError) {
      console.error("Error deleting local file:", unlinkError);
    }
    return null;
  }
};
/**
 * Delete a file from Cloudinary.
 * @param {string} publicId - The public ID of the file to delete.
 * @returns {boolean} - Returns true if the deletion was successful, false otherwise.
 */
export const deleteCloudinary = async (publicId) => {
  try {
    const result = await cloudinary.uploader.destroy(publicId);
    console.log("Deleted from Cloudinary:", result);
    return result.result === "ok";
  } catch (error) {
    console.error("Error deleting from Cloudinary:", error);
    return false;
  }
};
