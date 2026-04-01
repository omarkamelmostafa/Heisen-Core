// backend/use-cases/user/confirm-email-change.use-case.js
import User from "../../model/User.js";
import RefreshToken from "../../model/RefreshToken.js";
import crypto from "crypto";

export async function confirmEmailChangeUseCase({ token }) {
  const clientUrl = process.env.FRONTEND_URL || "http://localhost:3000";

  if (!token) {
    return { success: false, redirectUrl: clientUrl + "/login?reason=email-token-invalid" };
  }

  const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

  const user = await User.findOne({
    pendingEmailToken: hashedToken,
    pendingEmailExpiresAt: { $gt: new Date() },
  }).select("+pendingEmailToken +pendingEmailExpiresAt +tokenVersion +lastSecurityEvent");

  if (!user) {
    return { success: false, redirectUrl: clientUrl + "/login?reason=email-token-invalid" };
  }

  const emailTaken = await User.findOne({
    email: user.pendingEmail,
    _id: { $ne: user._id },
  });

  if (emailTaken) {
    user.pendingEmail = null;
    user.pendingEmailToken = null;
    user.pendingEmailExpiresAt = null;
    await user.save();
    return { success: false, redirectUrl: clientUrl + "/login?reason=email-taken" };
  }

  user.email = user.pendingEmail;
  user.pendingEmail = null;
  user.pendingEmailToken = null;
  user.pendingEmailExpiresAt = null;

  user.tokenVersion = (user.tokenVersion || 1) + 1;
  user.lastSecurityEvent = new Date();

  // Mark email as verified
  user.isVerified = true;

  await RefreshToken.deleteMany({ userId: user._id });
  await user.save();

  return { success: true, redirectUrl: clientUrl + "/login?reason=email-changed" };
}
