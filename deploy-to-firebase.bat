@echo off
echo ========================================
echo   Deploying to Firebase Hosting
echo ========================================
echo.

echo Step 1: Building production bundle...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed! Please fix errors and try again.
    pause
    exit /b %errorlevel%
)

echo.
echo Step 2: Deploying to Firebase...
call firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo Deployment failed! Make sure you're logged in to Firebase.
    echo Run: firebase login
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo   Deployment Successful!
echo ========================================
echo.
echo Your app is now live at:
echo https://flutter-ai-playground-214d7.web.app
echo.
pause
