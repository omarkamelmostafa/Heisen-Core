import User from "../../model/User.js";
import bcrypt from "bcrypt";
import { CloudinaryService } from "../../services/cloudinaryService.js";
import { apiResponseManager } from "../../utilities/general/response-manager.js";
import redis from "../../config/redis.js";

// ─── Rate Limiting Helpers (Redis-backed) ───────────────────────────

const isRateLimited = async (email, ip) => {
  const emailKey = `reg_limit:email:${email}`;
  const ipKey = `reg_limit:ip:${ip}`;

  // Get current timestamps from Redis
  const [lastEmailAttempt, lastIPAttempt] = await Promise.all([
    redis.get(emailKey),
    redis.get(ipKey),
  ]);

  if (lastEmailAttempt || lastIPAttempt) {
    const latestAttempt = Math.max(
      parseInt(lastEmailAttempt || 0),
      parseInt(lastIPAttempt || 0)
    );
    const timeRemaining = Math.ceil(
      (latestAttempt + 5 * 60 * 1000 - Date.now()) / 1000 / 60
    );

    return {
      rateLimited: true,
      timeRemainingMinutes: timeRemaining > 0 ? timeRemaining : 1,
    };
  }

  return { rateLimited: false };
};

const updateRateLimit = async (email, ip) => {
  const emailKey = `reg_limit:email:${email}`;
  const ipKey = `reg_limit:ip:${ip}`;
  const now = Date.now().toString();

  // Set with 5 minute expiration (300 seconds)
  await Promise.all([
    redis.set(emailKey, now, "EX", 300),
    redis.set(ipKey, now, "EX", 300),
  ]);
};

// ─── Controller ─────────────────────────────────────────────────────

export const handleRegister = async (req, res) => {
  const { firstname, lastname, email, password, confirmPassword } = req.body;

  if (!firstname || !lastname || !email || !password || !confirmPassword) {
    return apiResponseManager(req, res, {
      statusCode: 400,
      success: false,
      message: "Validation Error: All required fields are missing.",
      errorCode: "BadRequest",
    });
  }

  if (password !== confirmPassword) {
    return apiResponseManager(req, res, {
      statusCode: 400,
      success: false,
      message: "Validation Error: Passwords do not match. Please try again.",
      errorCode: "Conflict",
    });
  }

  try {
    // Check for duplicate user
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return apiResponseManager(req, res, {
        statusCode: 409,
        success: false,
        message: "User with this email already exists.",
        errorCode: "Conflict",
      });
    }

    // Rate limiting check
    const clientIP = req.ip;
    const rateLimitResult = await isRateLimited(email, clientIP);

    if (rateLimitResult.rateLimited) {
      return apiResponseManager(req, res, {
        statusCode: 429,
        success: false,
        message: `Too many registration attempts. Please try again in ${rateLimitResult.timeRemainingMinutes} minutes.`,
        errorCode: "TooManyRequests",
      });
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12);
    let newUser;

    try {
      // Create user
      newUser = await User.create({
        firstname,
        lastname,
        email,
        password: passwordHash,
      });

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
