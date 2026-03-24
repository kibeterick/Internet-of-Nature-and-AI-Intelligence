@echo off
echo ====================================================================
echo UPDATE GEMINI API KEY
echo ====================================================================
echo.
echo This script will help you update your Gemini API key.
echo.
echo First, get your NEW API key from:
echo https://makersuite.google.com/app/apikey
echo.
echo ====================================================================
echo.
set /p NEW_KEY="Paste your NEW API key here: "
echo.
echo Updating .env file...
echo.

python update_api_key_and_deploy.py "%NEW_KEY%"

echo.
pause
