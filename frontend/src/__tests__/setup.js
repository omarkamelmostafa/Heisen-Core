// frontend/src/__tests__/setup.js
import "@testing-library/jest-dom";
import { vi } from "vitest";

// ─── Mock next/navigation ───────────────────────────────────────────────────
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
vi.mock("next-intl", () => ({
  useTranslations: () => (key) => key,
  useLocale: () => "en",
}));

// ─── Mock next-themes ───────────────────────────────────────────────────────
vi.mock("next-themes", () => ({
  useTheme: () => ({ theme: "light", setTheme: vi.fn() }),
  ThemeProvider: ({ children }) => children,
}));

// ─── Silence known noisy React warnings ─────────────────────────────────────
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = (...args) => {
    const msg = args[0]?.toString() ?? "";
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
