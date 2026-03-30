import User from "../../model/User.js";
import bcrypt from "bcrypt";
import { CloudinaryService } from "../../services/cloudinaryService.js";
import { apiResponseManager } from "../../utilities/general/response-manager.js";
import redis from "../../config/redis.js";
import logger from "../../utilities/general/logger.js";

// ... (top of file)

// Wait for Cloudinary to complete
await CloudinaryService.createUserFolder(newUser._id.toString());
logger.info({ userId: newUser._id }, "Cloudinary folders created for user");
    } catch (cloudinaryError) {
  logger.error({ err: cloudinaryError, userId: newUser?._id }, "Cloudinary folder creation failed");
  // Delete user if Cloudinary failed
  if (newUser) {
    await User.findByIdAndDelete(newUser._id);
  }

  return apiResponseManager(req, res, {
    statusCode: 500,
    success: false,
    message:
      "Registration failed due to storage system error. Please try again.",
    errorCode: "InternalServerError",
  });
}

// Update rate limiting
await updateRateLimit(email, clientIP);

return apiResponseManager(req, res, {
  statusCode: 201,
  success: true,
  message: "User registered successfully!",
  data: {
    user: {
      id: newUser._id,
      firstname: newUser.firstname,
      lastname: newUser.lastname,
      email: newUser.email,
    },
  },
});
  } catch (error) {
  logger.error({ err: error, email }, "Registration error");

  return apiResponseManager(req, res, {

    statusCode: 500,
    success: false,
    message: "Registration failed. Please try again.",
    errorCode: "InternalServerError",
  });
}
};
