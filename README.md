# Starter Rspack Electron Vue

A modern starter template for building cross-platform desktop applications using Electron, Vue.js, and Rspack.

## 🚀 Features

- **Vue.js 3** - Progressive JavaScript framework with Composition API
- **Rspack** - Fast Rust-based bundler compatible with webpack
- **Electron** - Build cross-platform desktop apps with JavaScript, HTML, and CSS
- **Hot Module Replacement** - Real-time updates during development
- **Modern ESNext Support** - Full support for latest JavaScript features
- **TypeScript Ready** - Type-safe development environment
- **CSS Processing** - Built-in support for CSS modules and preprocessors
- **Asset Handling** - Automatic processing of images, fonts, and other assets

## 🛠️ Tech Stack

- **Framework**: Vue.js 3 (Composition API)
- **Bundler**: Rspack (fast Rust-based bundler)
- **Runtime**: Electron (desktop application framework)
- **Language**: JavaScript/TypeScript
- **Package Manager**: Bun (or npm/yarn)

## 📋 Prerequisites

Make sure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [Bun](https://bun.sh/) (recommended) or npm
- [Git](https://git-scm.com/)

## 🚀 Quick Start

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd starter-rspack-electron-vue
   ```

2. **Install dependencies**
   ```bash
   # Using Bun (recommended)
   bun install
   
   # Or using npm
   npm install
   ```

3. **Start the development server**
   ```bash
   # Start the development server with HMR
   bun run dev
   # or
   npm run dev
   ```

4. **Open another terminal and start the Electron app**
   ```bash
   # In a separate terminal
   bun run start
   # or
   npm run start
   ```

## 🧰 Available Scripts

| Script | Description |
|--------|-------------|
| `dev` | Start the development server with hot module replacement |
| `rspack-dev` | Start the Rspack development server |
| `electron-dev` | Start the Electron app in development mode |
| `start` | Launch the Electron app |
| `build` | Build the application for production |
| `rspack-build` | Build the application using Rspack |
| `dist` | Package the application for distribution |
| `type-check` | Check TypeScript types |
| `lint` | Lint and fix code |
| `format` | Format code with Biome |

## 🏗️ Project Structure

```
starter-rspack-electron-vue/
├── src/                    # Source files
│   ├── App.vue            # Main Vue component
│   ├── main.js            # Entry point for renderer process
│   ├── index.html         # HTML template
│   ├── index.css          # Global styles
│   ├── App.css            # App-specific styles
│   ├── logo.svg           # Logo asset
│   └── main-process/      # Electron main process code
│       └── config.js      # Application configuration
├── main.cjs               # Electron main process entry
├── rspack.config.cjs      # Rspack configuration
├── tsconfig.json          # TypeScript configuration
├── package.json           # Project metadata and dependencies
└── README.md              # This file
```

## 🔧 Configuration

### Rspack Configuration (`rspack.config.cjs`)
- Bundles Vue.js components using vue-loader
- Handles static assets (images, fonts)
- Configures development server with hot module replacement
- Sets up aliases for easier imports (@, @/renderer, @/main-process)

### Electron Configuration (`main.cjs`)
- Creates the main browser window
- Handles development vs production builds
- Manages application lifecycle

### TypeScript Configuration (`tsconfig.json`)
- Enables modern JavaScript features
- Configures path aliases
- Sets up Vue.js compatibility

## 🎯 Development Workflow

1. **Development Mode**:
   - Run `bun run dev` to start the development server with HMR
   - Run `bun run start` in another terminal to launch the Electron app
   - Changes to Vue components will automatically reload in the Electron window

2. **Building for Production**:
   - Run `bun run build` to create optimized production bundles
   - Run `bun run dist` to package the application for distribution

## 💡 Key Concepts

### Vue.js Integration
- Single File Components (SFC) with `.vue` files
- Composition API for component logic
- Reactive state management
- Component-based architecture

### Rspack Benefits
- Significantly faster build times compared to traditional webpack
- Seamless webpack compatibility
- Optimized for modern JavaScript projects
- Built-in development server with HMR

### Electron Desktop Apps
- Cross-platform desktop applications
- Access to native OS APIs
- Web technologies for desktop development
- Auto-updater capabilities

## 📦 Building and Distribution

To create distributable desktop applications:

```bash
# Build the application
bun run build

# Create distributable packages (AppImage, deb, MSI, etc.)
bun run dist
```

The packaged applications will be created in the `dist/` folder.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the [GitHub Issues](https://github.com/your-username/starter-rspack-electron-vue/issues) page
2. Create a new issue with detailed information about your problem
3. Include your operating system, Node.js version, and any error messages