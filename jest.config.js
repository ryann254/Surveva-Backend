/** @type {import('ts-jest').JestConfigWithTsJest} **/
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['./jest.setup.ts'],
  globalSetup: './globalSetup.ts',
  globalTeardown: './globalTeardown.ts',
};
