@echo off
chcp 65001 >nul
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 goto missing
node plugins\tencent-docs\scripts\setup.mjs %*
set setup_status=%errorlevel%
goto finish
:missing
echo Install Node.js 22+ from https://nodejs.org/ / 请先安装 Node.js 22 或更高版本。
set setup_status=1
:finish
pause
exit /b %setup_status%
