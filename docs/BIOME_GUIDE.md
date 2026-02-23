# Biome Linter & Formatter Guide

## Overview

This project uses **Biome** (formerly Rome) as the unified linter and formatter. Biome is significantly faster than ESLint + Prettier and provides a consistent configuration across the entire codebase.

## Quick Start

```bash
# Check and fix all files
bun run lint

# Check without fixing (CI/CD)
bun run lint-check

# Format all files
bun run format

# Check formatting without changing
bun run format-check
```

## Frontend-Specific Commands

```bash
# Lint frontend only
bun run lint:frontend

# Check frontend without fixing
bun run lint:frontend-check

# Format frontend only
bun run format:frontend
```

## Configuration

### Main Config: `biome.json`

The configuration is organized with:
- **Global rules** - Applied to all files
- **Overrides** - Path-specific rule adjustments

### Key Rules

#### Correctness (Errors)
- `noUnusedImports` - Remove unused imports
- `noUnusedVariables` - Remove unused variables
- `useHookAtTopLevel` - Vue/React hooks at top level
- `useExhaustiveDependents` - Complete dependency arrays

#### Security
- `noDangerouslySetInnerHtml` - Warn on unsafe HTML

#### Suspicious (Warnings)
- `noExplicitAny` - Avoid `any` type (warn, not error)
- `noArrayIndexKey` - Don't use array index as key
- `noConsole` - Disabled for development

#### Style
- `useConst` - Prefer `const` over `let`
- `useImportType` - Use `import type` for types
- `useNodejsImportProtocol` - Use `node:` prefix for Node modules

#### Complexity
- `useArrowFunction` - Prefer arrow functions
- `useLiteralKeys` - Use literal property access

#### Performance
- `noAccumulatingSpread` - Warn on spread in loops

#### Accessibility (a11y)
- `useKeyWithClickEvents` - Add keyboard support for click handlers

## Overrides

### Vue Files (`*.vue`)
- Relaxed `useExhaustiveDependents` (Vue reactivity handles this)
- Disabled `useImportType` (Vue SFC limitations)

### Frontend (`src/frontend/`)
- Console allowed for debugging
- Unused variables as warning (not error)

### Tests (`test/**/*`)
- All strict rules relaxed
- `any` type allowed for mocks
- Console allowed

### Scripts (`scripts/**/*`)
- Console allowed for CLI output

### Shared (`src/shared/**/*`)
- Strictest rules (library code)

### Backend (`src/backend/**/*`)
- Console allowed for logging

## Formatting Rules

```json
{
  "indentStyle": "space",
  "indentWidth": 2,
  "lineWidth": 100,
  "lineEnding": "lf",
  "quoteStyle": "single",
  "semicolons": "always",
  "trailingCommas": "es5",
  "arrowParentheses": "always",
  "bracketSpacing": true
}
```

## VS Code Integration

### Recommended Extension

Install: **Biome** (by Biome)

### Settings (`.vscode/settings.json`)

```json
{
  "editor.defaultFormatter": "biomejs.biome",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true,
    "source.fixAll.biome": true
  },
  "biome.lint.enabled": true,
  "biome.format.enabled": true
}
```

## Pre-commit Hook

Add to your `.husky/pre-commit`:

```bash
#!/bin/sh
. "$(dirname "$0")/_/husky.sh"

bun run lint-check
bun run test:run
```

## Migration from ESLint/Prettier

1. Remove old configs:
   ```bash
   rm .eslintrc* .prettierrc* .eslintignore .prettierignore
   ```

2. Remove dependencies:
   ```bash
   bun remove eslint prettier eslint-plugin-* @typescript-eslint/*
   ```

3. Run Biome:
   ```bash
   bun run lint
   bun run format
   ```

## Common Issues

### Vue SFC Scripts

Biome handles Vue SFCs but some rules may need overrides. The config already handles this.

### TypeScript `any` Type

Use `unknown` instead when possible:
```typescript
// Bad
function process(data: any) {}

// Good
function process(data: unknown) {
  if (typeof data === 'string') {
    // type-safe usage
  }
}
```

### Unused Variables in Tests

Tests often have unused variables for mocking. This is allowed in `test/` directory.

### Console Statements

Console is allowed in most directories except `src/shared/`.

## CI/CD Integration

```yaml
# GitHub Actions example
- name: Lint
  run: bun run lint-check

- name: Format Check
  run: bun run format-check

- name: Test
  run: bun test --run
```

## Performance

Biome is ~50x faster than ESLint + Prettier:

| Tool | Time (avg) |
|------|-----------|
| ESLint + Prettier | ~30s |
| Biome | ~0.6s |

## Resources

- [Biome Documentation](https://biomejs.dev/)
- [Biome Rules](https://biomejs.dev/linter/rules/)
- [Biome Playground](https://biomejs.dev/playground/)
