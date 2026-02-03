import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node', // or 'jsdom' for frontend tests
    include: ['test/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}', 'src/**/*.{test,spec}.{js,mjs,cjs,ts,mts,cts,jsx,tsx}'],
    exclude: [
      'node_modules',
      'dist',
      '.git',
      '.github',
      'coverage',
      'scripts',
      'types'
    ],
    reporters: ['default', 'verbose'],
    coverage: {
      provider: 'v8', // Changed from 'v8' to use the installed provider
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'scripts/**',
        'types/**',
        '**/index.ts',
        '**/types.ts',
        '**/constants.ts',
        '**/types/**',
        '**/index.ts',
        '**/__tests__/**',
        '**/*.test.ts',
        '**/*.spec.ts'
      ]
    },
    typecheck: {
      checker: 'tsc',
      include: ['src/**/*.{test,spec}.{ts,tsx}'],
      exclude: [
        'node_modules/**',
        'dist/**',
        'scripts/**',
        'types/**'
      ]
    },
  },
});