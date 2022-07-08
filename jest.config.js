module.exports = {
  clearMocks: true,
  coverageDirectory: 'coverage',
  coverageProvider: 'babel',
  testEnvironment: 'node',

  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
};
