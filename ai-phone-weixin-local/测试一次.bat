@echo off
setlocal
cd /d "%~dp0"
if exist "runtime\node.exe" (
  "runtime\node.exe" assistant.mjs --once
  pause
  exit /b %errorlevel%
)
where node.exe >NUL 2>&1
if errorlevel 1 (
  echo Node.js was not found.
  echo Please install Node.js 20+ or use the package with built-in runtime.
  start "" "https://nodejs.org/"
  pause
  exit /b 1
)
node.exe assistant.mjs --once
pause
exit /b %errorlevel%
