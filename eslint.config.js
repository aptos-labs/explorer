import globals from "globals";
import tsPlugin from "@typescript-eslint/eslint-plugin";
import parser from "@typescript-eslint/parser";
import reactHooks from "eslint-plugin-react-hooks";
import reactHtml from "eslint-plugin-html";

export default [
  {
    ignores: [
      "pnpm-lock.yaml",
      "node_modules/*",
      "dist/*",
      "build/assets/*.js",
      "**/*.js",
      "**/*.cjs",
    ],
  },
  {
    files: ["*.ts", "*.tsx"],
  },
  ...tsPlugin.configs["flat/recommended"],
  reactHooks.configs.flat["recommended"],
  {
    languageOptions: {
      parser: parser,
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.es2020,
      },
    },

    plugins: {
      html: reactHtml,
    },

    rules: {
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
          caughtErrorsIgnorePattern: "^_",
        },
      ],
    },
  },
];
