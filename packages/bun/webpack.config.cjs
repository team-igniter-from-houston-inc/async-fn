const path = require('path');

module.exports = {
  entry: './src/index.js',
  target: 'node16',
  mode: 'production',
  externals: ['jest', 'sinon', 'vitest', 'bun:test'],
  experiments: {
    outputModule: true,
  },
  output: {
    path: path.resolve(process.cwd(), 'build'),
    filename: 'index.mjs',
    chunkFormat: 'module',
    library: {
      type: 'module',
    },
  },
  resolve: {
    extensions: ['.js', '.json'],
    fullySpecified: false,
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
        resolve: {
          fullySpecified: false,
        },
      },
    ],
  },
};
