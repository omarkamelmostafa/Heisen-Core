import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useTransitionReady } from "@/hooks/use-transition-ready";

describe("useTransitionReady", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.runOnlyPendingTimers();
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it("returns ready immediately when delay is 0", () => {
    const { result } = renderHook(() => useTransitionReady({ delay: 0 }));

    expect(result.current.isReady).toBe(true);
  });

  it("waits until the timer elapses when delay is greater than 0", () => {
    const { result } = renderHook(() => useTransitionReady({ delay: 300 }));

    expect(result.current.isReady).toBe(false);

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(result.current.isReady).toBe(true);
  });

  it("gates readiness on isLoaded when delay is 0", () => {
    const { result, rerender } = renderHook(
      ({ delay, isLoaded }) => useTransitionReady({ delay, isLoaded }),
      { initialProps: { delay: 0, isLoaded: false } }
    );

    expect(result.current.isReady).toBe(false);

    act(() => {
      rerender({ delay: 0, isLoaded: true });
    });

    expect(result.current.isReady).toBe(true);
  });

  it("cleans up the timeout on unmount and does not flip readiness after unmount", () => {
    const clearTimeoutSpy = vi.spyOn(globalThis, "clearTimeout");
    const { result, unmount } = renderHook(() => useTransitionReady({ delay: 300 }));

    expect(result.current.isReady).toBe(false);

    unmount();

    act(() => {
      vi.advanceTimersByTime(300);
    });

    expect(clearTimeoutSpy).toHaveBeenCalled();
    expect(result.current.isReady).toBe(false);
  });

  it("resets the pending timer when delay changes before the timer fires", () => {
    const { result, rerender } = renderHook(
      ({ delay }) => useTransitionReady({ delay }),
      { initialProps: { delay: 300 } }
    );

    expect(result.current.isReady).toBe(false);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    act(() => {
      rerender({ delay: 600 });
    });

    expect(result.current.isReady).toBe(false);

    act(() => {
      vi.advanceTimersByTime(450);
    });

    expect(result.current.isReady).toBe(false);

    act(() => {
      vi.advanceTimersByTime(150);
    });

    expect(result.current.isReady).toBe(true);
  });
});
