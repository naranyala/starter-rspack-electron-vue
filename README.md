# Electron + Vue + Rspack Starter

<div align="center">

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Vue Version](https://img.shields.io/badge/Vue-3.x-brightgreen.svg)](https://vuejs.org/)
[![Electron Version](https://img.shields.io/badge/Electron-40.x-blue.svg)](https://www.electronjs.org/)
[![Rspack](https://img.shields.io/badge/Rspack-1.x-orange.svg)](https://www.rspack.dev/)

**Production-Ready Desktop Application Template**
*The fastest way to build cross-platform desktop apps with modern web technologies*

</div>

## Why Choose This Template?

This starter template eliminates the complexity of configuring Electron, Vue, and bundling tools from scratch. Built for developers who value **performance**, **maintainability**, and **developer experience**, it provides a battle-tested foundation for shipping high-quality desktop applications faster.

### Lightning-Fast Development
- **Rspack-powered builds**: 10x faster than traditional bundlers
- **Hot Module Replacement**: Changes reflect instantly during development
- **Optimized TypeScript**: Full type safety with minimal configuration

### Enterprise-Grade Architecture
- **Clean separation**: Main and renderer processes properly isolated
- **Modular design**: Component-based architecture with reusable utilities
- **Secure IPC**: Safe communication between processes with validation

### True Cross-Platform
- **Single codebase**: Deploy to Windows, macOS, and Linux
- **Native feel**: Access to OS-specific features and integrations
- **Consistent UX**: Same experience across all platforms

## Quick Start

### Prerequisites
- Node.js v18 or later
- npm, yarn, or Bun package manager

### Installation
```bash
# Clone the repository
git clone <repository-url>
cd starter-rspack-electron-vue

# Install dependencies
npm install
# or
bun install

# Initialize the project
npm run setup
```

### Development
```bash
# Start development server with HMR
npm run dev
```

### Production
```bash
# Build for production
npm run build

# Package for distribution
npm run package
```

## Technology Stack

| Technology | Purpose | Benefits |
|------------|---------|----------|
| [Electron](https://www.electronjs.org/) | Cross-platform desktop framework | Native app capabilities, extensive API |
| [Vue 3](https://vuejs.org/) | Reactive UI framework | Component-based, Composition API |
| [Rspack](https://www.rspack.dev/) | High-performance bundler | 10x faster builds than Webpack |
| [TypeScript](https://www.typescriptlang.org/) | Type-safe development | Catch errors early, better IDE support |
| [Biome](https://biomejs.dev/) | Fast formatter/linter | Consistent code style, lightning fast |

## Features

### Performance Optimized
- **Blazing fast builds**: Rspack delivers sub-second rebuilds
- **Efficient bundling**: Tree-shaking removes dead code
- **Smart caching**: Incremental builds for rapid iteration

### Developer Experience
- **Hot Module Replacement**: Instant updates without refresh
- **Rich debugging**: Full Chrome DevTools and Vue DevTools support
- **Type safety**: Comprehensive TypeScript coverage
- **Code quality**: Integrated linting and formatting

### Enhanced Utility Libraries
- **Backend Utilities**: Comprehensive file system, crypto, logging, and environment management
- **Frontend Utilities**: Advanced math, color, date, number, and storage operations
- **Shared Utilities**: Object manipulation, string processing, validation, caching, and async operations
- **10x Development Speed**: Pre-built functions for common operations

### Security Focused
- **Context isolation**: Secure renderer processes
- **Restricted IPC**: Limited, validated communication channels
- **Node integration disabled**: Safer by default
- **Input sanitization**: Built-in protection patterns

### Production Ready
- **Auto-updates**: Built-in update mechanism
- **Packaging**: One-command distribution builds
- **Code signing**: Ready for app store submission
- **Analytics ready**: Easy integration with monitoring tools

## Project Structure

```
src/
├── backend/              # Electron main process (Backend)
│   ├── lib/              # Backend utilities and helpers
│   │   ├── utils/        # Backend utility functions
│   │   └── index.ts      # Backend utility exports
│   ├── use-cases/        # Backend business logic and IPC handlers
│   │   ├── base-use-case.ts # Base use case class
│   │   └── *.ts          # Specific use cases
│   ├── config/           # Application configuration
│   ├── services/         # Backend services (database, window management, etc.)
│   ├── main.ts           # Main process entry point
│   └── preload.ts        # Preload script (IPC bridge)
├── frontend/             # Vue renderer process (Frontend)
│   ├── lib/              # Frontend utilities
│   │   ├── api.ts        # API utilities
│   │   ├── dom.ts        # DOM manipulation utilities
│   │   ├── events.ts     # Event utilities
│   │   ├── utils.ts      # General utilities
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
├── assets/               # Static assets
├── index.html            # HTML template
├── index.css             # Global styles
└── reset.css             # CSS reset

scripts/                  # Build automation
├── dev.ts                # Development server
├── build.ts              # Production builds
├── package.ts            # Packaging scripts
└── utils/                # Shared utilities
```

## Advanced Usage

### Custom Window Management
```typescript
// Create custom windows with specific configurations
import { WindowManager } from '@/main/lib/utils';

const customWindow = WindowManager.createWindow({
  name: 'custom-window',
  url: '/custom-page',
  options: {
    width: 1200,
    height: 800,
    webPreferences: {
      // custom preferences
    }
  }
});
```

### IPC Communication
```javascript
// Secure communication between processes
// Renderer process
const version = await window.electronAPI.invoke('app:getVersion');

// Main process handler
ipcMain.handle('app:getVersion', () => {
  return app.getVersion();
});
```

### Environment Configuration
```bash
# Development
NODE_ENV=development npm run dev

# Production build
NODE_ENV=production npm run build

# Custom port
PORT=4000 npm run dev
```

## Scripts Reference

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server with HMR |
| `npm run build` | Create optimized production build |
| `npm run package` | Package for distribution |
| `npm run setup` | Initialize project dependencies |
| `npm run type-check` | Run TypeScript type checking |
| `npm run lint` | Lint and format code |
| `npm run format` | Format code with Biome |
| `npm run deps:latest` | Check for outdated dependencies |

## Use Cases

Perfect for building:
- **Productivity tools** (task managers, note-taking apps)
- **Developer utilities** (code editors, API clients)
- **Creative applications** (design tools, media players)
- **Business software** (CRM, dashboards, admin panels)
- **Educational tools** (learning platforms, tutorials)
- **Entertainment apps** (games, streaming clients)

## Contributing

We welcome contributions! Please see our [contributing guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Run tests: `npm run type-check && npm run lint`
5. Commit your changes: `git commit -m 'feat: add amazing feature'`
6. Push to the branch: `git push origin feature/amazing-feature`
7. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Support

- **Documentation**: Check out our comprehensive [docs](./docs/)
- **Issues**: Report bugs and suggest features on [GitHub Issues](https://github.com/your-repo/issues)
- **Discussions**: Join our community discussions
- **Email**: Contact the maintainer at [your-email@example.com]

---

<div align="center">

**Ready to build the next great desktop application?**

Star this repository if it helped you!

</div>

## Keywords

electron, vue, vuejs, rspack, desktop-app, cross-platform, typescript, template, starter, boilerplate, webpack-alternative, fast-builds, hmr, hot-module-replacement