// frontend/src/__tests__/unit/use-error-toggle.test.js
import { describe, it, expect } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useErrorToggle } from "../../hooks/use-error-toggle";

describe("useErrorToggle", () => {
  it("should initialize with shouldError as false", () => {
    const { result } = renderHook(() => useErrorToggle());
    expect(result.current.shouldError).toBe(false);
  });

  it("should set shouldError to true when triggerError is called", () => {
    const { result } = renderHook(() => useErrorToggle());
    act(() => {
      result.current.triggerError();
    });
    expect(result.current.shouldError).toBe(true);
  });

  it("should set shouldError to false when clearError is called", () => {
    const { result } = renderHook(() => useErrorToggle());
    act(() => {
      result.current.triggerError();
    });
    expect(result.current.shouldError).toBe(true);
    act(() => {
      result.current.clearError();
    });
    expect(result.current.shouldError).toBe(false);
  });
});
