/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: [["lcov", { projectRoot: "../../" }]],
  // 正規表現の否定先読みで、nanoidパッケージを変換対象に含める
  transformIgnorePatterns: ["node_modules/(?!(nanoid)/)"],
  transform: {
    "^.+\\.jsx?$": "babel-jest",
  },
};
