# Development Workflow

## Getting Started

### Prerequisites
- Node.js version 18 or later
- npm, yarn, or Bun package manager

### Initial Setup
1. Clone the repository
2. Install dependencies: `npm install` or `bun install`
3. Run setup script: `npm run setup`

## Development Commands

### Core Development
- `npm run dev` - Start development server with hot module replacement
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Lint and format code with Biome
- `npm run format` - Format code with Biome

### Build and Deployment
- `npm run build` - Create optimized production build
- `npm run package` - Generate distributable application packages
- `npm run clean` - Clean build artifacts

### Utility Commands
- `npm run deps:latest` - Check for outdated dependencies
- `npm run setup` - Initialize or reinstall project dependencies

## Development Process

### 1. Starting Development
The development script performs these operations automatically:
1. Validates all required dependencies are present
2. Allocates an available network port for the dev server
3. Starts the Rspack development server with hot module replacement
4. Launches Electron pointing to the dev server URL
5. Configures automatic process cleanup on application exit

### 2. Code Quality
Maintain code quality with integrated tooling:
- **Type Checking**: `npm run type-check` - Ensures type safety across the codebase
- **Linting**: `npm run lint` - Enforces consistent code style
- **Formatting**: `npm run format` - Formats code with Prettier-like rules
- **Dependency Checks**: `npm run deps:latest` - Identifies outdated packages

### 3. Testing Changes
During development:
- Changes to Vue components trigger hot module replacement
- TypeScript files are type-checked in real-time
- CSS changes are applied instantly without page reload
- Console errors show detailed stack traces for debugging

## Adding New Features

### Creating New Windows
1. Create window components in `src/frontend/services/`
2. Implement corresponding backend process controllers in `src/backend/use-cases/`
3. Register the window in the window factory system
4. Define IPC handlers for communication

### Leveraging Enhanced Utilities
The project includes comprehensive utility libraries for both backend and frontend:

#### Backend Utilities (`src/backend/lib/utils-enhanced/`)
- **CryptoUtils**: Encryption, hashing, and secure operations
- **FileSystemUtils**: File operations with error handling and search capabilities
- **JsonUtils**: JSON parsing and manipulation with validation
- **LogUtils**: Colored logging with performance tracking
- **PathUtils**: Path manipulation and normalization
- **EnvUtils**: Environment variable management with pattern matching
- **Shared Utilities**: Object manipulation, string processing, validation, and arrays

#### Frontend Utilities (`src/frontend/lib/utils-enhanced/`)
- **MathUtils**: Mathematical operations, geometry calculations, and number theory
- **ColorUtils**: Color conversions, blending, and manipulation
- **DateUtils**: Date formatting, time calculations, and calendar operations
- **NumberUtils**: Number formatting, currency conversion, and byte operations
- **StorageUtils**: Enhanced local/session storage with quota management
- **Shared Utilities**: Object manipulation, string processing, validation, and arrays

#### Shared Utilities (`src/shared/utils/`)
- **ObjectUtils**: Deep cloning, merging, and property manipulation
- **StringUtils**: String manipulation, formatting, and validation
- **ValidationUtils**: Comprehensive validation for emails, URLs, IPs, and more
- **ArrayUtils**: Advanced array operations, grouping, and manipulation
- **CacheUtils**: Memory-based caching with TTL and cleanup
- **AsyncUtils**: Enhanced async operations with debounce, throttle, retry, and circuit breaker

### Extending Functionality
- Add new utilities to appropriate `lib/` directories
- Create new services in respective process directories
- Use IPC channels for cross-process communication
- Follow existing patterns for consistency

## Build Process

### Development Build
- Enables hot module replacement
- Includes source maps for debugging
- Disables code minification
- Optimizes for fast rebuild times

### Production Build
- Applies tree shaking to remove unused code
- Minifies JavaScript and CSS
- Optimizes asset sizes
- Generates production-ready bundles

## Debugging

### Common Issues
- **Port Conflicts**: Server automatically finds alternative ports
- **Dependency Issues**: Run `npm run setup` to reinstall dependencies
- **Build Failures**: Clear cache with `npm run clean` then rebuild

### Debugging Tools
- Chrome DevTools for renderer process debugging
- Console logging for main process debugging
- IPC channel monitoring for communication debugging
- Vue DevTools for component inspection