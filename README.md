# Electron + Vue + Rspack Starter

A production-ready starter template for building high-performance cross-platform desktop applications. This template combines Electron's native capabilities, Vue 3's reactive framework, and Rspack's rapid bundling to accelerate your development workflow from prototype to production.

## Why This Template?

This starter eliminates configuration overhead and provides a proven architecture that scales with your application. Whether you are building internal tools or commercial software, this template provides the foundation for shipping quality desktop applications faster.

### Performance That Matters

Rspack delivers build times significantly faster than traditional bundlers. Hot module replacement responds in milliseconds, keeping development cycles tight and productive. Spend less time waiting for builds and more time building features that matter.

### Production-Ready Architecture

Every decision prioritizes maintainability and deployment readiness. The modular structure cleanly separates concerns. Automated build scripts handle dependency management. Packaging configurations work immediately for Windows, macOS, and Linux distributions.

## Key Features

**Modern Technology Stack**

- Electron for native desktop application capabilities
- Vue 3 Composition API for reactive user interface development
- Rspack for high-performance bundling and hot module replacement
- TypeScript for comprehensive type safety across the codebase

**Intelligent Build System**

- Automatic dependency detection and installation
- Smart port management with automatic conflict resolution
- Parallel process orchestration for efficient development server operation
- Optimized production builds with tree shaking and minification

**Clean Architectural Design**

- Use-case based module organization for maintainability
- Clear separation between main and renderer processes
- Component-based window management system
- Shared utilities for consistent operations across processes

**Cross-Platform Deployment**

- Single codebase targets Windows, macOS, and Linux
- Automated packaging for immediate distribution
- Platform-specific optimizations included by default
- Code signing preparation for commercial distribution

## Quick Start

### Prerequisites

- Node.js version 18 or later
- npm, yarn, or Bun package manager

### Installation

Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd starter-rspack-electron-vue
npm install
```

### Development

Start the development environment:

```bash
npm run dev
```

The development server launches automatically, starts Electron, and provides hot module replacement for rapid iteration.

### Production Build

Create an optimized production build:

```bash
npm run build
```

This generates optimized assets ready for packaging and distribution.

### Packaging

Generate distributable application packages:

```bash
npm run package
```

Creates platform-specific installers and executables for your target operating system.

## Project Structure

```
src/
├── main/                      # Electron main process
│   ├── services/             # Main process services
│   └── lib/                  # Shared utilities
├── renderer/                  # Vue renderer process
│   ├── components/           # Vue components
│   ├── services/             # Renderer services
│   ├── styles/               # Application styles
│   └── lib/                  # Renderer utilities
├── shared/                    # Shared between processes
│   └── constants.ts          # Shared constants
└── assets/                    # Static assets

scripts/                       # Build automation
├── dev.ts                    # Development server
├── build.ts                  # Production build
├── setup.ts                  # Project setup
├── icons.ts                  # Asset management
├── clean.ts                  # Build cleanup
└── utils/                    # Shared build utilities
    ├── logger.ts            # Structured logging
    └── index.ts             # Common utilities
```

## Architecture

### Process Separation

The application follows Electron's multi-process architecture for security and performance:

**Main Process** (`src/main/`)

- Manages application lifecycle and startup
- Handles native operating system integration
- Controls window creation and management
- Executes privileged system operations

**Renderer Process** (`src/renderer/`)

- Vue.js application entry point and routing
- Component-based user interface architecture
- Communicates with main process via IPC channels
- Runs in sandboxed environment for security

### Window Management

Each window type follows a modular, maintainable pattern:

```
use-cases/
├── frontend/                 # Renderer-side window components
└── backend/                  # Main process window controllers
```

This structure encapsulates window-specific logic and keeps the codebase organized and scalable.

### Build System

The build system automates complexity so you can focus on application development:

1. **Dependency Management**: Automatically detects and installs missing packages
2. **Port Allocation**: Finds and assigns available network ports automatically
3. **Process Coordination**: Manages development server and Electron lifecycle
4. **Error Recovery**: Provides clear diagnostic messages when issues occur

## Development Workflow

### Starting Development

The development script performs setup operations automatically:

1. Validates all required dependencies are present
2. Allocates an available network port for the dev server
3. Starts the Rspack development server with hot module replacement
4. Launches Electron pointing to the dev server URL
5. Configures automatic process cleanup on application exit

```bash
npm run dev
```

### Code Quality Tools

Maintain code quality with integrated tooling:

```bash
# Type checking across the codebase
npm run type-check

