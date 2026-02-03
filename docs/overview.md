# Electron + Vue + Rspack Starter - Overview

## Project Summary

This is a production-ready starter template for building high-performance cross-platform desktop applications. The template combines Electron's native capabilities, Vue 3's reactive framework, and Rspack's rapid bundling to accelerate your development workflow from prototype to production.

## Technology Stack

- **Electron**: Cross-platform desktop application framework
- **Vue 3**: Progressive JavaScript framework with Composition API
- **Rspack**: High-performance Rust-based bundler
- **TypeScript**: Type-safe development
- **Biome**: Fast JavaScript/TypeScript formatter and linter

## Key Benefits

- **Performance**: Rspack delivers significantly faster build times compared to traditional bundlers
- **Developer Experience**: Hot module replacement with millisecond response times
- **Architecture**: Clean separation between main and renderer processes
- **Cross-Platform**: Single codebase targets Windows, macOS, and Linux
- **Production Ready**: Includes automated packaging and distribution workflows

## Architecture Overview

### Process Separation
- **Main Process** (`src/main/`): Manages application lifecycle, native OS integration, and window management
- **Renderer Process** (`src/renderer/`): Vue.js application with component-based UI architecture
- **Communication**: Secure IPC channels for inter-process communication

### Project Structure
```
src/
├── main/          # Electron main process
│   ├── config/    # Application configuration
│   ├── services/  # Main process services (window management, database)
│   ├── use-cases/ # Main process business logic
│   └── main.ts    # Main entry point
├── renderer/      # Vue renderer process
│   ├── services/  # Renderer services (window components)
│   └── main.ts    # Renderer entry point
├── lib/           # Shared libraries
│   ├── backend/   # Backend utilities
│   ├── frontend/  # Frontend utilities
│   └── shared/    # Shared utilities
├── shared/        # Shared constants and utilities
├── assets/        # Static assets
├── index.html     # HTML template
├── index.css      # Global styles
└── reset.css      # CSS reset
```

## Quick Start Commands

- `npm run dev` - Start development server with HMR
- `npm run build` - Create production build
- `npm run package` - Package for distribution
- `npm run setup` - Initialize project dependencies
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Lint and format code