import eslint from "@eslint/js";
import jest from "eslint-plugin-jest";
import simpleImportSort from "eslint-plugin-simple-import-sort";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "node_modules/*",
      "coverage/*",

      // tscがトランスパイルしたファイルはeslintの対象外とする
      "lib/**/*.js",
      "lib/**/*.d.ts",
      "bin/**/*.js",
      "bin/**/*.d.ts",
      "test/**/*.js",
      "test/**/*.d.ts",
    ],
  },
  eslint.configs.recommended,
  tseslint.configs.recommended,
  {
    plugins: {
      "simple-import-sort": simpleImportSort,
    },
    rules: {
      "simple-import-sort/imports": "error",
      "simple-import-sort/exports": "error",
    },
  },
  {
    files: ["test/**"],
    ...jest.configs["flat/recommended"],
    rules: {
      ...jest.configs["flat/recommended"].rules,
    },
  },
);
