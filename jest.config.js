module.exports = {
  testEnvironment: 'jsdom',
  moduleNameMapper: {
    '\\.(css|less|scss|sass)$': '<rootDir>/src/__mocks__/styleMock.js',
    '\\.(gif|ttf|eot|svg|png|webp)$': '<rootDir>/src/__mocks__/fileMock.js',
  },
  setupFiles: ['<rootDir>/src/setupTests.js'],
  transform: {
    '^.+\\.[t|j]sx?$': 'babel-jest'
  },
  collectCoverage: true,
  coverageDirectory: "coverage",
  collectCoverageFrom: [
    "src/**/*.{js,jsx}",
    "!src/**/*.test.{js,jsx}",
    "!**/node_modules/**"
  ]
};
