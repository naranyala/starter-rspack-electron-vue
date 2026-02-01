# Electron + Vue + Rspack Starter

A production-ready starter template for building high-performance cross-platform desktop applications. Combines the power of Electron, the reactivity of Vue 3, and the speed of Rspack to deliver an optimal development experience.

## Why This Template?

Building desktop applications should be straightforward. This starter eliminates configuration overhead and provides a battle-tested architecture that scales from prototypes to production applications.

### Performance First

Rspack delivers build times up to 10x faster than traditional bundlers. Hot module replacement responds in milliseconds. Development feedback loops stay tight, keeping you focused on building features rather than waiting for builds.

### Production Ready

Every architectural decision prioritizes maintainability and deployment. The modular structure separates concerns cleanly. Build scripts handle dependency management automatically. Packaging configurations work out of the box for Windows, macOS, and Linux.

## Key Features

**Modern Development Stack**
- Electron for native desktop capabilities
- Vue 3 Composition API for reactive UI development
- Rspack for rapid bundling and HMR
- TypeScript support for type safety

**Intelligent Build System**
- Automatic dependency detection and installation
- Smart port management with conflict resolution
- Parallel process orchestration for dev server
- Optimized production builds with tree shaking

**Clean Architecture**
- Use-case based module organization
- Clear separation between main and renderer processes
- Component-based window management system
- Shared utilities for common operations

**Cross-Platform Deployment**
- Single codebase targets all major platforms
- Automated packaging for distribution
- Platform-specific optimizations included
- Code signing preparation ready

## Quick Start

### Prerequisites

- Node.js 18 or later
- npm, yarn, or Bun package manager

### Installation

```bash
git clone <repository-url>
cd starter-rspack-electron-vue
npm install
```

### Development

```bash
npm run dev
```

The development server starts automatically, launches Electron, and provides hot module replacement.

### Production Build

```bash
npm run build
```

Creates an optimized production build ready for packaging.

### Packaging

```bash
npm run package
```

Generates distributable application packages for your current platform.

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

The application follows Electron's multi-process architecture:

**Main Process** (`src/main/`)
- Manages application lifecycle
- Handles native OS integration
- Controls window creation and management
- Executes privileged operations

**Renderer Process** (`src/renderer/`)
- Vue.js application entry point
- Component-based UI architecture
- Communicates with main process via IPC
- Sandboxed for security

### Window Management

Each window type follows a modular pattern:

```
use-cases/
├── frontend/                 # Renderer-side window components
└── backend/                  # Main process window controllers
```

This structure keeps window-specific logic encapsulated and maintainable.

### Build System

The build system handles complexity automatically:

1. **Dependency Management**: Detects missing packages and installs them
2. **Port Allocation**: Automatically finds available ports
3. **Process Coordination**: Manages dev server and Electron lifecycle
4. **Error Recovery**: Provides clear diagnostics when issues occur

## Development Workflow

### Starting Development

The dev script performs several operations automatically:

1. Validates all required dependencies
2. Allocates an available port
3. Starts the Rspack dev server
4. Launches Electron with the dev server URL
5. Sets up process cleanup on exit

```bash
npm run dev
```

### Code Quality

```bash
# Type checking
npm run type-check

# Linting
npm run lint

# Code formatting
npm run format

# Check for outdated dependencies
npm run deps:latest
```

### Building for Production

The build process creates optimized assets:

```bash
npm run build
```

Output goes to the `dist/` directory with minified and tree-shaken code.

### Packaging Applications

Create distributable packages for end users:

```bash
npm run package
```

Supported formats:
- Windows: MSI installer, portable executable
- macOS: DMG disk image, ZIP archive
- Linux: AppImage, DEB package, RPM package

## Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Build environment | `development` |
| `PORT` | Dev server port | Auto-assigned |
| `USE_BUN` | Prefer Bun over npm | `false` |

### Rspack Configuration

Build configuration lives in `rspack.config.cjs`:

- Entry points for main and renderer processes
- Module resolution and aliases
- Development and production optimizations
- Asset handling and processing

## Deployment

### Local Distribution

For immediate distribution to users:

```bash
npm run package
```

Outputs platform-specific packages to `dist/` directory.

### CI/CD Integration

The build scripts work seamlessly in CI environments:

```yaml
# Example GitHub Actions
- name: Build Application
  run: |
    npm install
    npm run build
    npm run package
```

### Code Signing

Prepare for distribution signing:

1. Configure signing certificates in `package.json`
2. Set environment variables for certificate paths
3. Run packaging with signing enabled

## Technical Specifications

### Supported Platforms

- **Windows**: Windows 10 and later
- **macOS**: macOS 10.14 (Mojave) and later
- **Linux**: Most modern distributions

### System Requirements

**Development**
- 4GB RAM minimum (8GB recommended)
- 2GB free disk space
- Internet connection for dependency installation

**Production Applications**
- 2GB RAM minimum
- 500MB disk space
- No runtime dependencies required

### Browser Support

The bundled Chromium version in Electron provides:
- Full ES2022 support
- Modern CSS features
- WebGL and hardware acceleration
- Native module support via Node.js integration

## Customization

### Adding New Windows

1. Create a window component in `src/renderer/services/`
2. Implement the main process controller
3. Register the window in the factory

### Modifying Build Behavior

Build scripts use a modular utility system:

- `scripts/utils/logger.ts`: Structured logging
- `scripts/utils/index.ts`: Common operations

Extend these utilities to add custom build steps.

### Theming

The application includes a comprehensive dark theme. Modify CSS variables in the component styles to customize the appearance.

## Troubleshooting

### Port Conflicts

If the default port is unavailable, the dev server automatically finds an alternative. Check the console output for the assigned port.

### Dependency Issues

The setup script automatically installs missing dependencies. Run:

```bash
npm run setup
```

### Build Failures

Clear build artifacts and retry:

```bash
npm run clean
npm run build
```

## Contributing

Contributions improve the template for everyone:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/description`
3. Commit your changes: `git commit -am 'Add feature'`
4. Push to the branch: `git push origin feature/description`
5. Submit a pull request

Please ensure:
- Code passes type checking
- Linting rules are satisfied
- Commit messages are descriptive

## License

MIT License - See [LICENSE](LICENSE) for complete details.

## Support

For issues, questions, or contributions:

- Open an issue in the repository
- Review existing discussions for solutions
- Submit pull requests for improvements

---

Built with precision for developers who value performance, maintainability, and clean architecture.
