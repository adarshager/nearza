@echo off
REM ===================================================================
REM Nearza — Project Setup Script (Windows)
REM ===================================================================

echo [Nearza] Setting up project environment...

REM 1. Copy env templates if not present
if not exist "%~dp0..\backend\.env" (
    echo [Nearza] Copying backend\.env.example to backend\.env...
    copy "%~dp0..\backend\.env.example" "%~dp0..\backend\.env"
)

if not exist "%~dp0..\frontend\.env" (
    echo [Nearza] Copying frontend\.env.example to frontend\.env...
    copy "%~dp0..\frontend\.env.example" "%~dp0..\frontend\.env"
)

REM 2. Install backend dependencies
echo [Nearza] Installing backend Python packages...
cd /d %~dp0..\backend
pip install -r requirements.txt

REM 3. Install frontend dependencies
echo [Nearza] Installing frontend npm packages...
cd /d %~dp0..\frontend
call npm install

echo [Nearza] Setup complete! Remember to configure Supabase credentials in backend\.env.
