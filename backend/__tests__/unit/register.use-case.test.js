// backend/__tests__/unit/register.use-case.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import User from "../../model/User.js";
import { CloudinaryService } from "../../services/cloudinaryService.js";
import { EmailService } from "../../services/email/email.service.js";
import { hashPassword } from "../../utilities/auth/hash-utils.js";
import { registerUseCase } from "../../use-cases/auth/register.use-case.js";

vi.mock("../../model/User.js");
vi.mock("../../services/cloudinaryService.js");
vi.mock("../../services/email/email.service.js");
vi.mock("../../utilities/auth/hash-utils.js");
vi.mock("../../utilities/general/logger.js");

describe("registerUseCase", () => {
  const dto = {
    firstname: "John",
    lastname: "Doe",
    email: "john@example.com",
    password: "StrongerPassword123!",
    confirmPassword: "StrongerPassword123!",
    termsAccepted: true,
    clientIP: "127.0.0.1",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should create user and call services on success", async () => {
    User.findOne.mockResolvedValue(null);
    hashPassword.mockResolvedValue("hashed-pw");
    const mockUser = {
      _id: "new-id",
      uuid: "uuid-123",
      email: dto.email,
    };
    User.create.mockResolvedValue(mockUser);
    CloudinaryService.createUserFolder.mockResolvedValue({});
    
    // Use spyOn for the prototype method
    const sendEmailSpy = vi.spyOn(EmailService.prototype, "sendVerificationEmail").mockResolvedValue({});

    const result = await registerUseCase(dto);

    expect(User.create).toHaveBeenCalled();
    expect(CloudinaryService.createUserFolder).toHaveBeenCalled();
    expect(sendEmailSpy).toHaveBeenCalled();
    expect(result.statusCode).toBe(201);
    expect(result.success).toBe(true);
  });

  it("should rollback user creation if Cloudinary fails", async () => {
    User.findOne.mockResolvedValue(null);
    User.create.mockResolvedValue({ _id: "new-id" });
    CloudinaryService.createUserFolder.mockRejectedValue(new Error("Cloudinary error"));
    User.findByIdAndDelete.mockResolvedValue({});
    
    const result = await registerUseCase(dto);

    expect(User.findByIdAndDelete).toHaveBeenCalledWith("new-id");
    expect(result.statusCode).toBe(500);
    expect(result.message).toContain("storage system error");
  });
});
