// frontend/vitest.config.js
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  plugins: [react()],
  resolve: {
    alias: {
      "@/services": path.resolve(__dirname, "./src/services"),
      "@": path.resolve(__dirname, "./src"),
    },
  },
  css: {
    postcss: {
      plugins: [],
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [path.resolve(__dirname, "./src/__tests__/setup.js")],
    server: {
      deps: {
        inline: ["@reduxjs/toolkit", "react-redux"],
      },
    },
    css: false,
    mockReset: false,
    include: ["**/src/__tests__/**/*.test.{js,jsx}"],
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
        perFile: true,
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
