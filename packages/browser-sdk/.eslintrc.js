module.exports = {
  parser: "@babel/eslint-parser",
  env: {
    browser: true,
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:jest/recommended",
    "plugin:flowtype/recommended"
  ],
  plugins: [
    "flowtype",
    "jest",
    "simple-import-sort"
  ],
  rules: {
    "simple-import-sort/imports": "error",
    "simple-import-sort/exports": "error"
  }
};
