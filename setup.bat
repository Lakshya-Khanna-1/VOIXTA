@echo off
echo.
echo ======================================
echo   VoiceGuard -- Setup Script
echo ======================================
echo.

where node >nul 2>nul
if %errorlevel% neq 0 (
  echo ERROR: Node.js is not installed.
  echo Download from: https://nodejs.org
  pause
  exit /b 1
)

echo Node.js found. Installing dependencies...
call npm install

echo.
echo ======================================
echo   Starting VoiceGuard Dev Server
echo ======================================
echo.
echo Open: http://localhost:3000
echo Use Chrome or Edge for voice detection.
echo Press Ctrl+C to stop.
echo.
call npm run dev
pause
