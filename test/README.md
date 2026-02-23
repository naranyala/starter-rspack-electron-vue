# Test Suite Documentation

## Overview

This project uses **Bun Test** - a fast, built-in test runner from the Bun runtime. The test suite is designed to be minimal yet comprehensive enough to ensure project longevity and catch regressions early.

## Quick Start

```bash
# Run all tests
bun test

# Run tests with coverage
bun test --coverage

# Run specific test file
bun test test/unit/backend/di/container.test.ts

# Run tests in watch mode
bun test --watch

# Run tests matching a pattern
bun test --test-name-pattern "should register"
```

## Test Structure

```
test/
├── setup.ts                    # Test setup and mocks
├── unit/                       # Unit tests
│   ├── backend/                # Backend (main process) tests
│   │   ├── di/                 # Dependency Injection tests
│   │   │   └── container.test.ts
│   │   └── services/           # Service tests
│   │       └── database.test.ts
│   ├── frontend/               # Frontend (renderer) tests
│   │   └── stores/             # Pinia store tests
│   │       ├── app.test.ts
│   │       └── settings.test.ts
│   └── shared/                 # Shared code tests
│       ├── di/                 # DI tests
│       ├── errors.test.ts      # Error handling tests
│       ├── events/             # Event bus tests
│       ├── logger.test.ts      # Logger tests
│       ├── utils.test.ts       # Utility tests
│       └── validation.test.ts  # Validation tests
└── integration/                # Integration tests
    └── backend/                # Backend integration
        └── ipc.test.ts         # IPC communication tests
```

## Writing Tests

### Basic Test Structure

```typescript
import { describe, it, expect, beforeEach, mock } from 'bun:test';
import { myFunction } from '@/shared/utils';

describe('MyModule', () => {
  beforeEach(() => {
    // Setup before each test
  });

  it('should do something', () => {
    const result = myFunction();
    expect(result).toBe('expected');
  });

  it('should handle async operations', async () => {
    const result = await myAsyncFunction();
    expect(result).toBeDefined();
  });
});
```

### Mocking Functions

```typescript
import { mock } from 'bun:test';

// Create a mock function
const myMock = mock(() => 'return value');

// Spy on console methods
const logSpy = mock(() => {});
console.log = logSpy;

// Check calls
expect(myMock).toHaveBeenCalled();
expect(myMock).toHaveBeenCalledTimes(2);
expect(myMock.mock.calls[0][0]).toBe('first argument');
```

### Testing Pinia Stores

```typescript
import { createPinia, setActivePinia } from 'pinia';
import { useAppStore } from '@/frontend/stores/app';

describe('App Store', () => {
  beforeEach(() => {
    setActivePinia(createPinia());
  });

  it('should update state', () => {
    const store = useAppStore();
    store.toggleSidebar();
    expect(store.sidebarVisible).toBe(true);
  });
});
```

## Available Test APIs

### Assertions

```typescript
expect(value).toBe(expected)           // Strict equality
expect(value).toEqual(object)          // Deep equality
expect(value).toBeDefined()            // Not undefined
expect(value).toBeNull()               // Is null
expect(value).toBeTruthy()             // Truthy
expect(value).toBeFalsy()              // Falsy
expect(value).toContain(item)          // Array/string contains
expect(value).toHaveLength(n)          // Array/string length
expect(value).toBeGreaterThan(n)       // > n
expect(value).toBeLessThan(n)          // < n
expect(value).toMatch(/regex/)         // Regex match
expect(value).toThrow()                // Throws error
expect(value).toHaveProperty('key')    // Has property
```

### Lifecycle Hooks

```typescript
beforeAll(() => { /* runs once before all tests */ })
afterAll(() => { /* runs once after all tests */ })
beforeEach(() => { /* runs before each test */ })
afterEach(() => { /* runs after each test */ })
```

### Async Testing

```typescript
// Async/await
it('should work async', async () => {
  const result = await asyncFunction();
  expect(result).toBe('value');
});

// Promises
it('should resolve promise', () => {
  return expect(promise).resolves.toBe('value');
});

// Timeout
it('should complete within timeout', async () => {
  await longRunningFunction();
}, 10000); // 10 second timeout
```

## Test Coverage

Generate coverage report:

```bash
# Run with coverage
bun test --coverage

# View HTML report
open coverage/index.html
```

Coverage output:
- `coverage/`: HTML report
- `coverage/coverage-final.json`: JSON report
- Terminal summary

## Best Practices

### 1. Test One Thing Per Test

```typescript
// ❌ Bad
it('should do multiple things', () => {
  expect(result.a).toBe(1);
  expect(result.b).toBe(2);
  expect(result.c).toBe(3);
});

// ✅ Good
it('should set property a', () => {
  expect(result.a).toBe(1);
});

it('should set property b', () => {
  expect(result.b).toBe(2);
});
```

### 2. Use Descriptive Test Names

```typescript
// ❌ Bad
it('test', () => {});

// ✅ Good
it('should return default value when setting not found', () => {});
```

### 3. Arrange-Act-Assert Pattern

```typescript
it('should calculate total', () => {
  // Arrange
  const items = [1, 2, 3];
  
  // Act
  const total = calculateTotal(items);
  
  // Assert
  expect(total).toBe(6);
});
```

### 4. Clean Up After Tests

```typescript
afterEach(() => {
  // Clean up mocks, timers, etc.
  mockRestore();
});
```

### 5. Test Edge Cases

```typescript
it('should handle empty array', () => {});
it('should handle null input', () => {});
it('should handle undefined input', () => {});
it('should handle large numbers', () => {});
```

## Running Tests in CI/CD

Add to your CI pipeline:

```yaml
# Example GitHub Actions
- name: Run Tests
  run: |
    bun install
    bun test --coverage
```

## Troubleshooting

### Tests Not Running

1. Check file extension: `*.test.ts`
2. Verify import: `import { describe, it, expect } from 'bun:test'`
3. Check test path pattern

### Import Errors

Use absolute paths with aliases:
```typescript
import { myModule } from '@/shared/utils';
```

### Async Test Timeout

Increase timeout:
```typescript
it('should complete', async () => {
  // test code
}, 30000); // 30 seconds
```

## Expanding the Test Suite

When adding new features, add tests for:

1. **Services**: Test business logic
2. **Stores**: Test state management
3. **Composables**: Test reusable logic
4. **Utils**: Test helper functions
5. **IPC Handlers**: Test cross-process communication
6. **Error Handling**: Test error scenarios

## Additional Resources

- [Bun Test Documentation](https://bun.sh/docs/api/test)
- [Bun Test Matchers](https://bun.sh/docs/api/expect)
- [Pinia Testing Guide](https://pinia.vuejs.org/cookbook/testing.html)
