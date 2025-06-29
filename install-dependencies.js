#!/usr/bin/env node

/**
 * Node.js script to download and install all dependencies
 * Cross-platform alternative to shell scripts
 */

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// ANSI color codes
const colors = {
    reset: '\x1b[0m',
    bright: '\x1b[1m',
    red: '\x1b[31m',
    green: '\x1b[32m',
    yellow: '\x1b[33m',
    blue: '\x1b[34m'
};

// Utility functions
const log = {
    info: (msg) => console.log(`${colors.blue}[INFO]${colors.reset} ${msg}`),
    success: (msg) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`),
    warning: (msg) => console.log(`${colors.yellow}[WARNING]${colors.reset} ${msg}`),
    error: (msg) => console.log(`${colors.red}[ERROR]${colors.reset} ${msg}`)
};

// Check if command exists
function commandExists(command) {
    try {
        execSync(`which ${command}`, { stdio: 'ignore' });
        return true;
    } catch {
        try {
            execSync(`where ${command}`, { stdio: 'ignore' });
            return true;
        } catch {
            return false;
        }
    }
}

// Detect package manager
function detectPackageManager() {
    if (fs.existsSync('yarn.lock')) {
        return 'yarn';
    } else if (fs.existsSync('package-lock.json')) {
        return 'npm';
    } else {
        return 'npm'; // default
    }
}

// Execute command with real-time output
function executeCommand(command, args = []) {
    return new Promise((resolve, reject) => {
        const child = spawn(command, args, {
            stdio: 'inherit',
            shell: true
        });

        child.on('close', (code) => {
            if (code === 0) {
                resolve();
            } else {
                reject(new Error(`Command failed with exit code ${code}`));
            }
        });

        child.on('error', (error) => {
            reject(error);
        });
    });
}

// Clean installation
async function cleanInstall(packageManager) {
    log.info('Performing clean installation...');
    
    // Remove node_modules
    if (fs.existsSync('node_modules')) {
        log.info('Removing existing node_modules directory...');
        fs.rmSync('node_modules', { recursive: true, force: true });
    }
    
    // Clean cache
    try {
        if (packageManager === 'yarn' && commandExists('yarn')) {
            log.info('Cleaning yarn cache...');
            await executeCommand('yarn', ['cache', 'clean']);
        } else if (packageManager === 'npm' && commandExists('npm')) {
            log.info('Cleaning npm cache...');
            await executeCommand('npm', ['cache', 'clean', '--force']);
        }
    } catch (error) {
        log.warning(`Cache cleaning failed: ${error.message}`);
    }
}

// Install dependencies
async function installDependencies(packageManager) {
    log.info(`Installing dependencies using ${packageManager}...`);
    
    try {
        if (packageManager === 'yarn') {
            if (!commandExists('yarn')) {
                throw new Error('Yarn is not installed. Please install yarn first or use npm.');
            }
            await executeCommand('yarn', ['install', '--frozen-lockfile']);
        } else {
            if (!commandExists('npm')) {
                throw new Error('npm is not installed. Please install Node.js and npm first.');
            }
            await executeCommand('npm', ['ci', '--prefer-offline', '--no-audit']);
        }
    } catch (error) {
        throw new Error(`Installation failed: ${error.message}`);
    }
}

// Verify installation
function verifyInstallation() {
    log.info('Verifying installation...');
    
    if (fs.existsSync('node_modules')) {
        const packages = fs.readdirSync('node_modules').filter(name => !name.startsWith('.'));
        log.success('Dependencies installed successfully!');
        log.info(`Total packages installed: ${packages.length}`);
        return true;
    } else {
        log.error('Installation failed or node_modules is empty!');
        return false;
    }
}

// Show Angular CLI info
async function showAngularInfo() {
    if (commandExists('ng')) {
        log.info('Angular CLI version:');
        try {
            await executeCommand('ng', ['version', '--skip-git']);
        } catch (error) {
            log.warning('Could not get Angular CLI version');
        }
    } else {
        log.warning('Angular CLI not found globally. You may need to install it: npm install -g @angular/cli');
    }
}

// Show help
function showHelp() {
    console.log('Usage: node install-dependencies.js [OPTIONS]');
    console.log('');
    console.log('Options:');
    console.log('  --clean, -c    Clean install (removes node_modules and cache first)');
    console.log('  --help, -h     Show this help message');
    console.log('');
    console.log('Examples:');
    console.log('  node install-dependencies.js              # Normal installation');
    console.log('  node install-dependencies.js --clean      # Clean installation');
}

// Main function
async function main() {
    const args = process.argv.slice(2);
    
    // Handle help flag
    if (args.includes('--help') || args.includes('-h')) {
        showHelp();
        return;
    }
    
    log.info('Starting dependency installation for Angular project...');
    
    // Check if package.json exists
    if (!fs.existsSync('package.json')) {
        log.error('package.json not found. Make sure you\'re in the correct directory.');
        process.exit(1);
    }
    
    try {
        // Read project info
        const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        log.info(`Project: ${packageJson.name || 'Unknown'}`);
        log.info(`Version: ${packageJson.version || 'Unknown'}`);
        
        // Detect package manager
        const packageManager = detectPackageManager();
        log.info(`Detected package manager: ${packageManager}`);
        
        // Check for clean install flag
        if (args.includes('--clean') || args.includes('-c')) {
            await cleanInstall(packageManager);
        }
        
        // Install dependencies
        await installDependencies(packageManager);
        
        // Verify installation
        if (verifyInstallation()) {
            await showAngularInfo();
            log.success('All dependencies have been successfully installed!');
            log.info('You can now run the project with: npm start or ng serve');
        } else {
            process.exit(1);
        }
        
    } catch (error) {
        log.error(error.message);
        process.exit(1);
    }
}

// Run the script
if (require.main === module) {
    main().catch(error => {
        log.error(`Unexpected error: ${error.message}`);
        process.exit(1);
    });
}
