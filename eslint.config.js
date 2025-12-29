import {fileURLToPath} from "node:url";
import {dirname} from "node:path";
import globals from "globals";
import reactHtml from "eslint-plugin-html";
import parser from "@typescript-eslint/parser";
import {FlatCompat} from "@eslint/eslintrc";

const __dirname = dirname(fileURLToPath(import.meta.url));

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

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
