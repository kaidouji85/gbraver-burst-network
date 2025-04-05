/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: [["lcov", { projectRoot: "../../" }]],
};
