@echo off
echo ========================================
echo Restarting with New Gemini API Key
echo ========================================
echo.

echo Step 1: Clearing Vite cache...
if exist "node_modules\.vite" (
    rmdir /s /q "node_modules\.vite"
    echo Vite cache cleared!
) else (
    echo No Vite cache found.
)
echo.

echo Step 2: Verifying API key in .env file...
findstr "VITE_GEMINI_API_KEY" .env
echo.

echo Step 3: Starting development server...
echo Please wait for the server to start, then:
echo   1. Go to your browser
echo   2. Press Ctrl+Shift+R to hard refresh
echo   3. Try Genie AI again
echo.
echo Starting server now...
echo.

npm run dev
