@echo off
REM ==============================================================================
REM AQUILA (DeepScan) - Autonomous Marine Intelligence OS
REM Smart India Hackathon 2026 (PS-26057 & PS-1)
REM 1-Click Startup Script for Windows (Command Prompt / PowerShell)
REM ==============================================================================

title AQUILA Marine Intelligence System

echo ======================================================================
echo   AQUILA OCEANOGRAPHIC COMMAND & CONTROL OS (WINDOWS LAUNCHER)
echo ======================================================================
echo.

REM 1. Check Python
where python >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Python is not installed or not in your system PATH.
    echo Please install Python 3.9+ from https://www.python.org/
    pause
    exit /b 1
)

REM 2. Check Node & NPM
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Node.js / npm is not installed or not in your system PATH.
    echo Please install Node.js 18+ from https://nodejs.org/
    pause
    exit /b 1
)

REM 3. Python Virtual Environment
if not exist "venv" (
    echo [*] Creating Python virtual environment...
    python -m venv venv
)

echo [*] Activating virtual environment and verifying backend requirements...
call venv\Scripts\activate.bat
pip install -r requirements.txt

REM 4. Frontend Dependencies
if not exist "frontend\node_modules" (
    echo [*] Installing frontend packages (React 19, Tailwind, Lucide)...
    cd frontend
    call npm install
    cd ..
)

echo.
echo [*] Starting AQUILA FastAPI Backend on http://localhost:8000 ...
start "AQUILA Backend Server" cmd /k "venv\Scripts\activate.bat && python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload"

timeout /t 3 /nobreak >nul

echo [*] Starting AQUILA React Frontend on http://localhost:5173 ...
start "AQUILA Frontend Server" cmd /k "cd frontend && npm run dev -- --host 0.0.0.0 --port 5173"

timeout /t 4 /nobreak >nul

echo.
echo ======================================================================
echo   [OK] AQUILA SYSTEM IS LIVE!
echo   Frontend Dashboard: http://localhost:5173
echo   Backend API Health: http://localhost:8000/api/health
echo ======================================================================
echo.

start http://localhost:5173

pause
