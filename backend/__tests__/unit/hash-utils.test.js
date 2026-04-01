// backend/__tests__/unit/hash-utils.test.js
import { describe, it, expect } from "vitest";
import { hashPassword, comparePassword } from "../../utilities/auth/hash-utils.js";

const TEST_PASSWORD = "SecurePassword123!";
const TEST_WRONG_PASSWORD = "WrongPassword456!";
const TEST_EMPTY_PASSWORD = "";
const TEST_LONG_PASSWORD = "A".repeat(100);

describe("Password Hashing Utility (hash-utils.js)", () => {
  // A1
  it("hashPassword returns a valid bcrypt hash", async () => {
    const hash = await hashPassword(TEST_PASSWORD);
    expect(typeof hash).toBe("string");
    expect(hash).not.toBe(TEST_PASSWORD);
    expect(hash.startsWith("$2")).toBe(true);
    expect(hash.length).toBeGreaterThan(50);
  });

  // A2
  it("comparePassword returns true for correct password", async () => {
    const hash = await hashPassword(TEST_PASSWORD);
    const result = await comparePassword(TEST_PASSWORD, hash);
    expect(result).toBe(true);
  });

  // A3
  it("Same password hashed twice yields different hashes", async () => {
    const hash1 = await hashPassword(TEST_PASSWORD);
    const hash2 = await hashPassword(TEST_PASSWORD);
    expect(hash1).not.toBe(hash2);
  });

  // A4
  it("comparePassword returns false for wrong password", async () => {
    const hash = await hashPassword(TEST_PASSWORD);
    const result = await comparePassword(TEST_WRONG_PASSWORD, hash);
    expect(result).toBe(false);
  });

  // A5
  it("comparePassword returns false for empty string", async () => {
    const hash = await hashPassword(TEST_PASSWORD);
    const result = await comparePassword(TEST_EMPTY_PASSWORD, hash);
    expect(result).toBe(false);
  });

  // A6
  it("Long password is handled", async () => {
    const hash = await hashPassword(TEST_LONG_PASSWORD);
    const result = await comparePassword(TEST_LONG_PASSWORD, hash);
    expect(result).toBe(true);
  });
});
