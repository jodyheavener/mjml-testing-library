/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: '<rootDir>/tests/jsdom.env.js',
  setupFilesAfterEnv: ['<rootDir>/tests/setup.ts'],
  testPathIgnorePatterns: ['/dist/', '/node_modules/'],
  coverageThreshold: {
    global: {
      lines: 90
    }
  }
};
