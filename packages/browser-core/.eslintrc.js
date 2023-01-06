module.exports = {
    "parser": "@typescript-eslint/parser",
    "extends": [
        "eslint:recommended",
        "plugin:@typescript-eslint/recommended",
    ],
    "plugins": [
        "@typescript-eslint",
        "simple-import-sort"
    ],
    "rules": {
        "simple-import-sort/imports": "error",
        "simple-import-sort/exports": "error"
      }
};
