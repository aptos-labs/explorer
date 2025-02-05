/* eslint-disable @typescript-eslint/no-require-imports */
const globals = require("globals");
const reactHtml = require("eslint-plugin-html");
const parser = require("@typescript-eslint/parser");

const eslintRc = require("@eslint/eslintrc");

const compat = new eslintRc.FlatCompat({
  baseDirectory: __dirname,
});

module.exports = [
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
  ...compat.extends("plugin:@typescript-eslint/recommended"),
  ...compat.extends("plugin:react-hooks/recommended"),
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
  },
];
