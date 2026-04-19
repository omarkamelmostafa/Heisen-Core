// backend/__tests__/unit/user-validators.test.js
import { describe, it, expect, vi, beforeEach } from "vitest";
import { validationResult } from "express-validator";
import {
  updateProfileValidationRules,
  updatePasswordValidationRules,
  toggle2faValidationRules,
  emailChangeValidationRules,
} from "../../validators/user-validators.js";

async function runValidation(validators, reqBody) {
  const req = { body: reqBody };
  const res = {};
  const next = vi.fn();
  for (const validator of validators) {
    await validator.run(req);
  }
  return validationResult(req);
}

describe("updateProfileValidationRules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes for valid firstname and lastname", async () => {
    const result = await runValidation(updateProfileValidationRules, {
      firstname: "John",
      lastname: "Doe",
    });
    expect(result.isEmpty()).toBe(true);
  });

  it("fails when firstname is missing", async () => {
    const result = await runValidation(updateProfileValidationRules, {
      lastname: "Doe",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("firstname");
  });

  it("fails when firstname is shorter than 3 characters", async () => {
    const result = await runValidation(updateProfileValidationRules, {
      firstname: "Jo",
      lastname: "Doe",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("firstname");
  });

  it("fails when firstname is longer than 16 characters", async () => {
    const result = await runValidation(updateProfileValidationRules, {
      firstname: "J".repeat(17),
      lastname: "Doe",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("firstname");
  });

  it("fails when firstname contains numbers", async () => {
    const result = await runValidation(updateProfileValidationRules, {
      firstname: "John3",
      lastname: "Doe",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("firstname");
  });

  it("fails when lastname is missing", async () => {
    const result = await runValidation(updateProfileValidationRules, {
      firstname: "John",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("lastname");
  });
});

describe("updatePasswordValidationRules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes for valid old and new passwords", async () => {
    const result = await runValidation(updatePasswordValidationRules, {
      oldPassword: "OldStr0ng!Pass",
      newPassword: "MyStr0ng!Pass#2024",
      confirmPassword: "MyStr0ng!Pass#2024",
    });
    expect(result.isEmpty()).toBe(true);
  });

  it("fails when oldPassword is missing", async () => {
    const result = await runValidation(updatePasswordValidationRules, {
      newPassword: "MyStr0ng!Pass#2024",
      confirmPassword: "MyStr0ng!Pass#2024",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("oldPassword");
  });

  it("fails when newPassword is weak", async () => {
    const result = await runValidation(updatePasswordValidationRules, {
      oldPassword: "OldStr0ng!Pass",
      newPassword: "Aa1!aaaaaa",
      confirmPassword: "Aa1!aaaaaa",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("newPassword");
  });

  it("fails when confirmPassword does not match newPassword", async () => {
    const result = await runValidation(updatePasswordValidationRules, {
      oldPassword: "OldStr0ng!Pass",
      newPassword: "MyStr0ng!Pass#2024",
      confirmPassword: "Other#Pass2024!",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("confirmPassword");
  });
});

describe("toggle2faValidationRules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes for valid enable boolean and currentPassword", async () => {
    const on = await runValidation(toggle2faValidationRules, {
      enable: true,
      currentPassword: "Current1!",
    });
    expect(on.isEmpty()).toBe(true);

    const off = await runValidation(toggle2faValidationRules, {
      enable: false,
      currentPassword: "Current1!",
    });
    expect(off.isEmpty()).toBe(true);
  });

  it("fails when enable is missing", async () => {
    const result = await runValidation(toggle2faValidationRules, {
      currentPassword: "Current1!",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("enable");
  });

  it("fails when currentPassword is missing", async () => {
    const result = await runValidation(toggle2faValidationRules, {
      enable: true,
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("currentPassword");
  });
});

describe("emailChangeValidationRules", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("passes for valid newEmail and currentPassword", async () => {
    const result = await runValidation(emailChangeValidationRules, {
      newEmail: "new.user@example.com",
      currentPassword: "Current1!",
    });
    expect(result.isEmpty()).toBe(true);
  });

  it("fails when newEmail is missing", async () => {
    const result = await runValidation(emailChangeValidationRules, {
      currentPassword: "Current1!",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("newEmail");
  });

  it("fails when newEmail is invalid format", async () => {
    const result = await runValidation(emailChangeValidationRules, {
      newEmail: "not-email",
      currentPassword: "Current1!",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("newEmail");
  });

  it("fails when currentPassword is missing", async () => {
    const result = await runValidation(emailChangeValidationRules, {
      newEmail: "new.user@example.com",
    });
    expect(result.isEmpty()).toBe(false);
    expect(result.array()[0].path).toBe("currentPassword");
  });
});
