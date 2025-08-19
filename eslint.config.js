import js from "@eslint/js";
import globals from "globals";
import { defineConfig } from "eslint/config";

export default defineConfig([
  {
    files: ["**/*.{js,mjs,cjs}"],
    plugins: { js },
    extends: ["js/recommended"],
  },
  {
    files: ["**/*.{jsx,tsx}"],
    languageOptions: {
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        ecmaFeatures: {
          jsx: true
        }
      },
      globals: {
        ...globals.browser,
        React: "readonly"
      }
    }
  },
  { 
    files: ["**/*.js"], 
    languageOptions: { 
      sourceType: "module",
      globals: globals.browser
    } 
  },
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    languageOptions: { 
      globals: globals.browser 
    },
    rules: {
      "no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
      "no-undef": "error"
    }
  },
]);
