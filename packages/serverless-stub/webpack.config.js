require('dotenv').config();

const webpack = require('webpack');
const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

const BUILD_PATH = 'build';
const BUILD_INDEX_JS_PATH = `index.js`;

module.exports = {
  mode: 'development',
  devtool: 'inline-source-map',
  entry: {
    [BUILD_INDEX_JS_PATH]: path.resolve(__dirname, 'src/index.js')
  },
  output: {
    path: path.resolve(__dirname, BUILD_PATH),
    filename: '[name]'
  },
  devServer: {
    static: path.resolve(__dirname, BUILD_PATH),
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
    extensions: ['.js']
  },
  plugins: [
    new HtmlWebpackPlugin({
      filename: path.resolve(__dirname, `${BUILD_PATH}/index.html`),
      template: 'src/index.html',
      inject: true
    }),
    new webpack.DefinePlugin({
      'process.env.AUTH0_DOMAIN': JSON.stringify(process.env.AUTH0_DOMAIN),
      'process.env.AUTH0_CLIENT_ID': JSON.stringify(process.env.AUTH0_CLIENT_ID),
      'process.env.AUTH0_AUDIENCE': JSON.stringify(process.env.AUTH0_AUDIENCE),
      'process.env.REST_API_URL': JSON.stringify(process.env.REST_API_URL),
      'process.env.WEBSOCKET_API_URL': JSON.stringify(process.env.WEBSOCKET_API_URL),
    })
  ]
};