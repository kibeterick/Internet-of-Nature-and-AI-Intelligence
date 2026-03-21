@echo off
echo ========================================
echo   Deploying Nature AI Intelligence
echo ========================================
echo.

echo Step 1: Building production version...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo Build failed! Please fix errors and try again.
    pause
    exit /b 1
)

echo.
echo Step 2: Deploying to Firebase...
call firebase deploy --only hosting

if %ERRORLEVEL% NEQ 0 (
    echo Deployment failed! Make sure you're logged in to Firebase.
    echo Run: firebase login
    pause
    exit /b 1
)

echo.
echo ========================================
echo   Deployment Complete!
echo ========================================
echo.
echo Your site is now live!
echo Visit: https://flutter-ai-playground-214d7.web.app
echo.
pause
