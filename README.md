# Starter Electron Vue Rspack

A modern, production-ready starter template for building Electron desktop applications with Vue.js 3, Rspack bundler, and WinBox.js for window management.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [Building and Packaging](#building-and-packaging)
- [Testing](#testing)
- [Architecture](#architecture)
- [Key Components](#key-components)
- [Potential Improvements](#potential-improvements)
- [Documentation](#documentation)
- [License](#license)

## Features

- Electron 40+ with secure defaults (context isolation, sandbox enabled)
- Vue.js 3 with Composition API and script setup syntax
- Rspack for fast builds (Rust-based webpack alternative)
- WinBox.js for native-like window management
- Pinia for state management
- TypeScript support throughout the codebase
- Dependency injection container with circular dependency detection
- Type-safe event bus system for cross-process communication
- Comprehensive error handling and logging
- Zod-based runtime validation
- Security-focused test suite
- Bun runtime support for faster development

## Tech Stack

| Category | Technology |
|----------|------------|
| Runtime | Electron 40+ |
| Frontend Framework | Vue.js 3.5+ |
| State Management | Pinia 3+ |
| Window Management | WinBox.js 0.2+ |
| Bundler | Rspack 1.7+ |
| Language | TypeScript 5.9+ |
| Runtime Alternative | Bun 1.3+ |
| Validation | Zod 3+ |
| Linting/Formatting | Biome 2+ |
| Testing | Bun Test |

## Project Structure

```
starter-electron-vue-rspack/
├── src/
│   ├── backend/                    # Electron Main Process
│   │   ├── config/                 # Application configuration
│   │   │   ├── app-config.ts       # App configuration defaults
│   │   │   ├── build-config.ts     # Build configuration
│   │   │   ├── env-config.ts       # Environment config loader
│   │   │   └── index.ts            # Config exports
│   │   ├── di/                     # Dependency Injection
│   │   │   ├── container.ts        # DI container implementation
│   │   │   ├── decorators.ts       # DI tokens and decorators
│   │   │   └── index.ts            # DI exports and helpers
│   │   ├── events/                 # Backend event bus
│   │   │   └── backend-event-bus.ts # Main process event bus
│   │   ├── ipc/                    # IPC Handlers
│   │   │   ├── base-ipc-handler.ts # Base class for IPC handlers
│   │   │   ├── app-handlers.ts     # App lifecycle handlers
│   │   │   ├── settings-handlers.ts# Settings management handlers
│   │   │   ├── window-handlers.ts  # Window control handlers
│   │   │   ├── dialog-handlers.ts  # Dialog handlers
│   │   │   ├── ipc-registry.ts     # IPC handler registry
│   │   │   └── index.ts            # IPC module exports
│   │   ├── lib/                    # Backend utilities
│   │   │   ├── utils/              # Basic utilities
│   │   │   ├── utils-enhanced/     # Enhanced utilities
│   │   │   ├── electron.ts         # Electron-specific utilities
│   │   │   └── index.ts            # Lib exports
│   │   ├── services/               # Backend services
│   │   │   ├── window-manager.ts   # Window management service
│   │   │   ├── database.ts         # Data store and settings
│   │   │   └── index.ts            # Services exports
│   │   ├── use-cases/              # Business logic use cases
│   │   │   ├── base-use-case.ts    # Base use case class
│   │   │   └── *.ts                # Specific use cases
│   │   ├── main.ts                 # Main process entry point
│   │   └── preload.ts              # Preload script (IPC bridge)
│   │
│   ├── frontend/                   # Renderer Process
│   │   ├── components/             # Vue components
│   │   │   └── App.vue             # Root component
│   │   ├── composables/            # Vue 3 composables
│   │   │   ├── useElectron.ts      # Electron API composables
│   │   │   └── index.ts            # Composables exports
│   │   ├── events/                 # Frontend event bus
│   │   │   ├── frontend-event-bus.ts # Renderer event bus
│   │   │   ├── useEventBus.ts      # Vue event composables
│   │   │   └── index.ts            # Events exports
│   │   ├── lib/                    # Frontend utilities
│   │   │   ├── utils/              # Basic utilities
│   │   │   ├── utils-enhanced/     # Enhanced utilities
│   │   │   ├── api.ts              # HTTP client utilities
│   │   │   ├── dom.ts              # DOM manipulation
│   │   │   ├── events.ts           # Event utilities
│   │   │   ├── async.ts            # Async utilities
│   │   │   └── index.ts            # Lib exports
│   │   ├── services/               # Frontend services
│   │   │   ├── electron-api.ts     # Typed Electron API
│   │   │   ├── window-factory.ts   # WinBox window factory
│   │   │   └── index.ts            # Services exports
│   │   ├── stores/                 # Pinia state management
│   │   │   ├── plugins/            # Pinia plugins
│   │   │   │   └── pinia.ts        # Pinia instance
│   │   │   ├── app.ts              # App UI state store
│   │   │   ├── settings.ts         # Settings store
│   │   │   └── index.ts            # Stores exports
│   │   ├── styles/                 # CSS files
│   │   │   ├── global.css          # Global styles
│   │   │   └── App.css             # App-specific styles
│   │   ├── use-cases/              # Frontend use cases
│   │   ├── views/                  # Page/view components
│   │   │   └── HomeView.vue        # Main dashboard view
│   │   └── main.ts                 # Renderer entry point
│   │
│   ├── shared/                     # Shared code (backend + frontend)
│   │   ├── config/                 # Shared configuration
│   │   │   ├── app-config.ts       # App configuration
│   │   │   ├── build-config.ts     # Build configuration
│   │   │   ├── env-config.ts       # Environment config
│   │   │   └── index.ts            # Config exports
│   │   ├── constants/              # Shared constants
│   │   │   └── constants.ts        # Application constants
│   │   ├── di/                     # Shared DI base
│   │   │   ├── container.ts        # DI container core
│   │   │   ├── decorators.ts       # DI decorators
│   │   │   └── index.ts            # DI exports
│   │   ├── errors/                 # Error handling
│   │   │   ├── app-error.ts        # Base error classes
│   │   │   ├── error-handler.ts    # Global error handler
│   │   │   └── index.ts            # Error exports
│   │   ├── events/                 # Event bus system
│   │   │   ├── event-bus.ts        # Core event bus
│   │   │   ├── event-types.ts      # Event type definitions
│   │   │   └── index.ts            # Events exports
│   │   ├── logger/                 # Logging abstraction
│   │   │   ├── logger.ts           # Logger implementation
│   │   │   └── index.ts            # Logger exports
│   │   ├── types/                  # Shared TypeScript types
│   │   ├── utils/                  # Shared utilities
│   │   │   └── utils.ts            # Common utilities
│   │   ├── validation/             # Validation utilities
│   │   │   ├── zod.ts              # Zod validation schemas
│   │   │   └── index.ts            # Validation exports
│   │   ├── constants.ts            # Common constants
│   │   └── utils.ts                # Common utilities
│   │
│   ├── assets/                     # Static assets
│   │   └── icons/                  # Application icons
│   ├── index.html                  # HTML template
│   ├── reset.css                   # CSS reset
│   └── index.css                   # Global styles
│
├── test/
│   ├── unit/                       # Unit tests
│   │   ├── backend/                # Backend unit tests
│   │   ├── frontend/               # Frontend unit tests
│   │   └── shared/                 # Shared code tests
│   │       ├── di/                 # DI tests
│   │       ├── errors.test.ts      # Error handling tests
│   │       ├── events/             # Event bus tests
│   │       ├── logger.test.ts      # Logger tests
│   │       └── validation.test.ts  # Validation tests
│   ├── integration/                # Integration tests
│   │   └── backend/                # Backend integration tests
│   └── security/                   # Security tests
│       ├── dependency-health.test.ts
│       ├── dependency-security.test.ts
│       ├── electron-security.test.ts
│       ├── general-security.test.ts
│       └── vue-security.test.ts
│
├── scripts/                        # Build and development scripts
│   ├── utils/                      # Script utilities
│   ├── build.ts                    # Build script
│   ├── clean.ts                    # Clean script
│   ├── dependency-scanner.ts       # Dependency scanner
│   ├── dev.ts                      # Development server script
│   ├── icons.ts                    # Icon generation script
│   ├── security-build.ts           # Security build checks
│   ├── security-package.ts         # Security package checks
│   └── setup.ts                    # Setup script
│
├── docs/                           # Documentation
│   ├── architecture.md             # Architecture documentation
│   ├── configuration.md            # Configuration guide
│   ├── deployment.md               # Deployment guide
│   ├── development.md              # Development guide
│   ├── EVENT_BUS.md                # Event bus documentation
│   ├── index.md                    # Documentation index
│   ├── overview.md                 # Project overview
│   ├── testing.md                  # Testing guide
│   ├── troubleshooting.md          # Troubleshooting guide
│   └── WINBOX_ROUTER.md            # WinBox as router guide
│
├── types/                          # TypeScript type definitions
│   └── electron-api.d.ts           # Electron API type definitions
│
├── dist/                           # Build output (generated)
├── node_modules/                   # Dependencies (generated)
│
├── .env.development                # Development environment variables
├── .env.production                 # Production environment variables
├── .env.example                    # Environment variables template
├── .gitignore                      # Git ignore rules
├── biome.json                      # Biome linting/formatting config
├── bun.lock                        # Bun lock file
├── main.cjs                        # Electron main entry (CJS wrapper)
├── package.json                    # Project dependencies and scripts
├── rspack.config.ts                # Rspack build configuration
├── STRUCTURE.md                    # Detailed structure documentation
├── tsconfig.json                   # TypeScript configuration
├── tsconfig.check.json             # TypeScript check configuration
└── README.md                       # This file
```

## Getting Started

### Prerequisites

- Node.js 18+ or Bun 1.0+
- npm, yarn, pnpm, or Bun

### Installation

```bash
# Clone the repository
git clone https://github.com/naranyala/starter-rspack-electron-vue.git
cd starter-rspack-electron-vue

# Install dependencies (using Bun)
bun install

# Or using npm
npm install
```

### Development

```bash
# Start development server
bun run dev

# Start with Rspack only
bun run dev:rspack
```

### Building

```bash
# Build for production
bun run build

# Build with Rspack only
bun run build:rspack
```

### Packaging

```bash
# Package the application
bun run package

# Or use electron-builder directly
bun run electron-pack
```

## Development

### Available Scripts

| Command | Description |
|---------|-------------|
| `bun run dev` | Start development server with Electron |
| `bun run dev:rspack` | Start Rspack dev server only |
| `bun run build` | Build application for production |
| `bun run build:rspack` | Build with Rspack only |
| `bun run package` | Package distributable application |
| `bun run start` | Start packaged application |
| `bun run test` | Run all tests |
| `bun run test:watch` | Run tests in watch mode |
| `bun run test:coverage` | Run tests with coverage |
| `bun run lint` | Run linter and fix issues |
| `bun run lint-check` | Run linter without fixing |
| `bun run format` | Format code |
| `bun run format-check` | Check code formatting |
| `bun run type-check` | Run TypeScript type check |
| `bun run setup` | Run project setup |

### Environment Variables

Copy `.env.example` to `.env.development` or `.env.production`:

```bash
NODE_ENV=development
PORT=1234
```

## Building and Packaging

### Build Configuration

The project uses electron-builder for packaging. Configuration is in `package.json`:

```json
{
  "build": {
    "appId": "com.some.electron.quickstart",
    "linux": {
      "target": ["AppImage", "deb"]
    },
    "win": {
      "target": "msi"
    }
  }
}
```

### Platform-specific Builds

```bash
# Build for Linux
bun run package --linux

# Build for Windows
bun run package --win

# Build for macOS
bun run package --mac
```

## Testing

### Run Tests

```bash
# All tests
bun test

# Unit tests only
bun test test/unit/

# Security tests only
bun run test:security

# With coverage
bun test --coverage

# Watch mode
bun test --watch
```

### Test Structure

- **Unit Tests**: Test individual modules and functions
- **Integration Tests**: Test module interactions
- **Security Tests**: Verify security best practices

## Architecture

### Main Process (Backend)

The Electron main process handles:
- Application lifecycle
- Window management
- IPC communication
- Native API access
- File system operations

### Renderer Process (Frontend)

The Vue.js renderer process handles:
- User interface
- User interactions
- Local state management
- Communication with main process via IPC

### Cross-Process Communication

The event bus system enables type-safe communication between processes:

```
Frontend Component
    |
    v
Frontend Event Bus
    |
    v
IPC Bridge (preload.ts)
    |
    v
Backend Event Bus
    |
    v
Backend Services
```

### Window Management with WinBox

WinBox.js provides native-like window management:
- Multiple independent windows
- Draggable and resizable
- Minimize/maximize support
- Custom styling and themes

## Key Components

### Dependency Injection

Custom DI container with:
- Singleton and transient scopes
- Circular dependency detection
- Lifecycle hooks (onInit, onDestroy)
- Token-based resolution

```typescript
// Register service
container.register(WINDOW_MANAGER_TOKEN, WindowManager, InjectionScope.Singleton);

// Resolve service
const windowManager = inject(WINDOW_MANAGER_TOKEN);
```

### Event Bus

Type-safe event system with:
- Typed events with payload validation
- Priority-based execution
- Event history tracking
- Cross-process communication
- Vue composables integration

```typescript
// Subscribe to event
const { on } = useEventBus();
on('settings:changed', (payload) => {
  console.log('Settings changed:', payload);
});

// Emit event
await emit('user:action', { action: 'save' });
```

### Error Handling

Hierarchical error system:
- AppError (base class)
- IpcError, ValidationError, ConfigError
- Global error handler
- Automatic error logging

### Logger

Structured logging with:
- Configurable log levels
- Prefix-based logging
- Timestamp support
- Payload sanitization

### Validation

Zod-based runtime validation:
- Type-safe schemas
- Automatic type inference
- IPC input validation
- Pre-built schemas for common types

## Potential Improvements

The following suggestions focus on project structure improvements for better modularity and scalability:

### Directory Organization

1. Feature-based organization for large applications
   - Current structure organizes by type (services/, ipc/, stores/)
   - Consider organizing by feature for applications with 10+ features
   - Example: src/backend/features/window-management/, src/frontend/features/settings/

2. Separate API layer
   - Create dedicated API client module
   - Separate HTTP utilities from Electron IPC
   - Add API versioning support

3. Component library structure
   - Create src/frontend/components/base/ for reusable UI components
   - Create src/frontend/components/layout/ for layout components
   - Create src/frontend/components/feature/ for feature-specific components

### Module Separation

4. Extract shared types to dedicated package
   - Move src/shared/types/ to separate @types package
   - Enables type sharing across multiple projects
   - Better version control for type definitions

5. Separate configuration module
   - Extract src/shared/config/ to dedicated module
   - Support runtime configuration loading
   - Add configuration validation

6. Extract logger to standalone package
   - Enable logger reuse in other projects
   - Add transport support (file, console, remote)
   - Support log aggregation

### Testing Structure

7. Add E2E testing directory
   - Create test/e2e/ for end-to-end tests
   - Add Playwright or Spectron for Electron E2E testing
   - Include visual regression tests

8. Add test fixtures directory
   - Create test/fixtures/ for test data
   - Add mock data generators
   - Include test utilities

9. Separate integration test categories
   - Create test/integration/ipc/ for IPC tests
   - Create test/integration/window/ for window tests
   - Create test/integration/settings/ for settings tests

### Build and Tooling

10. Separate build configurations
    - Create configs/ directory for build configs
    - Separate webpack, rspack, and electron-builder configs
    - Add environment-specific configurations

11. Add migrations directory
    - Create migrations/ for database migrations
    - Support schema versioning
    - Add migration runner script

12. Add seeds directory
    - Create seeds/ for database seed data
    - Support development data seeding
    - Add seed runner script

### Documentation Structure

13. API documentation
    - Add docs/api/ for API documentation
    - Generate from TypeScript types
    - Include IPC channel documentation

14. Architecture decision records
    - Add docs/adr/ for architecture decisions
    - Document key architectural choices
    - Track decision history

15. Change log structure
    - Add CHANGELOG.md with conventional commits
    - Document breaking changes
    - Include migration guides

### Scalability Considerations

16. Plugin architecture
    - Create src/plugins/ for extensibility
    - Define plugin interface
    - Add plugin loading mechanism

17. Module federation
    - Consider Rspack module federation for large apps
    - Enable lazy loading of features
    - Support micro-frontend architecture

18. Monorepo preparation
    - Structure for potential monorepo conversion
    - Separate packages into packages/ directory
    - Add workspace configuration

## Documentation

Additional documentation is available in the docs/ directory:

- [Architecture](./docs/architecture.md) - System architecture details
- [Configuration](./docs/configuration.md) - Configuration guide
- [Development](./docs/development.md) - Development workflow
- [Event Bus](./docs/EVENT_BUS.md) - Event bus system documentation
- [Testing](./docs/testing.md) - Testing guide
- [Troubleshooting](./docs/troubleshooting.md) - Common issues and solutions
- [WinBox Router](./docs/WINBOX_ROUTER.md) - WinBox window management guide
- [Project Structure](./STRUCTURE.md) - Detailed structure documentation

## License

MIT License - see [LICENSE](./LICENSE) for details.

## Contributing

See [CONTRIBUTING.md](./CONTRIBUTING.md) for contribution guidelines.
