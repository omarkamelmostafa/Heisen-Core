// backend/__tests__/unit/auth-validators.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { validationResult } from "express-validator";
import {
  registerValidationRules,
  loginValidationRules,
  emailVerificationValidationRules,
  forgotPasswordValidationRules,
  resetPasswordValidationRules,
  verify2faValidationRules,
} from "../../validators/auth-validators.js";

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

const validRegisterBody = () => ({
  firstname: "John",
  lastname: "Doe",
  email: "john@example.com",
  password: "MyStr0ng!Pass#2024",
  confirmPassword: "MyStr0ng!Pass#2024",
  terms: true,
});

const valid64HexToken = () => "a".repeat(64);

describe("registerValidationRules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes for valid registration data", async () => {
    const result = await runValidation(registerValidationRules, validRegisterBody());
    expect(result.isEmpty()).toBe(true);
  });

  it("fails when firstname is missing", async () => {
    const body = validRegisterBody();
    delete body.firstname;
    const result = await runValidation(registerValidationRules, body);
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("firstname");
  });

  it("fails when firstname is shorter than 3 characters", async () => {
    const result = await runValidation(registerValidationRules, {
      ...validRegisterBody(),
      firstname: "Jo",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("firstname");
  });

  it("fails when firstname is longer than 16 characters", async () => {
    const result = await runValidation(registerValidationRules, {
      ...validRegisterBody(),
      firstname: "J".repeat(17),
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("firstname");
  });

  it("fails when lastname is missing", async () => {
    const body = validRegisterBody();
    delete body.lastname;
    const result = await runValidation(registerValidationRules, body);
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("lastname");
  });

  it("fails when email is missing", async () => {
    const body = validRegisterBody();
    delete body.email;
    const result = await runValidation(registerValidationRules, body);
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("email");
  });

  it("fails when email is invalid format", async () => {
    const result = await runValidation(registerValidationRules, {
      ...validRegisterBody(),
      email: "not-an-email",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("email");
  });

  it("fails when email is from disposable domain", async () => {
    const result = await runValidation(registerValidationRules, {
      ...validRegisterBody(),
      email: `user@${KNOWN_DISPOSABLE_DOMAIN}`,
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("email");
  });

  it("fails when password is missing", async () => {
    const body = validRegisterBody();
    delete body.password;
    const result = await runValidation(registerValidationRules, body);
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("password");
  });

  it("fails when passwords do not match", async () => {
    const result = await runValidation(registerValidationRules, {
      ...validRegisterBody(),
      confirmPassword: "Different#Pass2024!",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("confirmPassword");
  });

  it("fails when terms is not accepted (false)", async () => {
    const result = await runValidation(registerValidationRules, {
      ...validRegisterBody(),
      terms: false,
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("terms");
  });

  it("fails when terms is missing", async () => {
    const body = validRegisterBody();
    delete body.terms;
    const result = await runValidation(registerValidationRules, body);
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("terms");
  });
});

describe("loginValidationRules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes for valid email and password", async () => {
    const result = await runValidation(loginValidationRules, {
      email: "user@example.com",
      password: "anything",
    });
    expect(result.isEmpty()).toBe(true);
  });

  it("fails when email is missing", async () => {
    const result = await runValidation(loginValidationRules, { password: "x" });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("email");
  });

  it("fails when password is missing", async () => {
    const result = await runValidation(loginValidationRules, {
      email: "user@example.com",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("password");
  });

  it("does NOT validate password strength — weak password passes", async () => {
    const result = await runValidation(loginValidationRules, {
      email: "user@example.com",
      password: "password123",
    });
    expect(result.isEmpty()).toBe(true);
  });

  it("rememberMe is optional — passes without it", async () => {
    const result = await runValidation(loginValidationRules, {
      email: "user@example.com",
      password: "secret",
    });
    expect(result.isEmpty()).toBe(true);
  });

  it("rememberMe accepts boolean true and false", async () => {
    const rTrue = await runValidation(loginValidationRules, {
      email: "user@example.com",
      password: "secret",
      rememberMe: true,
    });
    expect(rTrue.isEmpty()).toBe(true);

    const rFalse = await runValidation(loginValidationRules, {
      email: "user@example.com",
      password: "secret",
      rememberMe: false,
    });
    expect(rFalse.isEmpty()).toBe(true);
  });
});

describe("emailVerificationValidationRules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes for valid 6-digit token", async () => {
    const result = await runValidation(emailVerificationValidationRules, {
      token: "123456",
    });
    expect(result.isEmpty()).toBe(true);
  });

  it("fails when token is missing", async () => {
    const result = await runValidation(emailVerificationValidationRules, {});
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("token");
  });

  it("fails when token is not 6 digits", async () => {
    const result = await runValidation(emailVerificationValidationRules, {
      token: "12345",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("token");
  });

  it("fails when token contains non-numeric characters", async () => {
    const result = await runValidation(emailVerificationValidationRules, {
      token: "12345a",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("token");
  });

  it("sanitizes token by trimming whitespace", async () => {
    const result = await runValidation(emailVerificationValidationRules, {
      token: "  123456  ",
    });
    expect(result.isEmpty()).toBe(true);
  });
});

describe("forgotPasswordValidationRules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes for valid email", async () => {
    const result = await runValidation(forgotPasswordValidationRules, {
      email: "user@example.com",
    });
    expect(result.isEmpty()).toBe(true);
  });

  it("fails when email is missing", async () => {
    const result = await runValidation(forgotPasswordValidationRules, {});
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("email");
  });

  it("does NOT check for disposable email domain", async () => {
    const result = await runValidation(forgotPasswordValidationRules, {
      email: `user@${KNOWN_DISPOSABLE_DOMAIN}`,
    });
    expect(result.isEmpty()).toBe(true);
  });
});

describe("resetPasswordValidationRules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes for valid 64-hex token and strong password", async () => {
    const result = await runValidation(resetPasswordValidationRules, {
      token: valid64HexToken(),
      password: "MyStr0ng!Pass#2024",
    });
    expect(result.isEmpty()).toBe(true);
  });

  it("fails when token is missing", async () => {
    const result = await runValidation(resetPasswordValidationRules, {
      password: "MyStr0ng!Pass#2024",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("token");
  });

  it("fails when token is not 64 hex characters", async () => {
    const result = await runValidation(resetPasswordValidationRules, {
      token: "not-hex-not-64-chars",
      password: "MyStr0ng!Pass#2024",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("token");
  });

  it("fails when password is missing", async () => {
    const result = await runValidation(resetPasswordValidationRules, {
      token: valid64HexToken(),
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("password");
  });

  it("fails when password is weak", async () => {
    const result = await runValidation(resetPasswordValidationRules, {
      token: valid64HexToken(),
      password: "Aa1!aaaaaa",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("password");
  });
});

describe("verify2faValidationRules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes for valid 6-digit token and tempToken", async () => {
    const result = await runValidation(verify2faValidationRules, {
      token: "123456",
      tempToken: "temp-token-value",
    });
    expect(result.isEmpty()).toBe(true);
  });

  it("fails when token is missing", async () => {
    const result = await runValidation(verify2faValidationRules, {
      tempToken: "temp",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("token");
  });

  it("fails when token is not exactly 6 digits", async () => {
    const result = await runValidation(verify2faValidationRules, {
      token: "12345",
      tempToken: "temp",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("token");
  });

  it("fails when token is non-numeric", async () => {
    const result = await runValidation(verify2faValidationRules, {
      token: "12345a",
      tempToken: "temp",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("token");
  });

  it("fails when tempToken is missing", async () => {
    const result = await runValidation(verify2faValidationRules, {
      token: "123456",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("tempToken");
  });
});
