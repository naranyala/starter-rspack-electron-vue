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
├── backend/              # Electron main process (Backend)
│   ├── lib/              # Backend utilities and helpers
│   │   ├── utils-enhanced/ # Enhanced backend utility functions
│   │   │   ├── index.ts  # Comprehensive backend utilities
│   │   │   └── ...       # Individual utility modules
│   │   └── index.ts      # Backend utility exports
│   ├── use-cases/        # Backend business logic and IPC handlers
│   │   ├── base-use-case.ts # Base use case class
│   │   └── *.ts          # Specific use cases
│   ├── config/           # Application configuration
│   ├── ipc/              # IPC handlers (if separate from use-cases)
│   ├── services/         # Backend services (database, window management, etc.)
│   ├── main.ts           # Main process entry point
│   └── preload.ts        # Preload script (IPC bridge)
├── frontend/             # Vue renderer process (Frontend)
│   ├── lib/              # Frontend utilities
│   │   ├── api.ts        # API utilities
│   │   ├── dom.ts        # DOM manipulation utilities
│   │   ├── events.ts     # Event utilities
│   │   ├── utils-enhanced/ # Enhanced frontend utility functions
│   │   │   ├── index.ts  # Comprehensive frontend utilities
│   │   │   └── ...       # Individual utility modules
│   │   ├── async.ts      # Async utilities (enhanced)
│   │   └── index.ts      # Frontend utility exports
│   ├── use-cases/        # Frontend business logic (UI components, window services)
│   │   └── index.ts      # Frontend use case exports
│   ├── components/       # Vue components
│   ├── composables/      # Vue composables
│   ├── services/         # Frontend services (window services, etc.)
│   ├── stores/           # State management (Pinia/Vuex)
│   ├── views/            # View components
│   └── main.ts           # Frontend entry point
├── shared/               # Shared between backend and frontend
│   ├── constants.ts      # Shared constants
│   ├── types.ts          # Shared types/interfaces
│   └── utils/            # Shared utility functions
│       ├── types.ts      # Shared type definitions
│       ├── object.ts     # Object manipulation utilities
│       ├── string.ts     # String manipulation utilities
│       ├── validation.ts # Validation utilities
│       ├── array.ts      # Array manipulation utilities
│       ├── cache.ts      # Caching utilities
│       ├── async.ts      # Async utilities
│       └── index.ts      # Shared utility exports
├── assets/               # Static assets (images, icons, etc.)
├── index.html            # HTML template
├── index.css             # Global styles
└── reset.css             # CSS reset
```

## Quick Start Commands

- `npm run dev` - Start development server with HMR
- `npm run build` - Create production build
- `npm run package` - Package for distribution
- `npm run setup` - Initialize project dependencies
- `npm run type-check` - Run TypeScript type checking
- `npm run lint` - Lint and format code