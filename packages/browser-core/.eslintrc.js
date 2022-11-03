module.exports = {
    "parser": "@babel/eslint-parser",
    "extends": [
        "eslint:recommended",
        "plugin:flowtype/recommended"
    ],
    "plugins": [
        "flowtype",
        "simple-import-sort"
    ],
    "rules": {
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error"
      }
};
