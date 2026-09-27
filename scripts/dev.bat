@echo off
REM ===================================================================
REM Nearza — Development Script (Windows)
REM Starts Django backend and Vite frontend in separate cmd windows
REM ===================================================================

echo [Nearza] Starting development environment...

REM Start Backend
start "Nearza Backend (Django)" cmd /k "cd /d %~dp0..\backend && python manage.py runserver 0.0.0.0:8000"

REM Start Frontend
start "Nearza Frontend (Vite)" cmd /k "cd /d %~dp0..\frontend && npm run dev"

echo [Nearza] Dev servers started!
echo Backend:  http://localhost:8000/api/
echo Frontend: http://localhost:5173/
echo.
