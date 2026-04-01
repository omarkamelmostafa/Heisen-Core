// backend/__tests__/unit/crypto-utils.test.js
import { describe, it, expect } from "vitest";
import { generateVerificationCode, generateResetToken } from "../../utilities/auth/crypto-utils.js";
import { hashToken } from "../../services/auth/token-service.js"; // from token-service

describe("Cryptography Utility (crypto-utils.js)", () => {
  // C1
  it("generateVerificationCode returns 6-digit string", () => {
    const code = generateVerificationCode();
    expect(typeof code).toBe("string");
    expect(code.length).toBe(6);
    expect(/^\d{6}$/.test(code)).toBe(true);
  });

  // C2
  it("generateResetToken returns hex string of correct length", () => {
    const token = generateResetToken();
    expect(typeof token).toBe("string");
    expect(/^[a-f0-9]+$/.test(token)).toBe(true);
    expect(token.length).toBe(64);
  });

  // C3
  it("hashToken returns consistent SHA-256 hash", () => {
    const input = "test-token-value";
    const hash1 = hashToken(input);
    const hash2 = hashToken(input);
    expect(hash1).toBe(hash2);
    expect(typeof hash1).toBe("string");
    expect(hash1.length).toBe(64);
  });

  // C4
  it("Verification codes have high entropy", () => {
    const codes = [];
    for (let i = 0; i < 10000; i++) {
      codes.push(generateVerificationCode());
    }
    const uniqueCodes = new Set(codes);
    expect(uniqueCodes.size).toBeGreaterThanOrEqual(9900);
  });

  // C5
  it("Reset tokens have zero collisions", () => {
    const tokens = [];
    for (let i = 0; i < 1000; i++) {
      tokens.push(generateResetToken());
    }
    const uniqueTokens = new Set(tokens);
    expect(uniqueTokens.size).toBe(1000);
  });
});
