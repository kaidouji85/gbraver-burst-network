import { dirname } from "node:path";
import { fileURLToPath } from "node:url";

import path from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

export default {
  entry: {
    "match-making-polling.js": path.resolve(
      __dirname,
      "src/match-making-polling.ts",
    ),
  },
  output: {
    libraryTarget: "commonjs",
    filename: "[name].js",
    path: path.join(__dirname, ".webpack"),
  },
  mode: "development",
  target: "node",
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        include: __dirname,
        use: "ts-loader",
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
};
