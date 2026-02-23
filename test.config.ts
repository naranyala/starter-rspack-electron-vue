// Bun Test Configuration
// https://bun.sh/docs/api/test

export default {
  test: {
    // Run tests in parallel
    parallel: true,

    // Timeout for each test in milliseconds
    timeout: 10000,

    // Enable coverage reporting
    coverage: {
      reporter: ['text', 'json', 'html'],
      outputDir: './coverage',
      include: ['src/**/*.{ts,js,vue}'],
      exclude: ['src/**/*.d.ts', 'src/**/*.spec.ts', 'test/**/*', 'node_modules/**/*', 'dist/**/*'],
    },

    // Test file patterns
    root: './test',

    // Setup file to run before all tests
    // setupFiles: ['./test/setup.ts'],

    // Glob patterns for test files
    include: ['**/*.test.ts'],

    // Exclude patterns
    exclude: ['**/node_modules/**', '**/dist/**', '**/build/**', '**/.git/**'],

    // Environment for tests
    // 'node' for backend, 'happy-dom' or 'jsdom' for frontend
    environment: 'node',

    // Retry failed tests
    retry: 1,

    // Stop on first failure
    bail: false,

    // Verbose output
    verbose: true,
  },
};
