# Contributing to Electron + Vue + Rspack Starter

First off, thank you for considering contributing to this project! Contributions are what make the open-source community such an amazing place to learn, inspire, and create. Any contributions you make are greatly appreciated.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [How Can I Contribute?](#how-can-i-contribute)
- [Development Setup](#development-setup)
- [Pull Request Process](#pull-request-process)
- [Style Guides](#style-guides)
- [Project Structure](#project-structure)

## Code of Conduct

By participating in this project, you agree to abide by our Code of Conduct. Please read it before contributing.

## How Can I Contribute?

### Reporting Bugs

This section guides you through submitting a bug report. Following these guidelines helps maintainers and the community understand your report, reproduce the behavior, and find related reports.

- Use a clear and descriptive title for the issue
- Describe the exact steps to reproduce the problem
- Provide specific examples to demonstrate the steps
- Describe the behavior you observed after following the steps
- Explain which behavior you expected to see instead
- Include screenshots if relevant

### Suggesting Enhancements

This section guides you through submitting an enhancement suggestion, including completely new features and minor improvements to existing functionality.

- Use a clear and descriptive title
- Provide a step-by-step description of the suggested enhancement
- Explain why this enhancement would be useful
- List some other projects where this enhancement exists

### Your First Code Contribution

Unsure where to begin contributing? You can start by looking through these `beginner` and `help-wanted` issues:

- [Beginner issues](https://github.com/your-repo/issues?q=is%3Aopen+is%3Aissue+label%3A%22good+first+issue%22) - issues which should only require a few lines of code
- [Help wanted issues](https://github.com/your-repo/issues?q=is%3Aopen+is%3Aissue+label%3A%22help+wanted%22) - issues which should be a bit more involved

### Pull Requests

- Fill in the required template
- Do not include issue numbers in the PR title
- Include screenshots in your pull request when adding new features
- End all files with a newline
- Follow the [Style Guides](#style-guides)

## Development Setup

1. Fork the repository
2. Clone your fork:
   ```bash
   git clone https://github.com/YOUR_USERNAME/starter-rspack-electron-vue.git
   ```
3. Navigate to the project directory:
   ```bash
   cd starter-rspack-electron-vue
   ```
4. Install dependencies:
   ```bash
   npm install
   # or
   bun install
   ```
5. Run setup script:
   ```bash
   npm run setup
   ```
6. Start development server:
   ```bash
   npm run dev
   ```

## Pull Request Process

1. Ensure any install or build dependencies are removed before the end of the layer when doing a build
2. Update the README.md with details of changes to the interface
3. Increase the version numbers in any examples files and the README.md to the new version that this Pull Request would represent
4. You may merge the Pull Request in once you have the sign-off of two other developers, or if you do not have permission to do that, you may request the second reviewer to merge it for you

## Style Guides

### Git Commit Messages

- Use the present tense ("Add feature" not "Added feature")
- Use the imperative mood ("Move cursor to..." not "Moves cursor to...")
- Limit the first line to 72 characters or less
- Reference issues and pull requests liberally after the first line

### JavaScript/TypeScript Style Guide

- Code style is enforced by [Biome](https://biomejs.dev/)
- Run `npm run format` to automatically format your code
- Run `npm run lint` to check for style issues
- Follow the existing code patterns in the project

### Vue Component Style Guide

- Use PascalCase for component names in templates
- Use kebab-case for component filenames
- Follow Vue 3 Composition API patterns
- Use TypeScript for type safety where possible

### Documentation Style Guide

- Use [Markdown](https://daringfireball.net/projects/markdown/) for documentation
- Use [semantic line breaks](https://sembr.org/) in Markdown files
- Write in American English
- Use active voice when possible

## Project Structure

Understanding the project structure will help you make better contributions:

```
src/
├── main/              # Electron main process
│   ├── lib/           # Main process utilities
│   └── main.js        # Main entry point
├── renderer/          # Vue renderer process
│   ├── lib/           # Renderer process utilities
│   ├── components/    # Vue components
│   └── main.js        # Renderer entry point
└── shared/            # Shared between processes

scripts/               # Build automation
├── dev.ts             # Development server
├── build.ts           # Production builds
└── utils/             # Shared utilities
```

## Questions?

If you have any questions about contributing, please feel free to contact the maintainers by opening an issue.

Thank you again for your interest in contributing to the Electron + Vue + Rspack Starter!