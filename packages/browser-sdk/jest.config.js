/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: [['lcov', { projectRoot: '../../' }]],
  modulePathIgnorePatterns: ["<rootDir>/lib/"]
};