# Linting for code style consistency
npm run lint

# Code formatting with Prettier
npm run format

# Check for outdated dependencies
npm run deps:latest
```

### Building for Production

The production build creates fully optimized assets:

```bash
npm run build
```

Output is written to the `dist/` directory with minified code, tree shaking applied, and assets optimized for distribution.

### Packaging Applications

Create distributable packages for end users:

```bash
npm run package
```

Supported output formats:

- **Windows**: MSI installer, portable executable
- **macOS**: DMG disk image, ZIP archive
- **Linux**: AppImage, DEB package, RPM package

## Configuration

### Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `NODE_ENV` | Build environment mode | `development` |
| `PORT` | Development server port | Auto-assigned |
| `USE_BUN` | Prefer Bun over npm | `false` |

### Rspack Configuration

Build configuration is defined in `rspack.config.cjs`:

- Entry points for main and renderer processes
- Module resolution rules and path aliases
- Development and production optimization settings
- Asset handling and processing pipelines

## Deployment

### Local Distribution

For immediate distribution to users or testers:

```bash
npm run package
```

Outputs platform-specific packages to the `dist/` directory.

### CI/CD Integration

The build scripts integrate seamlessly with continuous integration environments:

```yaml
# Example GitHub Actions workflow
- name: Build Application
  run: |
    npm install
    npm run build
    npm run package
```

### Code Signing

Prepare applications for signed distribution:

1. Configure signing certificates in `package.json`
2. Set environment variables pointing to certificate files
3. Execute packaging with signing enabled

## Technical Specifications

### Supported Platforms

- **Windows**: Windows 10 and later versions
- **macOS**: macOS 10.14 (Mojave) and later versions
- **Linux**: Most modern distributions with standard libraries

### System Requirements

**Development Environment**

- 4GB RAM minimum (8GB recommended for optimal performance)
- 2GB free disk space for dependencies and builds
- Internet connection for package installation

**Production Applications**

- 2GB RAM minimum for smooth operation
- 500MB disk space for application installation
- No additional runtime dependencies required

### Browser Engine Support

The bundled Chromium version in Electron provides:

- Full ES2022 JavaScript support
- Modern CSS features and specifications
- WebGL and hardware-accelerated graphics
- Native module support via Node.js integration

## Customization

### Adding New Windows

Extend the application with additional windows:

1. Create window components in `src/renderer/services/`
2. Implement corresponding main process controllers
3. Register the window in the window factory

### Modifying Build Behavior

Build scripts use a modular utility system for extensibility:

- `scripts/utils/logger.ts`: Structured logging with configurable output
- `scripts/utils/index.ts`: Common build operations and helpers

Extend these utilities to add custom build steps or modify existing behavior.

### Theming and Styling

The application includes a comprehensive default theme. Customize the appearance by modifying CSS variables in component styles or adding global theme overrides.

## Troubleshooting

### Port Conflicts

If the default development port is unavailable, the server automatically locates an alternative. Check the console output to identify the assigned port number.

### Dependency Resolution

The setup script automatically installs missing dependencies. If you encounter issues, run:

```bash
npm run setup
```

### Build Failures

Clear build artifacts and rebuild from a clean state:

```bash
npm run clean
npm run build
```

## Contributing

Contributions improve this template for the entire community:

1. Fork the repository to your account
2. Create a feature branch: `git checkout -b feature/description`
3. Commit your changes with descriptive messages
4. Push to your branch: `git push origin feature/description`
5. Open a pull request for review

Please ensure all contributions:
- Pass type checking without errors
- Satisfy linting rules
- Include descriptive commit messages
- Maintain backward compatibility where possible

## License

MIT License - See [LICENSE](LICENSE) for complete terms and conditions.

## Support and Community

For technical issues, feature requests, or general questions:

- Open an issue in the GitHub repository
- Review existing discussions for known solutions
- Submit pull requests with improvements or fixes

---

Built for developers who prioritize performance, maintainability, and clean architecture in their desktop applications.
