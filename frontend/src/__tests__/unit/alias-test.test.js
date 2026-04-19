// Test to verify alias resolution works
import { describe, it, expect } from "vitest";
import { authService } from "@/services/domain/auth-service";

describe("alias resolution", () => {
  it("should resolve @/services/domain/auth-service", () => {
    expect(authService).toBeDefined();
  });
});
