import crypto from "crypto";

/**
 * Generate a 6-digit numeric verification code.
 * @returns {string} 6-digit string (e.g., "132062")
 */
export function generateVerificationCode() {
  return crypto.randomInt(100000, 999999).toString();
}

/**
 * Generate a cryptographically secure hex token for password reset.
 * @param {number} [bytes=32] - Number of random bytes
 * @returns {string} Hex string (e.g., 64 characters for 32 bytes)
 */
export function generateResetToken(bytes = 32) {
  return crypto.randomBytes(bytes).toString("hex");
}
