const path = require('path');

module.exports = {
  entry: './src/index.js',
  target: 'node',
  mode: 'production',
  output: {
    path: path.resolve(process.cwd(), 'build'),
    filename: 'index.js',
    libraryTarget: 'commonjs2',
    libraryExport: 'default',
  },
  node: {
    __dirname: true,
    __filename: true,
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        loader: 'babel-loader',
        options: { cacheDirectory: true, cacheCompression: false },
      },
    ],
  },
};
