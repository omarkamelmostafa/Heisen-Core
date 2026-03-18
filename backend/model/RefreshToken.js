// backend/model/RefreshToken.js
// Dedicated refresh token model for multi-device session management.
// Each login creates one RefreshToken document. Supports rotation (FR-015)
// and reuse detection (FR-016) via the `replacedBy` chain.

import mongoose, { Schema } from "mongoose";

const RefreshTokenSchema = new Schema(
  {
    // Hashed refresh token value (SHA-256). The raw value is sent to the client
    // in an HttpOnly cookie; only the hash is persisted.
    token: {
      type: String,
      required: [true, "Token hash is required."],
      index: { unique: true, sparse: true },
    },

    // Associated user
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User reference is required."],
    },

    // Revocation flag — set on logout, rotation, or reuse detection
    isRevoked: {
      type: Boolean,
      default: false,
    },

    // Points to the RefreshToken that replaced this one during rotation.
    // Used for reuse detection chain traversal.
    replacedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "RefreshToken",
      default: null,
    },

    // Token expiration. MongoDB TTL index auto-deletes expired documents.
    expiresAt: {
      type: Date,
      required: [true, "Expiration date is required."],
    },

    // When the token was created
    issuedAt: {
      type: Date,
      default: Date.now,
    },

    // User-Agent header from the login request (for session identification)
    userAgent: {
      type: String,
      default: "",
    },

    // IP address from the login request
    ipAddress: {
      type: String,
      default: "",
    },

    rememberMe: {
      type: Boolean,
      required: true,
      default: false,
    },

    // Snapshot of user's tokenVersion at creation time.
    // Used for "logout all" comparison.
    tokenVersion: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  }
);

// ─── Indexes ─────────────────────────────────────────────────────────
// Compound index: find active tokens per user (for "logout all" and session listing)
RefreshTokenSchema.index({ user: 1, isRevoked: 1 });

// TTL index: auto-delete expired token documents
RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const RefreshToken = mongoose.model("RefreshToken", RefreshTokenSchema);
export default RefreshToken;
