// backend/__tests__/unit/email.service.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { EmailService } from "../../services/email/email.service.js";
import { EtherealProvider } from "../../services/email/providers/mailtrap.provider.js";
import { EmailQueue } from "../../services/email/email.queue.js";
import { TemplateEngine } from "../../services/email/templates/template.engine.js";
import logger from "../../utilities/general/logger.js";

vi.mock("../../services/email/providers/mailtrap.provider.js");
vi.mock("../../services/email/email.queue.js");
vi.mock("../../services/email/templates/template.engine.js");
vi.mock("../../utilities/general/logger.js");

describe("EmailService", () => {
  let emailService;
  let mockUser;

  beforeEach(() => {
    vi.clearAllMocks();
    emailService = new EmailService();
    mockUser = {
      _id: { toString: () => "user123" },
      firstname: "John",
      lastname: "Doe",
      email: "john@example.com",
    };
  });

  it("should send verification email", async () => {
    const spy = vi.spyOn(emailService, "sendEmail").mockResolvedValue({ success: true });
    await emailService.sendVerificationEmail(mockUser, "token123");
    expect(spy).toHaveBeenCalledWith(
      "auth/verification",
      expect.objectContaining({ verificationCode: "token123" }),
      expect.objectContaining({ to: "john@example.com", subject: "Verify your email" })
    );
  });

  it("should send 2fa code email", async () => {
    const spy = vi.spyOn(emailService, "sendEmail").mockResolvedValue({ success: true });
    await emailService.send2faCodeEmail(mockUser, "123456");
    expect(spy).toHaveBeenCalledWith(
      "auth/2fa-code",
      expect.objectContaining({ twoFactorCode: "123456" }),
      expect.objectContaining({ to: "john@example.com", subject: "Your Two-Factor Authentication Code" })
    );
  });

  it("should send password reset email", async () => {
    const spy = vi.spyOn(emailService, "sendEmail").mockResolvedValue({ success: true });
    await emailService.sendPasswordResetEmail(mockUser, "http://reset.com");
    expect(spy).toHaveBeenCalledWith(
      "auth/password-reset",
      expect.objectContaining({ resetURL: "http://reset.com" }),
      expect.objectContaining({ to: "john@example.com", subject: "Reset your password" })
    );
  });

  it("should send reset success email", async () => {
    const spy = vi.spyOn(emailService, "sendEmail").mockResolvedValue({ success: true });
    await emailService.sendResetSuccessEmail(mockUser);
    expect(spy).toHaveBeenCalledWith(
      "auth/reset-success",
      expect.objectContaining({ user: expect.any(Object) }),
      expect.objectContaining({ to: "john@example.com", subject: "Password Reset Successful" })
    );
  });

  describe("sendEmail", () => {
    it("should compile template and send using provider in development", async () => {
      process.env.NODE_ENV = "development";
      emailService.templateEngine.compile.mockResolvedValue("<html></html>");
      emailService.provider.send.mockResolvedValue({ success: true });

      const result = await emailService.sendEmail("test", {}, { to: "test@test.com" });

      expect(emailService.templateEngine.compile).toHaveBeenCalledWith("test", {});
      expect(emailService.provider.send).toHaveBeenCalledWith({
        to: "test@test.com",
        html: "<html></html>",
      });
      expect(result).toEqual({ success: true });
    });

    it("should use queue in production", async () => {
      process.env.NODE_ENV = "production";
      emailService.templateEngine.compile.mockResolvedValue("<html></html>");
      emailService.queue.add.mockResolvedValue({ id: "job123" });

      const result = await emailService.sendEmail("test", {}, { to: "test@test.com" });

      expect(emailService.queue.add).toHaveBeenCalled();
      expect(result).toEqual({ id: "job123" });
    });

    it("should throw error if provider fails in development", async () => {
      process.env.NODE_ENV = "development";
      emailService.templateEngine.compile.mockResolvedValue("<html></html>");
      emailService.provider.send.mockResolvedValue({ success: false, error: "Failed" });

      await expect(emailService.sendEmail("test", {}, { to: "test@test.com" }))
        .rejects.toThrow("Email delivery failed: Failed");
    });

    it("should throw error if queue fails in production", async () => {
      process.env.NODE_ENV = "production";
      emailService.templateEngine.compile.mockResolvedValue("<html></html>");
      emailService.queue.add.mockResolvedValue(null);

      await expect(emailService.sendEmail("test", {}, { to: "test@test.com" }))
        .rejects.toThrow("Failed to queue email for delivery");
    });
  });
});
