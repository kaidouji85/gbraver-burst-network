module.exports = {
  parser: "@typescript-eslint/parser",
  env: {
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jest/recommended",
  ],
  plugins: [
    "@typescript-eslint",
    "jest",
    "simple-import-sort"
  ],
  rules: {
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error"
  }
};
