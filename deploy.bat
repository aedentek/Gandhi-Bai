@echo off
echo 🚀 Starting deployment process...

REM Build the project first
echo 🏗️ Building project...
npm run build

if %ERRORLEVEL% neq 0 (
    echo ❌ Build failed!
    exit /b 1
)

echo ✅ Build completed successfully!
echo 📁 Files ready for deployment in 'dist' folder:

dir dist /s

echo.
echo 📋 Next Steps:
echo 1. Upload all files from 'dist' folder to your hosting provider
echo 2. Make sure to upload to the root directory of crm.gandhibaideaddictioncenter.com
echo 3. The main files to upload are:
echo    - index.html
echo    - assets/main-*.css
echo    - assets/main-*.js
echo    - favicon.ico
echo    - robots.txt

echo.
echo 🎯 Your website should be accessible at: https://crm.gandhibaideaddictioncenter.com

pause
