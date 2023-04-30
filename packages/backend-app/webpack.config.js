const path = require('path');
const slsw = require('serverless-webpack');

module.exports = {
  entry: slsw.lib.entries,
  output: {
    libraryTarget: 'commonjs',
    filename: '[name].js',
    path: path.join(__dirname, '.webpack'),
  },
  mode: 'development',
  target: 'node',
  module: {
    rules: [
      {
        test: /\.ts$/,
        enforce: 'pre',
        exclude: /node_modules/,
        include: __dirname,
        use: 'ts-loader'
      },
    ],
  },
  resolve: {
    extensions: [
      '.ts', '.js', 'mjs', 'cjs'
    ],
  },
};
