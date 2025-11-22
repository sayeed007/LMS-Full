@echo off
echo Starting LMS Development Servers...
echo.

REM Start backend server in a new window
start "Backend Server" cmd /k "cd backend && npm run dev"

REM Wait a moment before starting frontend
timeout /t 2 /nobreak >nul

REM Start frontend server in a new window
start "Frontend Server" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting in separate windows...
echo - Backend Server window
echo - Frontend Server window
echo.
echo You can close this window now.
timeout /t 5