// backend/utilities/auth/hash-utils.js
import bcrypt from "bcrypt";

const SALT_ROUNDS = 12;

/**
 * Hash a plain text password using bcrypt.
 * @param {string} password - Plain text password
 * @returns {Promise<string>} Bcrypt hash
 */
export async function hashPassword(password) {
  return bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare a plain text password against a bcrypt hash.
 * @param {string} password - Plain text password
 * @param {string} hash - Bcrypt hash
 * @returns {Promise<boolean>} True if match
 */
export async function comparePassword(password, hash) {
  return bcrypt.compare(password, hash);
}
