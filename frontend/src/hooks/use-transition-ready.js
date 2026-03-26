/**
 * useTransitionReady — Controls skeleton-to-content transitions.
 *
 * Returns { isReady } which becomes true only after:
 * 1. The specified delay (ms) has elapsed (prevents layout flicker)
 * 2. The isLoaded condition is true (waits for async data if provided)
 *
 * Usage modes:
 *
 *   // Mount-only delay (skeleton visible for minimum 300ms)
 *   const { isReady } = useTransitionReady({ delay: 300 });
 *   if (!isReady) return <PageSkeleton />;
 *
 *   // Mount + async (wait for both delay AND data fetch)
 *   const { isReady } = useTransitionReady({ delay: 300, isLoaded: !isFetching });
 *   if (!isReady) return <PageSkeleton />;
 *
 *   // Immediate (no delay, no async — for testing or instant transitions)
 *   const { isReady } = useTransitionReady({ delay: 0 });
 */
import { useState, useEffect } from "react";

export function useTransitionReady({ delay = 300, isLoaded = true } = {}) {
  const [delayPassed, setDelayPassed] = useState(delay === 0);

  useEffect(() => {
    if (delay === 0) return;
    const timer = setTimeout(() => setDelayPassed(true), delay);
    return () => clearTimeout(timer);
  }, [delay]);

  return { isReady: delayPassed && isLoaded };
}
