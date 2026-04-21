module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: [
    '**/*.(t|j)s',
  ],
  coverageDirectory: '../coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@agents/(.*)$': '<rootDir>/agents/$1',
    '^@workflows/(.*)$': '<rootDir>/workflows/$1',
    '^@models/(.*)$': '<rootDir>/models/$1',
    '^@tools/(.*)$': '<rootDir>/tools/$1',
    '^@common/(.*)$': '<rootDir>/common/$1',
  },
};
