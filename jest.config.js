/** @type {import('jest').Config} */
module.exports = {
  // All current test files are pure TS logic (Zod schemas, the Zustand
  // store, the API service, the AsyncState adapter) — none render React
  // Native components, so a plain Node environment + babel-jest transform
  // is used instead of the heavier `jest-expo` preset and its RN mocks.
  testEnvironment: 'node',
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': 'babel-jest',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/index.ts',
    '!src/**/*.test.{ts,tsx}',
    // Requires rendering (RNTL) or a live RN/AppState/NetInfo/navigation host —
    // out of scope for the plain-Node unit suite, see README "Tests" section.
    '!src/ui/**',
    '!src/navigation/**',
    '!src/storage/**',
    '!src/features/**/components/**',
    '!src/features/**/hooks/**',
    '!src/features/**/*Screen.tsx',
    '!src/lib/appLifecycle.ts',
    '!src/lib/queryClient.ts',
    '!src/api/queries.ts',
  ],
  coverageThreshold: {
    global: {
      statements: 90,
      branches: 75,
      functions: 85,
      lines: 90,
    },
  },
};
