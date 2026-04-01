// frontend/eslint.config.mjs
import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";
import js from "@eslint/js";
import importPlugin from "eslint-plugin-import";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";
import jsxA11y from "eslint-plugin-jsx-a11y";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  // Next.js core rules
  ...compat.extends("next/core-web-vitals"),

  // JavaScript recommended rules
  js.configs.recommended,

  // Import plugin
  importPlugin.flatConfigs.recommended,

  // React plugins
  reactPlugin.configs.flat.recommended,
  reactHooks.configs["recommended-latest"],
  jsxA11y.flatConfigs.recommended,

  // Main configuration for all JS/JSX files
  {
    files: ["**/*.js", "**/*.jsx"],

    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: {
          jsx: true,
        },
      },
      globals: {
        React: "readonly",
        console: "readonly",
        process: "readonly",
        module: "readonly",
        require: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
      },
    },

    settings: {
      react: {
        version: "detect",
      },
      "import/resolver": {
        node: {
          extensions: [".js", ".jsx"],
          paths: ["src"],
        },
      },
    },

    rules: {
      // ===== CODE QUALITY =====
      "no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
      "no-console":
        process.env.NODE_ENV === "production"
          ? ["warn", { allow: ["warn", "error"] }]
          : "off",
      "no-debugger": process.env.NODE_ENV === "production" ? "error" : "warn",

      // ===== IMPORT/EXPORT RULES =====
      "import/order": [
        "error",
        {
          groups: [
            "builtin", // Node.js built-in modules
            "external", // npm packages
            "internal", // Internal aliases (@/...)
            "parent", // Relative parent imports
            "sibling", // Relative sibling imports
            "index", // Index imports
            "object", // Object imports
            "type", // Type imports
          ],
          pathGroups: [
            {
              pattern: "react",
              group: "external",
              position: "before",
            },
            {
              pattern: "next/**",
              group: "external",
              position: "before",
            },
            {
              pattern: "@/components/**",
              group: "internal",
            },
            {
              pattern: "@/lib/**",
              group: "internal",
            },
            {
              pattern: "@/utils/**",
              group: "internal",
            },
            {
              pattern: "@/hooks/**",
              group: "internal",
            },
            {
              pattern: "@/api/**",
              group: "internal",
            },
            {
              pattern: "@/styles/**",
              group: "internal",
            },
          ],
          pathGroupsExcludedImportTypes: ["react"],
          "newlines-between": "always",
          alphabetize: {
            order: "asc",
            caseInsensitive: true,
          },
        },
      ],

      "import/no-unresolved": "off", // Handled by TypeScript/JavaScript
      "import/no-duplicates": "error",
      "import/no-cycle": "warn",

      // ===== REACT RULES =====
      "react/react-in-jsx-scope": "off", // Not needed in React 17+
      "react/jsx-uses-react": "off", // Not needed in React 17+
      "react/prop-types": "off", // Not using prop-types
      "react/jsx-key": "error",
      "react/jsx-no-duplicate-props": "error",
      "react/jsx-no-undef": "error",
      "react/no-unknown-property": "error",

      // React Hooks
      "react-hooks/exhaustive-deps": "warn",
      "react-hooks/rules-of-hooks": "error",

      // ===== ACCESSIBILITY =====
      "jsx-a11y/alt-text": "warn",
      "jsx-a11y/anchor-is-valid": "warn",
      "jsx-a11y/click-events-have-key-events": "warn",
      "jsx-a11y/no-static-element-interactions": "warn",

      // ===== CODE STYLE =====
      "prefer-const": "error",
      "no-var": "error",
      "object-shorthand": ["warn", "always"],
      "arrow-body-style": ["warn", "as-needed"],

      // ===== SECURITY =====
      "no-eval": "error",
      "no-implied-eval": "error",
    },
  },

  // ===== SPECIFIC FILE CONFIGURATIONS =====

  // App Router specific rules
  {
    files: ["src/app/**/*.js", "src/app/**/*.jsx"],
    rules: {
      "@next/next/no-html-link-for-pages": "off", // App router handles links differently
    },
  },

  // API routes specific rules
  {
    files: ["src/app/api/**/*.js"],
    rules: {
      "no-console": "off", // Allow console in API routes
    },
  },

  // Configuration files
  {
    files: ["*.config.js", "**/*.config.js"],
    rules: {
      "no-console": "off", // Allow console in config files
      "import/no-anonymous-default-export": "off",
    },
  },

  // ===== IGNORE PATTERNS =====
  {
    ignores: [
      "node_modules/**",
      ".next/**",
      "out/**",
      "build/**",
      "dist/**",
      "next-env.d.ts",
      "*.config.js",
      "coverage/**",
      "*.min.js",
      "public/**",
      "*.d.ts",
    ],
  },
];

export default eslintConfig;


