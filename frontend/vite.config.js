// frontend/vite.config.js
import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";
import { fileURLToPath } from "url";
import tsconfigPaths from "vite-tsconfig-paths";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  root: __dirname,
  plugins: [react(), tsconfigPaths()],
  resolve: {
    alias: [
      { find: /^@\/services\/(.*)$/, replacement: path.resolve(__dirname, "./src/services/$1") },
      { find: /^@\/store\/(.*)$/, replacement: path.resolve(__dirname, "./src/store/$1") },
      { find: /^@\/lib\/(.*)$/, replacement: path.resolve(__dirname, "./src/lib/$1") },
      { find: /^@\/hooks\/(.*)$/, replacement: path.resolve(__dirname, "./src/hooks/$1") },
      { find: /^@\/components\/(.*)$/, replacement: path.resolve(__dirname, "./src/components/$1") },
      { find: /^@\/utils\/(.*)$/, replacement: path.resolve(__dirname, "./src/utils/$1") },
      { find: /^@\/app\/(.*)$/, replacement: path.resolve(__dirname, "./src/app/$1") },
      { find: "@", replacement: path.resolve(__dirname, "./src") },
      { find: "lodash/isEqualWith", replacement: path.resolve(__dirname, "./node_modules/lodash/isEqualWith.js") },
    ],
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
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@/services": path.resolve(__dirname, "./src/services"),
      "@/store": path.resolve(__dirname, "./src/store"),
      "@/lib": path.resolve(__dirname, "./src/lib"),
      "@/hooks": path.resolve(__dirname, "./src/hooks"),
      "@/components": path.resolve(__dirname, "./src/components"),
      "@/utils": path.resolve(__dirname, "./src/utils"),
      "@/app": path.resolve(__dirname, "./src/app"),
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
        statements: 100,
        branches: 100,
        functions: 100,
        lines: 100,
      },
    },
  },
});
