@echo off
echo ====================================================================
echo FIXING GENIE AI AND REDEPLOYING
echo ====================================================================
echo.
echo This will:
echo   1. Rebuild your app with API keys embedded
echo   2. Deploy to Firebase Hosting
echo   3. Genie AI will work on the live site
echo.
echo Time required: 3-4 minutes
echo.
echo ====================================================================
echo.
pause
echo.
echo [1/2] Building app with environment variables...
echo.
call npm run build
echo.
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ====================================================================
    echo BUILD FAILED
    echo ====================================================================
    echo.
    echo Check the errors above and try again.
    echo.
    pause
    exit /b 1
)
echo.
echo ====================================================================
echo BUILD SUCCESSFUL!
echo ====================================================================
echo.
echo [2/2] Deploying to Firebase...
echo.
call firebase deploy --only hosting
echo.
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ====================================================================
    echo DEPLOYMENT FAILED
    echo ====================================================================
    echo.
    echo Check the errors above and try again.
    echo.
    pause
    exit /b 1
)
echo.
echo ====================================================================
echo SUCCESS! GENIE AI IS NOW WORKING!
echo ====================================================================
echo.
echo Your app is live at:
echo https://flutter-ai-playground-214d7.web.app
echo.
echo To test Genie AI:
echo   1. Open the URL above
echo   2. Clear browser cache (Ctrl+Shift+Delete)
echo   3. Refresh (Ctrl+F5)
echo   4. Click the Genie button (bottom right)
echo   5. Ask a question!
echo.
echo ====================================================================
echo.
pause
