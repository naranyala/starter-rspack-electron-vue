# Configuration Guide

## Environment Variables

| Variable | Description | Default Value |
|----------|-------------|---------------|
| `NODE_ENV` | Build environment mode | `development` |
| `PORT` | Development server port | Auto-assigned |
| `USE_BUN` | Prefer Bun over npm | `false` |

## Package.json Configuration

The `package.json` file contains build and distribution configurations:

### Build Settings
```json
{
  "build": {
    "appId": "com.some.electron.quickstart",
    "dmg": {
      "contents": [...]
    },
    "linux": {
      "category": "Utility",
      "target": ["AppImage", "deb"],
      "icon": "dist/icon.ico"
    },
    "win": {
      "target": "msi",
      "icon": "dist/icon.ico"
    },
    "files": [
      "main.cjs",
      "dist/**/*"
    ]
  }
}
```

## Rspack Configuration (`rspack.config.cjs`)

### Entry Points
- `./src/renderer/main.ts` - Main renderer entry point
- Output directory: `./dist/`
- Filename pattern: `[name].[contenthash].js`

### Path Aliases
- `@`: `src/`
- `@/renderer`: `src/renderer/`
- `@/main`: `src/main/`
- `@/assets`: `src/assets/`
- `@/renderer-lib`: `src/renderer/lib/`
- `@/main-lib`: `src/main/lib/`

### Module Resolution
- Supports `.ts`, `.tsx`, `.js`, `.jsx`, `.vue`, `.json` extensions
- Vue single-file component compilation
- Asset handling for images and fonts

### Plugins
- HtmlWebpackPlugin for HTML template generation
- VueLoaderPlugin for Vue component compilation
- MiniCssExtractPlugin for CSS extraction (production)

## TypeScript Configuration

### tsconfig.json
- Target: ES2020 or higher
- Module: ESNext
- Strict type checking enabled
- Allow JS: true for mixed projects
- Source map generation

### tsconfig.check.json
- Used specifically for type checking
- No emit during type checking
- Faster incremental checking

## Biome Configuration (`biome.json`)

### Formatting Rules
- Use double quotes for strings
- Trailing commas where syntactically allowed
- Indentation: 2 spaces
- Line width: 80 characters
- Semicolons: always

### Linting Rules
- Error prevention rules
- Code style consistency
- Best practice recommendations
- Security considerations

## Custom Scripts Configuration

### Development Script (`scripts/dev.ts`)
- Automatic port allocation
- Concurrent process management
- Error handling and recovery
- Process cleanup on exit

### Build Script (`scripts/build.ts`)
- Production optimization
- Asset minification
- Bundle analysis
- Output validation

### Setup Script (`scripts/setup.ts`)
- Dependency validation
- Environment preparation
- Asset generation
- Configuration validation

## Window Configuration

### Main Process Configuration (`src/main/lib/config.js`)
- Window dimensions and positioning
- BrowserWindow options
- Menu configurations
- Application settings defaults

## IPC Channel Configuration

### Available Channels
- `app:getVersion` - Get application version
- `app:getName` - Get application name
- `settings:get` - Get specific setting
- `settings:set` - Set specific setting
- `settings:getAll` - Get all settings
- `dialog:showMessageBox` - Show dialog box
- `window:minimize` - Minimize window
- `window:maximize` - Maximize/unmaximize window
- `window:close` - Close window

## Customization Options

### Adding New Aliases
Update `rspack.config.cjs` to add new path aliases:
```javascript
alias: {
  // existing aliases...
  '@/new-alias': path.resolve(__dirname, 'src/new-location'),
}
```

### Modifying Build Behavior
- Extend `scripts/utils/` for custom build operations
- Modify `rspack.config.cjs` for bundling changes
- Update `tsconfig.json` for TypeScript settings
- Adjust `biome.json` for code style preferences