module.exports = {
  clearMocks: true,
  testEnvironment: 'node',
  rootDir: '.',
  transform: {
    '\\.js$': [
      'babel-jest',
      { presets: [['@babel/preset-env', { targets: { node: 'current' } }]] },
    ],
  },
  transformIgnorePatterns: ['node_modules/(?!@async-fn/core)'],
};
