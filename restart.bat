@echo off
echo Restarting LMS Development Servers...
echo.

REM Kill only the dev server processes by killing their specific command windows
echo Stopping existing servers...
taskkill /fi "WindowTitle eq Backend Server*" /f >nul 2>&1
taskkill /fi "WindowTitle eq Frontend Server*" /f >nul 2>&1

REM Wait a moment for processes to fully terminate
timeout /t 2 /nobreak >nul

REM Start backend server in a new command prompt window
echo Starting Backend Server...
start "Backend Server" cmd /k "cd /d "%~dp0backend" && npm run dev"

REM Wait a moment before starting frontend
timeout /t 2 /nobreak >nul

REM Start frontend server in a new command prompt window
echo Starting Frontend Server...
start "Frontend Server" cmd /k "cd /d "%~dp0frontend" && npm run dev"

echo.
echo Restart complete! Both servers are running in separate command windows.
echo - Backend Server window
echo - Frontend Server window
echo.
echo You can close this window now.
timeout /t 3