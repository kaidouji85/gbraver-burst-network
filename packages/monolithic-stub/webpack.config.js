require('dotenv').config();

const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const BUILD_PATH = 'build';
const BUILD_INDEX_JS_PATH = `index.js`;

module.exports = {
  mode: 'development',
  entry: {
    [BUILD_INDEX_JS_PATH]: path.resolve(__dirname, 'src/index.js')
  },
  output: {
    path: path.resolve(__dirname, BUILD_PATH),
    filename: '[name]'
  },
  devServer: {
    contentBase: path.resolve(__dirname, BUILD_PATH),
    port: 8080,
    host:'0.0.0.0'
  },
  module: {
    rules: [
      {
        test: /\.js/,
        exclude: /node_modules/,
        use: 'babel-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.js', '.css']
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, `${BUILD_PATH}/index.html`),
      template: 'src/index.html',
      inject: true
    }),
    new webpack.DefinePlugin({
      API_SERVER_URL: JSON.stringify(process.env.API_SERVER_URL),
      USER_ID: JSON.stringify(process.env.USER_ID),
      PASSWORD: JSON.stringify(process.env.PASSWORD),
      INVALID_USER_ID: JSON.stringify(process.env.INVALID_USER_ID),
      INVALID_PASSWORD: JSON.stringify(process.env.INVALID_PASSWORD),
    })
  ]
};