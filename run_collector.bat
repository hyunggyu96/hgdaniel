
@echo off
cd /d "%~dp0"
echo 🚀 Starting Antigravity News Collector...
:loop
python collector/async_collector.py
echo ⚠️ Collector crashed or stopped. Restarting in 10 seconds...
timeout /t 10
goto loop
