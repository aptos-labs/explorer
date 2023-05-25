module.exports = {
  // most plugins are intentionally commented out for now until we have time to address all the issues raised by them.
  // this should be just temporary.
  env: {browser: true, es2020: true},
  extends: [
    // 'eslint:recommended',
    // 'plugin:@typescript-eslint/recommended',
    "plugin:react-hooks/recommended",
  ],
  parser: "@typescript-eslint/parser",
  parserOptions: {ecmaVersion: "latest", sourceType: "module"},
  // plugins: ['react-refresh'],
  rules: {
    // 'react-refresh/only-export-components': 'warn',
  },
};
