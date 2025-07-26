// @ts-check

import js from "@eslint/js";
import globals from "globals";

/** @type {import('eslint').Linter.FlatConfig[]} */
export default [
  {
    // Apply this configuration to all JavaScript files
    files: ["**/*.js", "**/*.mjs"],

    // Language options for the files
    languageOptions: {
      ecmaVersion: "latest", // Use the latest ECMAScript features
      sourceType: "module",  // Use ES modules
      globals: {
        ...globals.browser,  // Include browser globals (window, document, etc.)
        ...globals.node,     // Include Node.js globals (process, require, etc.)
      },
    },

    // Rules for the files
    rules: {
      // Start with ESLint's recommended set of rules
      ...js.configs.recommended.rules,

      // --- Customize or override rules below ---

      // Warn about unused variables instead of causing an error
      "no-unused-vars": "warn",

      // Allow console.log statements in your code
      "no-console": "off",
    },
  },
];
