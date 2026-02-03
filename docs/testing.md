# Testing Setup

This project includes a comprehensive testing setup using [Vitest](https://vitest.dev/), a fast and lightweight testing framework for Vite and beyond.

## Test Scripts

The following test scripts are available:

- `npm run test` - Run tests in watch mode
- `npm run test:run` - Run all tests once
- `npm run test:ui` - Run tests with UI interface
- `npm run test:coverage` - Run tests with coverage report
- `npm run test:watch` - Run tests in watch mode

## Test Structure

Tests are organized in the `test/` directory:

```
test/
└── unit/
    ├── shared-utils.test.ts    # Tests for shared utilities
    ├── backend-utils.test.ts   # Tests for backend utilities
    └── frontend-utils.test.ts  # Tests for frontend utilities
```

## Writing Tests

### Unit Tests
Unit tests are written using Vitest's testing API. Each test file should:

1. Import necessary functions from the source code
2. Use `describe()` to group related tests
3. Use `it()` or `test()` for individual test cases
4. Use `expect()` for assertions

Example:
```typescript
import { describe, it, expect } from 'vitest';
import { StringUtils } from '../src/shared/utils';

describe('StringUtils', () => {
  it('should capitalize a string', () => {
    expect(StringUtils.capitalize('hello')).toBe('Hello');
  });
});
```

### Mocking
For mocking dependencies, use Vitest's built-in mocking capabilities:

```typescript
import { vi, describe, it, expect } from 'vitest';

// Mock a function
const mockFn = vi.fn();
mockFn.mockReturnValue('mocked value');
```

## Coverage
Code coverage is collected using the built-in coverage provider. Reports are generated in:
- Console output
- JSON format
- HTML format (in `coverage/` directory)

## Configuration

The test configuration is located in `vitest.config.ts` and includes:
- Node.js environment for backend tests
- Global test utilities
- Coverage reporting
- Type checking
- File inclusion/exclusion patterns

## Running Tests

### Single Run
```bash
npm run test:run
```

### Watch Mode
```bash
npm run test
```

### With Coverage
```bash
npm run test:coverage
```

### With UI
```bash
npm run test:ui
```

## Test Categories

The project includes tests for:

1. **Shared Utilities** - Object manipulation, string processing, validation, arrays, caching, and async operations
2. **Backend Utilities** - File system operations, cryptography, logging, path handling, environment management
3. **Frontend Utilities** - Math operations, color manipulation, date handling, number formatting, storage management

Each category has comprehensive test coverage for the most critical functions and edge cases.