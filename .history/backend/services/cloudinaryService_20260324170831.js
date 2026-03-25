// services/cloudinaryService.js
import cloudinary from "../config/cloudinary.js";
import { Readable } from "stream";

export class CloudinaryService {
  static async createUserFolder(userId) {
    const folderName = `users/${userId}`;

    // Create main user folder
    await cloudinary.api.create_folder(folderName);

    // Create organized subfolders
    const subfolders = ["albums", "avatars", "documents", "temp"];
    for (const subfolder of subfolders) {
      await cloudinary.api.create_folder(`${folderName}/${subfolder}`);
    }

    return folderName;
  }

  static async deleteUserFolder(userId) {
    try {
      // Delete all resources in the folder first
      await cloudinary.api.delete_resources_by_prefix(`users/${userId}/`);
      // Then delete the folder itself
      await cloudinary.api.delete_folder(`users/${userId}`);
    } catch (error) {
      console.warn(
        `Could not delete Cloudinary folder for user ${userId}:`,
        error.message
      );
    }
  }
}
