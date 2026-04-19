// frontend/src/__tests__/unit/environment-debug.test.js
import { describe, it, expect, vi } from "vitest";
import { render } from "@testing-library/react";
import { EnvironmentDebug } from "../../hooks/environment-debug";

describe("EnvironmentDebug", () => {
  it("should return null when SHOW_ENV_DEBUG is false", () => {
    const { container } = render(<EnvironmentDebug />);
    expect(container.firstChild).toBeNull();
  });
});
