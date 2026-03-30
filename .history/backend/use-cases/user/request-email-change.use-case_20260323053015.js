import User from "../../model/User.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { generateResetToken } from "../../utilities/auth/crypto-utils.js";
import emailService from "../../services/email/email.service.js";
import logger from "../../utilities/general/logger.js";

export async function requestEmailChangeUseCase({ userId, newEmail, currentPassword, apiBaseUrl }) {
  const user = await User.findById(userId).select("+password +pendingEmailToken +pendingEmailExpiresAt");
  if (!user) {
    return { success: false, statusCode: 404, message: "User not found.", errorCode: "USER_NOT_FOUND" };
  }

  const isValid = await bcrypt.compare(currentPassword, user.password);
  if (!isValid) {
    return { success: false, statusCode: 400, message: "Current password is incorrect.", errorCode: "INVALID_PASSWORD" };
  }

  if (user.email.toLowerCase() === newEmail.toLowerCase()) {
    return { success: false, statusCode: 400, message: "New email is the same as your current email.", errorCode: "SAME_EMAIL" };
  }

  const existing = await User.findOne({ email: newEmail.toLowerCase() });
  if (existing) {
    return { success: false, statusCode: 409, message: "This email is already in use.", errorCode: "EMAIL_TAKEN" };
  }

  // Guard: if a non-expired pending request exists for a DIFFERENT email, block
  if (
    user.pendingEmailToken &&
    user.pendingEmailExpiresAt &&
    user.pendingEmailExpiresAt > new Date() &&
    user.pendingEmail?.toLowerCase() !== newEmail.toLowerCase()
  ) {
    return {
      success: false,
      statusCode: 40,
      message: "A verification email was already sent for a different address. Please check your inbox or wait for it to expire before requesting again.",
      errorCode: "EMAIL_CHANGE_PENDING",
    };
  }

  const rawToken = generateResetToken();
  const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

  user.pendingEmail = newEmail;
  user.pendingEmailToken = hashedToken;
  user.pendingEmailExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);
  await user.save();

  const confirmUrl = apiBaseUrl + "/api/v1/user/email/confirm/" + rawToken;

  setImmediate(async () => {
    try {
      await emailService.sendEmailChangeVerification(user, confirmUrl);
    } catch (emailError) {
      logger.error({
        err: emailError,
        userId: user._id.toString(),
        newEmail,
        msg: "Failed to send email change verification email",
      });
    }
  });

  return {
    success: true,
    statusCode: 200,
    message: "Verification email sent to your new address. Please check your inbox.",
  };
}
