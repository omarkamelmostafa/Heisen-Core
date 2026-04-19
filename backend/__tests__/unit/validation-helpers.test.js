// backend/__tests__/unit/validation-helpers.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { validationResult } from "express-validator";
import { emailRules, passwordRules } from "../../validators/validation-helpers.js";

/** @type {string} Domain verified present in disposable-email-domains package list */
const KNOWN_DISPOSABLE_DOMAIN = "0-mail.com";

async function runValidation(validators, reqBody) {
  const req = { body: reqBody };
  const res = {};
  const next = vi.fn();
  for (const validator of validators) {
    await validator.run(req);
  }
  return validationResult(req);
}

describe("emailRules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("without disposable check", () => {
    it("passes for valid email address", async () => {
      const result = await runValidation([emailRules()], {
        email: "user@example.com",
      });
      expect(result.isEmpty()).toBe(true);
    });

    it("fails when email is empty", async () => {
      const result = await runValidation([emailRules()], { email: "" });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors[0].path).toBe("email");
    });

    it("fails when email is not valid format", async () => {
      const result = await runValidation([emailRules()], { email: "not-an-email" });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors[0].path).toBe("email");
    });

    it("fails when email exceeds 254 characters", async () => {
      const domain = "ex.com";
      const localLen = 255 - 1 - domain.length;
      const tooLongEmail = `${"a".repeat(localLen)}@${domain}`;
      expect(tooLongEmail.length).toBe(255);
      const result = await runValidation([emailRules()], { email: tooLongEmail });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors[0].path).toBe("email");
    });

    it("does NOT reject disposable email when checkDisposable is false", async () => {
      const result = await runValidation([emailRules()], {
        email: `user@${KNOWN_DISPOSABLE_DOMAIN}`,
      });
      expect(result.isEmpty()).toBe(true);
    });
  });

  describe("with disposable check (checkDisposable: true)", () => {
    it("passes for non-disposable email", async () => {
      const result = await runValidation([emailRules({ checkDisposable: true })], {
        email: "user@example.com",
      });
      expect(result.isEmpty()).toBe(true);
    });

    it("fails for a known disposable email domain", async () => {
      const result = await runValidation([emailRules({ checkDisposable: true })], {
        email: `test@${KNOWN_DISPOSABLE_DOMAIN}`,
      });
      expect(result.isEmpty()).toBe(false);
      const errors = result.array();
      expect(errors[0].path).toBe("email");
    });
  });
});

describe("passwordRules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const strongPassword = "MyStr0ng!Pass#2024";

  it("passes for a strong password meeting all requirements", async () => {
    const result = await runValidation([passwordRules()], {
      password: strongPassword,
    });
    expect(result.isEmpty()).toBe(true);
  });

  it("fails when password is empty", async () => {
    const result = await runValidation([passwordRules()], { password: "" });
    expect(result.isEmpty()).toBe(false);
    const errors = result.array();
    expect(errors[0].path).toBe("password");
  });

  it("fails when password is shorter than 8 characters", async () => {
    const result = await runValidation([passwordRules()], { password: "Ab1!x" });
    expect(result.isEmpty()).toBe(false);
    const errors = result.array();
    expect(errors[0].path).toBe("password");
  });

  it("fails when password exceeds 128 characters", async () => {
    const pwd = `Ab1!${"a".repeat(125)}`;
    expect(pwd.length).toBe(129);
    const result = await runValidation([passwordRules()], { password: pwd });
    expect(result.isEmpty()).toBe(false);
    const errors = result.array();
    expect(errors[0].path).toBe("password");
  });

  it("fails when password has no uppercase letter", async () => {
    const result = await runValidation([passwordRules()], {
      password: "weakpass1!",
    });
    expect(result.isEmpty()).toBe(false);
    const errors = result.array();
    expect(errors[0].path).toBe("password");
  });

  it("fails when password has no lowercase letter", async () => {
    const result = await runValidation([passwordRules()], {
      password: "WEAKPASS1!",
    });
    expect(result.isEmpty()).toBe(false);
    const errors = result.array();
    expect(errors[0].path).toBe("password");
  });

  it("fails when password has no digit", async () => {
    const result = await runValidation([passwordRules()], {
      password: "WeakPass!!",
    });
    expect(result.isEmpty()).toBe(false);
    const errors = result.array();
    expect(errors[0].path).toBe("password");
  });

  it("fails when password has no special character", async () => {
    const result = await runValidation([passwordRules()], {
      password: "WeakPass1x",
    });
    expect(result.isEmpty()).toBe(false);
    const errors = result.array();
    expect(errors[0].path).toBe("password");
  });

  it("fails when password zxcvbn score is below minimum (score < 3)", async () => {
    const weakButPatternCompliant = "Aa1!aaaaaa";
    const result = await runValidation([passwordRules()], {
      password: weakButPatternCompliant,
    });
    expect(result.isEmpty()).toBe(false);
    const errors = result.array();
    expect(errors[0].path).toBe("password");
  });
});
