// frontend/vitest.config.js
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./src/__tests__/setup.js"],
    css: false,
    coverage: {
      provider: "v8",
      include: [
        "src/store/slices/auth/auth-slice.js",
        "src/store/slices/auth/auth-selectors.js",
        "src/store/slices/user/user-slice.js",
        "src/store/slices/user/user-selectors.js",
        "src/lib/notifications/notify.js",
      ],
      thresholds: {
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
    projects: [
      {
        test: {
          name: "unit",
          include: ["src/__tests__/unit/**/*.test.{js,jsx}"],
        },
      },
      {
        test: {
          name: "integration",
          include: ["src/__tests__/integration/**/*.test.{js,jsx}"],
        },
      },
    ],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
});

// WHY THE css OVERRIDE IS AT ROOT LEVEL
// The css: false inside test: silences CSS imports in test files.
// The css: { postcss: { plugins: [] } } at the root config level
// prevents Vite from loading postcss.config.mjs from the filesystem
// during the test run. Both are needed. One does not replace the other.
