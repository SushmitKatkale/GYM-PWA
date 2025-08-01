# Quick APK Builder for GYM PWA Testing
Write-Host "🏋️‍♂️ Building GYM PWA Test APK" -ForegroundColor Green
Write-Host "==============================" -ForegroundColor Green

# Build the PWA
Write-Host "`n📦 Building PWA..." -ForegroundColor Yellow
npm run build
npx cap copy android

# Start preview server
Write-Host "`n🚀 Starting preview server..." -ForegroundColor Yellow
Write-Host "Your GYM PWA is ready for APK conversion!" -ForegroundColor Green

Write-Host "`n📱 CREATE APK - Choose one method:" -ForegroundColor Cyan
Write-Host "`n🌐 METHOD 1: PWABuilder (Recommended)" -ForegroundColor White
Write-Host "1. Go to: https://www.pwabuilder.com/" -ForegroundColor White
Write-Host "2. Enter URL: http://localhost:4173/" -ForegroundColor White
Write-Host "3. Click 'Start' → 'Package For Stores' → 'Android'" -ForegroundColor White
Write-Host "4. Download APK!" -ForegroundColor White

Write-Host "`n🔧 METHOD 2: APK Online (Alternative)" -ForegroundColor White  
Write-Host "1. Go to: https://appmaker.xyz/pwa-to-apk/" -ForegroundColor White
Write-Host "2. Enter URL: http://localhost:4173/" -ForegroundColor White
Write-Host "3. Generate APK!" -ForegroundColor White

Write-Host "`n📲 METHOD 3: Install directly on phone" -ForegroundColor White
Write-Host "1. Open Chrome on your phone" -ForegroundColor White
Write-Host "2. Go to: http://your-ip:4173/" -ForegroundColor White
Write-Host "3. Tap menu → 'Add to Home Screen'" -ForegroundColor White

Write-Host "`n⚠️  Keep this terminal open while generating APK!" -ForegroundColor Red
Write-Host "`nStarting preview server..." -ForegroundColor Yellow

# Start the preview server
npm run preview
