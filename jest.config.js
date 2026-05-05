module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  moduleNameMapper: {
    '^@agents/(.*)$': '<rootDir>/src/agents/$1',
    '^@workflows/(.*)$': '<rootDir>/src/workflows/$1',
    '^@models/(.*)$': '<rootDir>/src/models/$1',
    '^@tools/(.*)$': '<rootDir>/src/tools/$1',
    '^@common/(.*)$': '<rootDir>/src/common/$1',
    '^@cache/(.*)$': '<rootDir>/src/cache/$1',
    '^@search-rules/(.*)$': '<rootDir>/src/search-rules/$1',
    '^@auth/(.*)$': '<rootDir>/src/auth/$1',
  },
};
