module.exports = {
  parser: "@babel/eslint-parser",
  env: {
    node: true,
  },
  extends: [
    "eslint:recommended",
    "plugin:jest/recommended",
    "plugin:flowtype/recommended"
  ],
  plugins: [
    "flowtype",
    "jest"
  ]
};
