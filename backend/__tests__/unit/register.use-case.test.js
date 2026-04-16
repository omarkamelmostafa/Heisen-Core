import { describe, it, expect, beforeEach, vi } from "vitest";
import { registerUseCase } from "../../use-cases/auth/register.use-case.js";
import User from "../../model/User.js";
import { hashPassword } from "../../utilities/auth/hash-utils.js";
import { generateVerificationCode } from "../../utilities/auth/crypto-utils.js";
import { CloudinaryService } from "../../services/cloudinaryService.js";
import { EmailService } from "../../services/email/email.service.js";
import crypto from "crypto";

const { mockSendVerificationEmail } = vi.hoisted(() => ({
  mockSendVerificationEmail: vi.fn(),
}));

vi.mock("../../model/User.js", () => ({
  default: {
    findOne: vi.fn(),
    create: vi.fn(),
    findByIdAndDelete: vi.fn(),
  },
}));

vi.mock("../../utilities/auth/hash-utils.js", () => ({
  hashPassword: vi.fn(),
}));

vi.mock("../../utilities/auth/crypto-utils.js", () => ({
  generateVerificationCode: vi.fn(),
}));

vi.mock("../../services/cloudinaryService.js", () => ({
  CloudinaryService: {
    createUserFolder: vi.fn(),
  },
}));

vi.mock("../../services/email/email.service.js", () => ({
  EmailService: class {
    sendVerificationEmail = mockSendVerificationEmail;
  },
}));

vi.mock("../../utilities/general/logger.js", () => ({
  default: {
    info: vi.fn(),
    error: vi.fn(),
  },
}));

