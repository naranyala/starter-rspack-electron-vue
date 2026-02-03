# Testing

This project uses [Bun Test](https://bun.sh/docs/test/writing) for its fast and simple testing capabilities.

## Test Scripts

| Command | Description |
|---|---|
| `npm run test` | Run all tests in watch mode. |
| `npm run test:run` | Run all tests once. |
| `npm run test:ui` | Run tests with the Bun Test UI. |
| `npm run test:coverage` | Generate a test coverage report. |
| `npm run test:security` | Run the security-focused test suite. |

## Test Structure

Tests are organized into two main categories within the `test/` directory:

```
test/
├── unit/
│   ├── shared-utils.test.ts
│   ├── backend-utils.test.ts
│   └── frontend-utils.test.ts
└── security/
    ├── dependency-health.test.ts
    ├── dependency-security.test.ts
    ├── electron-security.test.ts
    ├── general-security.test.ts
    └── vue-security.test.ts
```

- **Unit Tests**: Focus on testing individual functions and components in isolation.
- **Security Tests**: A suite of tests designed to identify potential security vulnerabilities.

## Unit Testing

Unit tests are located in the `test/unit/` directory and cover the shared, backend, and frontend utilities. They ensure that the core logic of the application is working as expected.

To run only the unit tests:
```bash
bun test test/unit/
```

## Security Testing

The project includes a comprehensive security testing suite that checks for common vulnerabilities and misconfigurations. These tests are located in the `test/security/` directory.

### Running Security Tests

To run the security test suite, use the following command:

```bash
npm run test:security
```

This will execute all tests in the `test/security/` directory.

### Security Test Categories

The security test suite covers the following areas:

- **Dependency Health**: Checks for outdated dependencies and dependencies with known vulnerabilities (`dependency-health.test.ts`).
- **Dependency Security**: Analyzes `package.json` for insecure configurations, such as `git` dependencies (`dependency-security.test.ts`).
- **Electron Security**: Scans the Electron main process configuration for common security misconfigurations (`electron-security.test.ts`).
- **General Security**: Checks for general security issues, such as the presence of a `.gitignore` file and the absence of hardcoded secrets (`general-security.test.ts`).
- **Vue Security**: Includes tests for Vue-specific security best practices (`vue-security.test.ts`).

In addition to the tests, the security-focused build pipeline (`scripts/security-build.ts`) integrates these checks and more into the build process, providing an extra layer of security.