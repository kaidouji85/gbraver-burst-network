/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: [["lcov", { projectRoot: "../../" }]],
  // 変換を無視するパターン（マッチしたファイルは変換されない）
  // "node_modules配下でuuid以外" = uuidのみ変換対象にする
  transformIgnorePatterns: [
    "node_modules/(?!(uuid)/)"
  ]
};
