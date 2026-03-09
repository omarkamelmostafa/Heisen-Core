// File: server/model/User.js
import mongoose, { Schema } from "mongoose";
import { v4 as uuidv4 } from "uuid";

const emailValidator = (email) => {
  const regex =
    /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
  return regex.test(email);
};

const UserSchema = new Schema(
  {
    firstname: {
      type: String,
      required: [true, "First name is required."],
      minlength: [3, "First name must be at least 3 characters long."],
      maxlength: [16, "First name must be at most 16 characters long."],
      trim: true,
    },
    lastname: {
      type: String,
      required: [true, "Last name is required."],
      minlength: [3, "Last name must be at least 3 characters long."],
      maxlength: [16, "Last name must be at most 16 characters long."],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required."],
      maxlength: [100, "Email must be at most 100 characters long."],
      unique: true,
      validate: [emailValidator, "Please provide a valid email address."],
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required."],
      minlength: [8, "Password must be at least 8 characters long."],
      select: false, // Never return password in queries by default
    },
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission",
      },
    ],
    profilePicture: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Photo",
      default: null,
    },
    albums: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Album",
      },
    ],

    // Enhanced security fields for login system
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    loginAttempts: {
      type: Number,
      default: 0,
      select: false,
    },
    isLocked: {
      type: Boolean,
      default: false,
      select: false,
    },
    lockUntil: {
      type: Date,
      select: false,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },

    // Token fields
    refreshToken: {
      type: String,
      select: false,
      index: true,
      sparse: true,
    },
    resetPasswordToken: {
      type: String,
      select: false,
      index: true,
      sparse: true,
    },
    resetPasswordExpiresAt: {
      type: Date,
      select: false,
    },
    verificationToken: {
      type: String,
      select: false,
      index: true,
      sparse: true,
    },
    verificationTokenExpiresAt: {
      type: Date,
      select: false,
    },
    tokenVersion: {
      type: Number,
      default: 1,
      select: false,
    },

    // Security identifier
    uuid: {
      type: String,
      default: uuidv4,
      unique: true,
    },

    // Timestamps
    lastPasswordChange: {
      type: Date,
      select: false,
    },
    lastSecurityEvent: {
      type: Date,
      select: false,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        // Always remove password and sensitive fields when converting to JSON
        delete ret.password;
        delete ret.refreshToken;
        delete ret.resetPasswordToken;
        delete ret.verificationToken;
        delete ret.loginAttempts;
        delete ret.isLocked;
        delete ret.lockUntil;
        return ret;
      },
    },
  }
);

UserSchema.pre("save", function (next) {
  if (this.isModified("password")) {
    this.tokenVersion += 1; // ← INCREMENT
    this.lastPasswordChange = new Date();
    this.lastSecurityEvent = new Date();
  }
  if (this.isModified("email") || this.isModified("isActive")) {
    this.lastSecurityEvent = new Date();
  }
  next();
}); // ::TODO:: three cases, password change, log out all devices, admin security action

// Enhanced pre-save middleware for security
UserSchema.pre("save", function (next) {
  // Clear sessions when sensitive data changes
  if (
    this.isModified("password") ||
    this.isModified("email") ||
    this.isModified("isActive")
  ) {
    this.refreshToken = null; // Log out from all sessions
  }

  // Auto-unlock account when lockUntil expires
  if (this.lockUntil && this.lockUntil < new Date()) {
    this.isLocked = false;
    this.lockUntil = undefined;
    this.loginAttempts = 0;
  }

  next();
});

// Instance method to check if account is locked
UserSchema.methods.isAccountLocked = function () {
  return this.isLocked && this.lockUntil > new Date();
};

// Instance method to increment failed login attempts
UserSchema.methods.incrementLoginAttempts = function () {
  this.loginAttempts += 1;

  if (this.loginAttempts >= 5) {
    this.isLocked = true;
    this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes
  }

  return this.save();
};

// Instance method to reset login attempts on successful login
UserSchema.methods.resetLoginAttempts = function () {
  this.loginAttempts = 0;
  this.isLocked = false;
  this.lockUntil = undefined;
  this.lastLogin = new Date();
  return this.save();
};

// Static method to find by email including security fields
UserSchema.statics.findByEmailWithSecurity = function (email) {
  return this.findOne({ email }).select(
    "+password +refreshToken +loginAttempts +isLocked +lockUntil"
  );
};

// Optimization Indexes
UserSchema.index({ email: 1, isActive: 1 });

const User = mongoose.model("User", UserSchema);
export default User;


