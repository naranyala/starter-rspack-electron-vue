# electron-vue-rspack

A minimal Electron + Vue.js boilerplate with [Rspack as bundler](https://www.rspack.dev/). Rspack is a fast Rust-based bundler compatible with webpack.

## Installation

* `git clone <repository-url>`
* `cd starter-rspack-electron-vue`
* `bun install` or `npm install`

## Usage

### Development mode
Run these commands to start dev server and Electron app
``` bash
# Parcel bundles the code and runs dev server
$ npm run dev

# Run the electron app which uses local dev server
$ npm run start-dev
```

### Production mode and packaging app
Run this command to bundle code in production mode
``` bash
# Parcel bundle code once
$ npm run build

# Create executables
$ npm run dist
```
