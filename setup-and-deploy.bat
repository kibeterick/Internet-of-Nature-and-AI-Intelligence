@echo off
color 0A
echo ========================================
echo   Internet of Nature - Cloud Deployment
echo ========================================
echo.

echo Checking Firebase login status...
firebase projects:list >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo You need to login to Firebase first.
    echo Opening browser for authentication...
    echo.
    firebase login
    if %errorlevel% neq 0 (
        echo Login failed! Please try again.
        pause
        exit /b 1
    )
)

echo.
echo ✓ Firebase authentication successful!
echo.
echo Current project: flutter-ai-playground-214d7
echo.

echo ========================================
echo   Building Production Bundle
echo ========================================
echo.
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ❌ Build failed! Please fix errors above.
    pause
    exit /b %errorlevel%
)

echo.
echo ✓ Build completed successfully!
echo.

echo ========================================
echo   Deploying to Firebase Hosting
echo ========================================
echo.
firebase deploy --only hosting
if %errorlevel% neq 0 (
    echo.
    echo ❌ Deployment failed!
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo   🎉 DEPLOYMENT SUCCESSFUL! 🎉
echo ========================================
echo.
echo Your app is now LIVE and accessible from anywhere!
echo.
echo 🌐 Primary URL:
echo    https://flutter-ai-playground-214d7.web.app
echo.
echo 🌐 Alternative URL:
echo    https://flutter-ai-playground-214d7.firebaseapp.com
echo.
echo ========================================
echo   Access Your App From:
echo ========================================
echo ✓ Any computer (Windows, Mac, Linux)
echo ✓ Your phone (iPhone, Android)
echo ✓ Your tablet
echo ✓ Anywhere in the world!
echo.
echo ========================================
echo   Next Steps:
echo ========================================
echo 1. Open the URL above in any browser
echo 2. Share the link with others
echo 3. To update: Run this script again
echo.
echo Press any key to open your live app...
pause >nul
start https://flutter-ai-playground-214d7.web.app
