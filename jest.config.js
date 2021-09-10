/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: '<rootDir>/jsdom.env.js',
  testPathIgnorePatterns: ['/dist/', '/node_modules/'],
  coverageThreshold: {
    global: {
      lines: 90
    }
  }
};
