@echo off
echo ========================================
echo   Fixing Mobile App Build
echo ========================================
echo.

echo Step 1: Killing Java processes...
taskkill /F /IM java.exe 2>nul
timeout /t 2 >nul

echo.
echo Step 2: Deleting Gradle lock file...
del "mobile_app\android\.gradle\noVersion\buildLogic.lock" 2>nul
rmdir /S /Q "mobile_app\android\.gradle" 2>nul

echo.
echo Step 3: Cleaning Flutter...
cd mobile_app
C:\flutter\bin\flutter.bat clean

echo.
echo Step 4: Getting dependencies...
C:\flutter\bin\flutter.bat pub get

echo.
echo Step 5: Building APK (debug mode - faster)...
C:\flutter\bin\flutter.bat build apk --debug

echo.
echo ========================================
echo   Build Complete!
echo ========================================
echo.
echo Your APK is at:
echo mobile_app\build\app\outputs\flutter-apk\app-debug.apk
echo.
pause
