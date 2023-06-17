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
    // auth0のライブラリインポートエラーを解消するために、
    // superagent-proxy、formidableをalias falseに設定
    //
    // 公式サイトのFAQによると、```Error: Can't resolve 'superagent-proxy'```を解消するために、
    // superagent-proxyを alias false に設定する必要があるらしい
    // https://github.com/auth0/node-auth0/blob/master/FAQ.md#getting-error-cant-resolve-superagent-proxy-when-bundling-with-webpack
    //
    // 上記の設定だけではエラーが解消しなかったが、
    // 以下のissueによるとformidableも併せて alias false に設定する必要があるらしい
    // https://github.com/auth0/node-auth0/issues/798#issuecomment-1493858162
    //
    //
    alias: {
      'superagent-proxy': false,
      'formidable': false,
    }
  },
};
