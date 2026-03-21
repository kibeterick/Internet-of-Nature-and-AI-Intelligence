@echo off
echo ============================================================
echo GRADLE LOCK FIX AND MOBILE APP BUILD
echo ============================================================

echo.
echo [1/5] Killing all Java/Gradle processes...
taskkill /F /IM java.exe 2>nul
if %errorlevel% equ 0 (
    echo Success: Java processes terminated
) else (
    echo Note: No Java processes found or already terminated
)

timeout /t 2 /nobreak >nul

echo.
echo [2/5] Deleting .gradle folder...
if exist "mobile_app\android\.gradle" (
    rmdir /s /q "mobile_app\android\.gradle"
    echo Success: Deleted .gradle folder
) else (
    echo Note: .gradle folder doesn't exist
)

echo.
echo [3/5] Deleting build folders...
if exist "mobile_app\android\app\build" rmdir /s /q "mobile_app\android\app\build"
if exist "mobile_app\android\build" rmdir /s /q "mobile_app\android\build"
if exist "mobile_app\build" rmdir /s /q "mobile_app\build"
echo Success: Build folders cleaned

echo.
echo [4/5] Running Flutter clean...
cd mobile_app
C:\flutter\bin\flutter.bat clean
cd ..
echo Success: Flutter clean completed

timeout /t 2 /nobreak >nul

echo.
echo [5/5] Building APK (debug mode)...
echo This will take 5-10 minutes. Please wait...
echo ------------------------------------------------------------
cd mobile_app
C:\flutter\bin\flutter.bat build apk --debug
cd ..

echo.
echo ============================================================
if %errorlevel% equ 0 (
    echo BUILD SUCCESSFUL!
    echo ============================================================
    echo.
    echo APK Location:
    echo mobile_app\build\app\outputs\flutter-apk\app-debug.apk
    echo.
    echo You can now install this APK on your Android device!
) else (
    echo BUILD FAILED
    echo ============================================================
    echo Please check the error messages above
)

echo.
echo ============================================================
echo SCRIPT COMPLETE
echo ============================================================
pause
