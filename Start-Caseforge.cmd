@echo off
cd /d "%~dp0"
if not exist node_modules\next\dist\bin\next (
  echo Dependencies are missing. Install them before running the studio.
  pause
  exit /b 1
)
if not exist .next\BUILD_ID (
  node node_modules\next\dist\bin\next build --webpack
  if errorlevel 1 (
    pause
    exit /b 1
  )
)
echo Open http://localhost:3000 in your browser. Keep this window open.
node node_modules\next\dist\bin\next start --hostname 127.0.0.1
pause
