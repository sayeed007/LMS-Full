@echo off
echo Starting LMS Development Servers...
echo.

REM Start backend server in a new terminal window
echo Starting Backend Server...
start "Backend Server" cmd /k "cd backend && npm run dev"

REM Wait a moment before starting frontend
timeout /t 2 /nobreak >nul

REM Start frontend server in a new terminal window
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting...
echo Backend and Frontend will open in separate terminal windows.
echo.
pause