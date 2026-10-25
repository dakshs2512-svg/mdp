@echo off
setlocal
cd /d "%~dp0"

echo ============================================
echo       FOCUS DRIFT - LOCAL DEMO
echo ============================================
echo.

where python >nul 2>nul
if errorlevel 1 (
  echo ERROR: Python was not found. Install Python 3.10+ and enable "Add Python to PATH".
  pause
  exit /b 1
)
where node >nul 2>nul
if errorlevel 1 (
  echo ERROR: Node.js was not found. Install Node.js LTS, then reopen this terminal.
  pause
  exit /b 1
)

if not exist "backend\venv\Scripts\python.exe" (
  echo [1/4] Creating Python virtual environment...
  python -m venv backend\venv
  if errorlevel 1 goto :error
)

echo [2/4] Installing/checking backend packages...
backend\venv\Scripts\python.exe -m pip install --upgrade pip
backend\venv\Scripts\python.exe -m pip install -r backend\requirements.txt
if errorlevel 1 goto :error

if not exist "node_modules" (
  echo [3/4] Installing frontend packages...
  call npm install
  if errorlevel 1 goto :error
) else (
  echo [3/4] Frontend packages already installed.
)

echo [4/4] Starting backend and frontend...
start "Focus Drift API" cmd /k "cd /d ""%~dp0backend"" && ""%~dp0backend\venv\Scripts\python.exe"" -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload"
timeout /t 2 /nobreak >nul
echo.
echo Backend API: http://127.0.0.1:8000
echo API docs:    http://127.0.0.1:8000/docs
echo Frontend:    http://localhost:5173
echo.
echo Starting Vite now. Keep this window open while demoing.
call npm run dev -- --host 127.0.0.1
goto :eof

:error
echo.
echo Setup failed. Check the error above, then try run_local.bat again.
pause
exit /b 1
