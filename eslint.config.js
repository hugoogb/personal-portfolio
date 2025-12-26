import js from "@eslint/js";
import prettierConfig from "eslint-config-prettier";
import globals from "globals";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import reactRefreshPlugin from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default [
  // Build artifacts / deps
  {
    ignores: ["dist/**", "node_modules/**", "coverage/**"],
  },

  // Node/CommonJS config files (e.g. prettier.config.cjs)
  {
    files: ["**/*.cjs"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.node,
        ...globals.es2022,
      },
    },
  },

  // Base JS rules
  js.configs.recommended,

  // Base TS rules (non-type-aware, fast)
  ...tseslint.configs.recommended,

  // App rules
  {
    files: ["**/*.{js,jsx,ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2022,
      },
    },
    settings: {
      react: { version: "detect" },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooksPlugin,
      "react-refresh": reactRefreshPlugin,
    },
    rules: {
      // React (JSX transform doesn't require React in scope)
      "react/react-in-jsx-scope": "off",

      // Hooks
      ...reactHooksPlugin.configs.recommended.rules,

      // Vite Fast Refresh safety
      "react-refresh/only-export-components": ["warn", { allowConstantExport: true }],
    },
  },

  // Disable stylistic rules that conflict with Prettier
  prettierConfig,
];
