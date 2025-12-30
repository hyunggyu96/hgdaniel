@echo off
echo Sending commands with FULL PATH...

:: 0. Go to home (just in case)
adb shell input text "cd"
adb shell input keyevent 66
timeout /t 1 >nul

:: 1. cp -r /sdcard/news_dashboard . 
:: (Copy to current directory which is HOME)
adb shell input text "cp"
adb shell input keyevent 62
adb shell input text "-r"
adb shell input keyevent 62
adb shell input text "/sdcard/news_dashboard"
adb shell input keyevent 62
adb shell input text "."
adb shell input keyevent 66
timeout /t 5 >nul

:: 2. cd news_dashboard
adb shell input text "cd"
adb shell input keyevent 62
adb shell input text "news_dashboard"
adb shell input keyevent 66
timeout /t 1 >nul

:: 3. chmod +x start_tablet_solo.sh
adb shell input text "chmod"
adb shell input keyevent 62
adb shell input text "+x"
adb shell input keyevent 62
adb shell input text "start_tablet_solo.sh"
adb shell input keyevent 66
timeout /t 1 >nul

:: 4. ./start_tablet_solo.sh
adb shell input text "./start_tablet_solo.sh"
adb shell input keyevent 66

echo Done!
pause
