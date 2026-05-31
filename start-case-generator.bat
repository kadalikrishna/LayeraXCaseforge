@echo off
cd /d C:\Laryera
echo Starting Laryera Case Generator...
echo.
echo Open this URL after the server is ready:
echo http://localhost:3001/case-generator
echo.
npm run dev -- -p 3001
pause
