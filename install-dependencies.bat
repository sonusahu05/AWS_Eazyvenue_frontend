@echo off
REM Script to download and install all dependencies for the Angular project
REM This script handles npm package manager on Windows

setlocal enabledelayedexpansion

REM Colors are not easily supported in batch, so we'll use simple text
set "INFO_PREFIX=[INFO]"
set "SUCCESS_PREFIX=[SUCCESS]"
set "WARNING_PREFIX=[WARNING]"
set "ERROR_PREFIX=[ERROR]"

REM Function to print status (simulated with goto)
goto main

:print_status
echo %INFO_PREFIX% %~1
goto :eof

:print_success
echo %SUCCESS_PREFIX% %~1
goto :eof

:print_warning
echo %WARNING_PREFIX% %~1
goto :eof

:print_error
echo %ERROR_PREFIX% %~1
goto :eof

:check_command
where %1 >nul 2>nul
goto :eof

:detect_package_manager
if exist "yarn.lock" (
    set "PACKAGE_MANAGER=yarn"
) else if exist "package-lock.json" (
    set "PACKAGE_MANAGER=npm"
) else (
    set "PACKAGE_MANAGER=npm"
)
goto :eof

:install_dependencies
call :print_status "Installing dependencies using %PACKAGE_MANAGER%..."

if "%PACKAGE_MANAGER%"=="yarn" (
    call :check_command yarn
    if errorlevel 1 (
        call :print_error "Yarn is not installed. Please install yarn first or use npm."
        exit /b 1
    )
    yarn install --frozen-lockfile
) else (
    call :check_command npm
    if errorlevel 1 (
        call :print_error "npm is not installed. Please install Node.js and npm first."
        exit /b 1
    )
    npm ci --prefer-offline --no-audit
)

if errorlevel 1 (
    call :print_error "Installation failed!"
    exit /b 1
)
goto :eof

:clean_install
call :print_status "Performing clean installation..."

REM Remove node_modules directory
if exist "node_modules" (
    call :print_status "Removing existing node_modules directory..."
    rmdir /s /q "node_modules"
)

REM Clean package manager cache
if "%PACKAGE_MANAGER%"=="yarn" (
    call :check_command yarn
    if not errorlevel 1 (
        call :print_status "Cleaning yarn cache..."
        yarn cache clean
    )
) else (
    call :check_command npm
    if not errorlevel 1 (
        call :print_status "Cleaning npm cache..."
        npm cache clean --force
    )
)
goto :eof

:verify_installation
call :print_status "Verifying installation..."

if exist "node_modules" (
    call :print_success "Dependencies installed successfully!"
    
    REM Count directories in node_modules (simplified)
    for /f %%i in ('dir /ad /b node_modules 2^>nul ^| find /c /v ""') do set "PACKAGE_COUNT=%%i"
    call :print_status "Total packages installed: !PACKAGE_COUNT!"
) else (
    call :print_error "Installation failed or node_modules is empty!"
    exit /b 1
)
goto :eof

:show_angular_info
call :check_command ng
if not errorlevel 1 (
    call :print_status "Angular CLI version:"
    ng version --skip-git 2>nul
) else (
    call :print_warning "Angular CLI not found globally. You may need to install it: npm install -g @angular/cli"
)
goto :eof

:show_help
echo Usage: %~nx0 [OPTIONS]
echo.
echo Options:
echo   --clean, -c    Clean install (removes node_modules and cache first)
echo   --help, -h     Show this help message
echo.
echo Examples:
echo   %~nx0              # Normal installation
echo   %~nx0 --clean     # Clean installation
goto :eof

:main
REM Handle command line arguments
if "%1"=="--help" goto help
if "%1"=="-h" goto help
if "%1"=="/?" goto help

call :print_status "Starting dependency installation for Angular project..."

REM Check if package.json exists
if not exist "package.json" (
    call :print_error "package.json not found. Make sure you're in the correct directory."
    exit /b 1
)

REM Show project information
for /f "tokens=2 delims=:, " %%a in ('findstr /r "\"name\":" package.json') do (
    set "PROJECT_NAME=%%a"
    set "PROJECT_NAME=!PROJECT_NAME:"=!"
)
for /f "tokens=2 delims=:, " %%a in ('findstr /r "\"version\":" package.json') do (
    set "PROJECT_VERSION=%%a"
    set "PROJECT_VERSION=!PROJECT_VERSION:"=!"
)

call :print_status "Project: !PROJECT_NAME!"
call :print_status "Version: !PROJECT_VERSION!"

REM Detect package manager
call :detect_package_manager
call :print_status "Detected package manager: %PACKAGE_MANAGER%"

REM Check for clean install flag
if "%1"=="--clean" call :clean_install
if "%1"=="-c" call :clean_install

REM Install dependencies
call :install_dependencies
if errorlevel 1 (
    call :print_error "Dependency installation failed!"
    exit /b 1
)

call :verify_installation
if errorlevel 1 exit /b 1

call :show_angular_info

call :print_success "All dependencies have been successfully installed!"
call :print_status "You can now run the project with: npm start or ng serve"
goto end

:help
call :show_help
goto end

:end
endlocal
