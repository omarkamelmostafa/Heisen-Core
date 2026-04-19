// backend/__tests__/unit/validators.test.js
import { describe, it, expect } from "vitest";
import { validationResult } from "express-validator";
import {
  registerValidationRules,
  loginValidationRules,
  emailVerificationValidationRules,
  resendVerificationValidationRules,
  forgotPasswordValidationRules,
  resetPasswordValidationRules,
  verify2faValidationRules,
} from "../../validators/auth-validators.js";

// Helper to run validation rules
async function validate(rules, data) {
  const req = { body: data };
  await Promise.all(rules.map((rule) => rule.run(req)));
  return validationResult(req);
}

describe("Auth Validators", () => {
  describe("registerValidationRules", () => {
    it("should pass with valid data", async () => {
      const data = {
        firstname: "John",
        lastname: "Doe",
        email: "john.doe@example.com",
        password: "StrongerPassword123!",
        confirmPassword: "StrongerPassword123!",
        terms: true,
      };
      const result = await validate(registerValidationRules, data);
      if (!result.isEmpty()) {
        console.log(result.array());
      }
      expect(result.isEmpty()).toBe(true);
    });

    it("should fail if passwords do not match", async () => {
      const data = {
        firstname: "John",
        lastname: "Doe",
        email: "john.doe@example.com",
        password: "Password123!",
        confirmPassword: "DifferentPassword123!",
        terms: true,
      };
      const result = await validate(registerValidationRules, data);
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe("Passwords do not match");
    });

    it("should fail if terms are not accepted", async () => {
      const data = {
        firstname: "John",
        lastname: "Doe",
        email: "john.doe@example.com",
        password: "Password123!",
        confirmPassword: "Password123!",
        terms: false,
      };
      const result = await validate(registerValidationRules, data);
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe("You must accept the terms and conditions.");
    });

    it("should fail with disposable email", async () => {
      const data = {
        firstname: "John",
        lastname: "Doe",
        email: "test@mailinator.com",
        password: "Password123!",
        confirmPassword: "Password123!",
        terms: true,
      };
      const result = await validate(registerValidationRules, data);
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe("Disposable email addresses are not allowed. Please use a permanent email address.");
    });
  });

  describe("loginValidationRules", () => {
    it("should pass with valid data", async () => {
      const data = {
        email: "john.doe@example.com",
        password: "Password123!",
      };
      const result = await validate(loginValidationRules, data);
      expect(result.isEmpty()).toBe(true);
    });

    it("should fail with missing password", async () => {
      const data = {
        email: "john.doe@example.com",
      };
      const result = await validate(loginValidationRules, data);
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe("Password is required");
    });
  });

  describe("emailVerificationValidationRules", () => {
    it("should pass with 6-digit token", async () => {
      const data = { token: "123456" };
      const result = await validate(emailVerificationValidationRules, data);
      expect(result.isEmpty()).toBe(true);
    });

    it("should fail with invalid token", async () => {
      const data = { token: "123" };
      const result = await validate(emailVerificationValidationRules, data);
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe("Enter your 6-digit verification code");
    });
  });

  describe("resetPasswordValidationRules", () => {
    it("should pass with valid token and password", async () => {
      const data = {
        token: "a".repeat(64),
        password: "StrongerPassword123!",
      };
      const result = await validate(resetPasswordValidationRules, data);
      expect(result.isEmpty()).toBe(true);
    });

    it("should fail with invalid token", async () => {
      const data = {
        token: "invalid",
        password: "Password123!",
      };
      const result = await validate(resetPasswordValidationRules, data);
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe("Invalid or corrupted reset token link");
    });
  });

  describe("verify2faValidationRules", () => {
    it("should pass with valid token and tempToken", async () => {
      const data = {
        token: "123456",
        tempToken: "some-temp-token",
      };
      const result = await validate(verify2faValidationRules, data);
      expect(result.isEmpty()).toBe(true);
    });

    it("should fail with non-numeric token", async () => {
      const data = {
        token: "abcdef",
        tempToken: "some-temp-token",
      };
      const result = await validate(verify2faValidationRules, data);
      expect(result.isEmpty()).toBe(false);
      expect(result.array()[0].msg).toBe("Verification code must contain only numbers");
    });
  });
});
