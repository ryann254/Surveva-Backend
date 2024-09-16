/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  testEnvironment: 'node',
  transform: {
    '^.+.tsx?$': ['ts-jest', {}],
  },
  setupFilesAfterEnv: ['./jest.setup.ts'],
  // globalSetup: '<rootDir>/globalSetup.ts',
  // globalTeardown: '<rootDir>/globalTeardown.ts',
};