describe("Register Use Case", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully register a user on the happy path", async () => {
    User.findOne.mockResolvedValue(null);
    hashPassword.mockResolvedValue("hashed-password-123");
    generateVerificationCode.mockReturnValue("123456");

    const expectedHashedToken = crypto
      .createHash("sha256")
      .update("123456")
      .digest("hex");

    User.create.mockResolvedValue({
      _id: "fake-mongo-id",
      uuid: "fake-uuid-123",
      email: "test@example.com",
    });

    CloudinaryService.createUserFolder.mockResolvedValue({ success: true });
    mockSendVerificationEmail.mockResolvedValue({ success: true });

    const result = await registerUseCase({
      firstname: "John",
      lastname: "Doe",
      email: "test@example.com",
      password: "Password1!",
      confirmPassword: "Password1!",
      clientIP: "127.0.0.1",
      termsAccepted: true,
    });

    expect(result).toStrictEqual({
      success: true,
      statusCode: 201,
      message:
        "Registration successful. Please check your email to verify your account.",
      data: {
        user: {
          uuid: "fake-uuid-123",
          email: "test@example.com",
          isVerified: false,
        },
        emailSent: true,
      },
    });

    expect(User.create).toHaveBeenCalledTimes(1);
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        firstname: "John",
        lastname: "Doe",
        email: "test@example.com",
        password: "hashed-password-123",
        verificationToken: expectedHashedToken,
        verificationTokenExpiresAt: expect.any(Date),
        termsAcceptedAt: expect.any(Date),
      })
    );

    expect(hashPassword).toHaveBeenCalledWith("Password1!");
    expect(generateVerificationCode).toHaveBeenCalledTimes(1);
    expect(CloudinaryService.createUserFolder).toHaveBeenCalledTimes(1);
    expect(CloudinaryService.createUserFolder).toHaveBeenCalledWith(
      "fake-mongo-id"
    );
    expect(mockSendVerificationEmail).toHaveBeenCalledTimes(1);
    expect(mockSendVerificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({ _id: "fake-mongo-id" }),
      "123456"
    );
  });

  it("should return 409 conflict when duplicate email occurs", async () => {
    User.findOne.mockResolvedValue({ _id: "existing-user-id" });

    const result = await registerUseCase({
      firstname: "John",
      lastname: "Doe",
      email: "duplicate@example.com",
      password: "Password1!",
      confirmPassword: "Password1!",
      clientIP: "127.0.0.1",
    });

    expect(result).toStrictEqual({
      success: false,
      statusCode: 409,
      message: "User with this email already exists.",
      errorCode: "CONFLICT",
    });

    expect(User.findOne).toHaveBeenCalledWith({ email: "duplicate@example.com" });
    expect(User.create).not.toHaveBeenCalled();
    expect(CloudinaryService.createUserFolder).not.toHaveBeenCalled();
    expect(mockSendVerificationEmail).not.toHaveBeenCalled();
  });

  it("should rollback user creation and return 500 when Cloudinary folder creation fails", async () => {
    User.findOne.mockResolvedValue(null);
    hashPassword.mockResolvedValue("hashed-password-123");
    generateVerificationCode.mockReturnValue("123456");

    User.create.mockResolvedValue({
      _id: "fake-mongo-id-to-rollback",
      uuid: "fake-uuid-123",
      email: "rollback@example.com",
    });

    // Induce a Cloudinary failure
    CloudinaryService.createUserFolder.mockRejectedValue(
      new Error("Cloudinary API Down")
    );
    // Email dispatch starts concurrently and might eventually resolve/reject without throwing at this level
    mockSendVerificationEmail.mockResolvedValue({ success: true });

    User.findByIdAndDelete.mockResolvedValue({});

    const result = await registerUseCase({
      firstname: "John",
      lastname: "Doe",
      email: "rollback@example.com",
      password: "Password1!",
      confirmPassword: "Password1!",
      clientIP: "127.0.0.1",
    });

    expect(result).toStrictEqual({
      success: false,
      statusCode: 500,
      message:
        "Registration failed due to storage system error. Please try again.",
      errorCode: "INTERNAL_ERROR",
    });

    expect(User.create).toHaveBeenCalledTimes(1);
    expect(CloudinaryService.createUserFolder).toHaveBeenCalledTimes(1);
    
    // Assert email dispatch was initiated
    expect(mockSendVerificationEmail).toHaveBeenCalledTimes(1);

    // Assert rollback happened
    expect(User.findByIdAndDelete).toHaveBeenCalledTimes(1);
    expect(User.findByIdAndDelete).toHaveBeenCalledWith(
      "fake-mongo-id-to-rollback"
    );
  });

  it("should return 400 when required fields are missing", async () => {
    const result = await registerUseCase({
      firstname: "John",
      // missing lastname
      email: "test@example.com",
      password: "Password1!",
      confirmPassword: "Password1!",
    });

    expect(result).toStrictEqual({
      success: false,
      statusCode: 400,
      message: "Validation Error: All required fields are missing.",
      errorCode: "BAD_REQUEST",
    });

    expect(User.create).not.toHaveBeenCalled();
    expect(CloudinaryService.createUserFolder).not.toHaveBeenCalled();
    expect(mockSendVerificationEmail).not.toHaveBeenCalled();
  });

  it("should return 400 when password and confirmPassword do not match", async () => {
    const result = await registerUseCase({
      firstname: "John",
      lastname: "Doe",
      email: "test@example.com",
      password: "Password1!",
      confirmPassword: "DifferentPassword1!",
    });

    expect(result).toStrictEqual({
      success: false,
      statusCode: 400,
      message: "Validation Error: Passwords do not match. Please try again.",
      errorCode: "CONFLICT",
    });

    expect(User.create).not.toHaveBeenCalled();
    expect(CloudinaryService.createUserFolder).not.toHaveBeenCalled();
    expect(mockSendVerificationEmail).not.toHaveBeenCalled();
  });

  it("should return 201 with emailSent false when email dispatch fails but everything else succeeds", async () => {
    User.findOne.mockResolvedValue(null);
    hashPassword.mockResolvedValue("hashed-password-123");
    generateVerificationCode.mockReturnValue("123456");

    User.create.mockResolvedValue({
      _id: "fake-mongo-id",
      uuid: "fake-uuid-123",
      email: "test@example.com",
    });

    CloudinaryService.createUserFolder.mockResolvedValue({ success: true });
    // Induce email failure
    mockSendVerificationEmail.mockRejectedValue(new Error("Email Service Down"));

    const result = await registerUseCase({
      firstname: "John",
      lastname: "Doe",
      email: "test@example.com",
      password: "Password1!",
      confirmPassword: "Password1!",
      clientIP: "127.0.0.1",
      termsAccepted: true,
    });

    expect(result).toStrictEqual({
      success: true,
      statusCode: 201,
      message: "Account created successfully. We couldn't send the verification email — please use Resend Code on the verification page.",
      data: {
        user: {
          uuid: "fake-uuid-123",
          email: "test@example.com",
          isVerified: false,
        },
        emailSent: false,
      },
    });

    expect(User.create).toHaveBeenCalledTimes(1);
    expect(CloudinaryService.createUserFolder).toHaveBeenCalledTimes(1);
    expect(mockSendVerificationEmail).toHaveBeenCalledTimes(1);
    // Rollback is NOT triggered
    expect(User.findByIdAndDelete).not.toHaveBeenCalled();
  });

  it("should return 500 when an unexpected internal error occurs", async () => {
    // Induce error early
    User.findOne.mockRejectedValue(new Error("Database connection lost"));

    const result = await registerUseCase({
      firstname: "John",
      lastname: "Doe",
      email: "test@example.com",
      password: "Password1!",
      confirmPassword: "Password1!",
    });

    expect(result).toStrictEqual({
      success: false,
      statusCode: 500,
      message: "Registration failed. Please try again.",
      errorCode: "INTERNAL_ERROR",
    });

    // Check we don't proceed
    expect(User.create).not.toHaveBeenCalled();
  });

  it("should successfully register but omit termsAcceptedAt when termsAccepted is falsy", async () => {
    User.findOne.mockResolvedValue(null);
    hashPassword.mockResolvedValue("hashed-password-123");
    generateVerificationCode.mockReturnValue("123456");

    const expectedHashedToken = crypto
      .createHash("sha256")
      .update("123456")
      .digest("hex");

    User.create.mockResolvedValue({
      _id: "fake-mongo-id",
      uuid: "fake-uuid-123",
      email: "test@example.com",
    });

    CloudinaryService.createUserFolder.mockResolvedValue({ success: true });
    mockSendVerificationEmail.mockResolvedValue({ success: true });

    const result = await registerUseCase({
      firstname: "John",
      lastname: "Doe",
      email: "test@example.com",
      password: "Password1!",
      confirmPassword: "Password1!",
      clientIP: "127.0.0.1",
      termsAccepted: false,
    });

    expect(result.success).toBe(true);
    expect(result.statusCode).toBe(201);

    expect(User.create).toHaveBeenCalledTimes(1);
    // termsAcceptedAt should NOT be in the payload
    expect(User.create).toHaveBeenCalledWith(
      expect.not.objectContaining({ termsAcceptedAt: expect.anything() })
    );
    expect(User.create).toHaveBeenCalledWith(
      expect.objectContaining({
        firstname: "John",
        lastname: "Doe",
        email: "test@example.com",
        password: "hashed-password-123",
        verificationToken: expectedHashedToken,
        verificationTokenExpiresAt: expect.any(Date),
      })
    );
  });
});
