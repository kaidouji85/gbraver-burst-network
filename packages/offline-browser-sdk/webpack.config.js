const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const BUILD_PATH = "build";
const BUILD_INDEX_JS_PATH = `index.js`;

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    [BUILD_INDEX_JS_PATH]: path.resolve(__dirname, "src/stub.ts"),
  },
  output: {
    path: path.resolve(__dirname, BUILD_PATH),
    filename: "[name]",
  },
  devServer: {
    static: path.resolve(__dirname, BUILD_PATH),
    port: 8080,
    host: "0.0.0.0",
  },
  module: {
    rules: [
      {
        test: /\.ts/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".js", ".ts"],
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, `${BUILD_PATH}/index.html`),
      template: "src/index.html",
      inject: true,
    }),
  ],
};
