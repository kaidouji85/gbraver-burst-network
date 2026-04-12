require("dotenv").config();

const webpack = require("webpack");
const path = require("path");
const HtmlWebpackPlugin = require("html-webpack-plugin");

const BUILD_PATH = "build";
const BUILD_INDEX_JS_PATH = `index.js`;

module.exports = {
  mode: "development",
  devtool: "inline-source-map",
  entry: {
    [BUILD_INDEX_JS_PATH]: path.resolve(__dirname, "src/index.ts"),
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
    new webpack.DefinePlugin({
      "process.env.WS_SIGNAL_SERVER_URL": JSON.stringify(
        process.env.WS_SIGNAL_SERVER_URL,
      ),
      "process.env.WEBRTC_HELPER_API_URL": JSON.stringify(
        process.env.WEBRTC_HELPER_API_URL,
      ),
      "process.env.COTURN_DOMAIN_NAME": JSON.stringify(
        process.env.COTURN_DOMAIN_NAME,
      ),
    }),
  ],
};
