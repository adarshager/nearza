@echo off
REM ===================================================================
REM Nearza — System Checks (Windows)
REM Runs backend Django checks and frontend Vite build + lint
REM ===================================================================

echo [Nearza] Running Backend System Check...
cd /d %~dp0..\backend
python manage.py check --settings=config.settings.development
if %errorlevel% neq 0 (
    echo [ERROR] Backend check failed!
    exit /b %errorlevel%
)
echo [Nearza] Backend check passed!

echo.
echo [Nearza] Running Frontend Build Check...
cd /d %~dp0..\frontend
call npm run build
if %errorlevel% neq 0 (
    echo [ERROR] Frontend build failed!
    exit /b %errorlevel%
)
echo [Nearza] Frontend build passed!

echo.
echo [Nearza] All checks passed successfully!
