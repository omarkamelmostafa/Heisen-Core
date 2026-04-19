// frontend/src/__tests__/setup.js
import "@testing-library/jest-dom";
import { vi } from "vitest";

// ─── Mock next/navigation ───────────────────────────────────────────────────
// Next.js navigation hooks are not available in jsdom.
// Every test that uses hooks importing useRouter/usePathname gets this mock.
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    forward: vi.fn(),
    refresh: vi.fn(),
    prefetch: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => ({
    get: vi.fn().mockReturnValue(null),
  }),
}));

// ─── Mock next-intl ─────────────────────────────────────────────────────────
// next-intl requires a provider and message files at runtime.
// Tests use this mock so hooks calling useTranslations() get a pass-through.
vi.mock("next-intl", () => ({
  useTranslations: () => (key) => key,
  useLocale: () => "en",
}));

// ─── Mock next-themes ───────────────────────────────────────────────────────
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
  ThemeProvider: ({ children }) => children,
}));

// ─── Silence console.error for known React warnings in tests ────────────────
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = (...args) => {
    const msg = args[0]?.toString() ?? "";
    // Suppress known noisy warnings that are not test failures
    if (
      msg.includes("Warning: ReactDOM.render") ||
      msg.includes("act(") ||
      msg.includes("Not implemented: navigation")
    ) {
      return;
    }
    originalConsoleError(...args);
  };
});

afterEach(() => {
  console.error = originalConsoleError;
});
