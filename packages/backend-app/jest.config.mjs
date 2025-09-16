/** @type {import('ts-jest').JestConfigWithTsJest} */
export default {
  preset: "ts-jest",
  testEnvironment: "node",
  collectCoverage: true,
  coverageDirectory: "coverage",
  coverageReporters: [["lcov", { projectRoot: "../../" }]],
  // 変換を無視するパターン（マッチしたファイルは変換されない）
  // 正規表現の否定先読みで、uuidパッケージを変換対象に含める
  // 参考文献
  // https://qiita.com/konyaru/items/b22916308ee6f03272db
  transformIgnorePatterns: ["node_modules/(?!(uuid)/)"],
  // uuidパッケージのES Modules対応
  transform: {
    //"^.+\\.tsx?$": "ts-jest",
    "^.+\\.jsx?$": "babel-jest",
  },
};
