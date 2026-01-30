# Electron + Vue + Rspack Starter Template

A production-ready starter template for building cross-platform desktop applications using Electron, Vue.js, and Rspack. This template provides a modern development environment with optimized build configurations and modular architecture patterns.

## Features

- **Modern Tech Stack**: Built with Electron, Vue 3, and Rspack for optimal performance
- **Modular Architecture**: Clean separation of concerns with use-case based modules
- **Cross-Platform**: Develop once, deploy to Windows, macOS, and Linux
- **Hot Module Replacement**: Real-time updates during development
- **TypeScript Support**: Optional type safety for better code quality
- **Production Ready**: Optimized builds and packaging configurations
- **Modular Window Management**: Component-based window creation system

## Prerequisites

- Node.js 18+ or Bun
- npm, yarn, or bun package manager

## Quick Start

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd starter-rspack-electron-vue

# Install dependencies
npm install
# or
bun install
```

### Development

```bash
# Start development server
npm run dev
# or
bun run dev

# Alternative development commands
npm run dev:legacy        # Legacy development mode
npm run rspack-dev        # Direct Rspack development server
```

### Production Build

```bash
# Build the application
npm run build
# or
bun run build

# Build legacy version
npm run build:legacy
```

### Packaging

```bash
# Package for distribution
npm run package
# or
bun run package

# Alternative packaging commands
npm run dist              # Distribution build
npm run electron-pack     # Electron-specific packaging
npm run electron-dist     # Full distribution build
```

### Additional Scripts

```bash
# Setup project dependencies
npm run setup

# Type checking
npm run type-check

# Linting and formatting
npm run lint
npm run format

# Check for latest dependencies
npm run deps:latest
```

## Project Structure

```
src/
├── main/                 # Electron main process
│   ├── lib/              # Main process utilities
│   └── use-cases/        # Main process use cases
├── renderer/             # Vue renderer process
│   ├── components/       # Vue components
│   ├── lib/              # Renderer utilities
│   ├── styles/           # Global styles
│   ├── use-cases/        # Window component modules
│   └── App.vue           # Main application component
├── assets/               # Static assets
├── index.html            # Main HTML template
└── reset.css             # CSS reset
scripts/                  # Build and development scripts
├── dev.js                # Unified development script
├── build.js              # Build utilities
└── setup-project.js      # Project setup utilities
```

## Architecture Overview

### Modular Window System

The template implements a modular window management system where each window type is encapsulated in its own module:

- **Frontend**: Located in `src/renderer/use-cases/`
- **Backend**: Located in `src/main/use-cases/`
- Each window component follows a consistent interface for creation and management

### Use Case Pattern

The application follows a use case pattern for organizing functionality:

- **Main Process**: IPC handlers organized by use cases
- **Renderer Process**: Component-based window creation
- **Clean Separation**: Business logic separated from UI concerns

## Configuration

### Environment Variables

- `NODE_ENV`: Controls development vs production builds
- `PORT`: Development server port (defaults to random available port)

### Build Configuration

The project uses Rspack for bundling with optimized configurations for both development and production. See `rspack.config.cjs` for detailed configuration.

## Deployment

### Packaging Options

The template supports multiple packaging formats:
- AppImage (Linux)
- DMG/ZIP (macOS)
- MSI/NSIS (Windows)

### Distribution

Execute `npm run package` to create distributable application packages for all supported platforms.

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

For support, please open an issue in the repository or contact the maintainers.

---

Built with modern web technologies for optimal desktop application development.
```