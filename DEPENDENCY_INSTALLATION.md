# Dependency Installation Scripts

This directory contains multiple scripts to help you download and install all dependencies for the Angular project.

## Available Scripts

### 1. Shell Script (Linux/macOS) - `install-dependencies.sh`
```bash
# Make executable (first time only)
chmod +x install-dependencies.sh

# Normal installation
./install-dependencies.sh

# Clean installation (removes node_modules and cache first)
./install-dependencies.sh --clean

# Show help
./install-dependencies.sh --help
```

### 2. Batch Script (Windows) - `install-dependencies.bat`
```cmd
# Normal installation
install-dependencies.bat

# Clean installation
install-dependencies.bat --clean

# Show help
install-dependencies.bat --help
```

### 3. Node.js Script (Cross-platform) - `install-dependencies.js`
```bash
# Normal installation
node install-dependencies.js

# Clean installation
node install-dependencies.js --clean

# Show help
node install-dependencies.js --help
```

## Features

All scripts include the following features:

- **Automatic Package Manager Detection**: Detects whether to use npm or yarn based on lock files
- **Clean Installation Option**: Removes node_modules and clears cache before installation
- **Error Handling**: Comprehensive error checking and colored output
- **Verification**: Verifies successful installation and counts installed packages
- **Angular CLI Check**: Shows Angular CLI version information
- **Cross-platform Compatibility**: Works on Windows, macOS, and Linux

## Quick Start

The fastest way to install dependencies:

### For Unix-like systems (macOS/Linux):
```bash
chmod +x install-dependencies.sh && ./install-dependencies.sh
```

### For Windows:
```cmd
install-dependencies.bat
```

### For any system with Node.js:
```bash
node install-dependencies.js
```

## Project Dependencies

This Angular project includes the following key dependencies:

### Core Angular Dependencies:
- Angular 12.x framework
- Angular CLI
- Angular Material/CDK
- Angular Router

### UI/UX Libraries:
- PrimeNG (UI components)
- PrimeFlex (CSS utilities)
- PrimeIcons
- Angular Material
- ngx-slider

### Additional Features:
- FullCalendar (calendar functionality)
- Chart.js (charts and graphs)
- Angular Editor (WYSIWYG editor)
- Vime (video player)
- Music Player component
- OTP Input components
- Infinite scroll
- File operations (file-saver, xlsx)

### Development Tools:
- TypeScript 4.2.x
- Karma (testing)
- Jasmine (testing framework)
- TSLint (code linting)
- Protractor (e2e testing)

## Troubleshooting

### Common Issues:

1. **Node.js/npm not found**: Install Node.js from https://nodejs.org/
2. **Permission errors**: Use `sudo` on Unix systems or run as administrator on Windows
3. **Network issues**: Try using `--clean` flag or check your internet connection
4. **Angular CLI not found**: Install globally with `npm install -g @angular/cli`

### Manual Installation:

If the scripts fail, you can manually install dependencies:

```bash
# Clean installation
rm -rf node_modules package-lock.json
npm cache clean --force
npm install

# Or with yarn
rm -rf node_modules yarn.lock
yarn cache clean
yarn install
```

## Script Selection Guide

- **Use Shell Script** (`install-dependencies.sh`): If you're on macOS/Linux and prefer bash
- **Use Batch Script** (`install-dependencies.bat`): If you're on Windows and prefer native batch
- **Use Node.js Script** (`install-dependencies.js`): If you want cross-platform compatibility or prefer Node.js

All scripts provide the same functionality with platform-specific optimizations.
