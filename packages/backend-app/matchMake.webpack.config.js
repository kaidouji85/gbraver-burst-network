const path = require('path');

module.exports = {
  entry: {
    'match-making-polling.js': path.resolve(__dirname, 'src/match-making-polling.js')
  },
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
        test: /\.js$/,
        exclude: /node_modules/,
        include: __dirname,
        use: 'babel-loader'
      },
    ],
  },
};
