# GymPro PWA to APK Generator
# This script prepares your PWA for APK conversion

Write-Host "🏋️‍♂️ GymPro PWA to APK Generator" -ForegroundColor Green
Write-Host "=================================" -ForegroundColor Green

# Step 1: Build the PWA
Write-Host "`n📦 Building PWA..." -ForegroundColor Yellow
npm run build:android

# Step 2: Start local server for PWABuilder
Write-Host "`n🚀 Starting local server..." -ForegroundColor Yellow
Write-Host "Your PWA is ready for APK conversion!" -ForegroundColor Green

Write-Host "`n🔗 NEXT STEPS:" -ForegroundColor Cyan
Write-Host "1. Keep this terminal open" -ForegroundColor White
Write-Host "2. Go to: https://www.pwabuilder.com/" -ForegroundColor White
Write-Host "3. Enter URL: http://localhost:3001/" -ForegroundColor White
Write-Host "4. Click 'Start' and wait for analysis" -ForegroundColor White
Write-Host "5. Click 'Package For Stores' → 'Android' → 'Generate Package'" -ForegroundColor White
Write-Host "6. Download your APK file!" -ForegroundColor White

Write-Host "`n📱 Alternative Methods:" -ForegroundColor Cyan
Write-Host "• Use ApkPure APK Builder: https://apkpure.com/apk-builder" -ForegroundColor White
Write-Host "• Use Convertify: https://convertify.io/" -ForegroundColor White
Write-Host "• Push to GitHub for automatic APK build (see .github/workflows/)" -ForegroundColor White

Write-Host "`nStarting development server..." -ForegroundColor Yellow
npm run dev
