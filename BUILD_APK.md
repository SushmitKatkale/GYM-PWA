# Building APK for GymPro PWA

## Method 1: Online APK Builder (Recommended - No setup required)

### Step 1: Prepare the build
```bash
npm run build:android
```

### Step 2: Use PWABuilder (Microsoft)
1. Go to https://www.pwabuilder.com/
2. Enter your app URL: http://localhost:3001/ (when running locally)
3. Click "Start" and wait for analysis
4. Click "Package For Stores" 
5. Select "Android" and click "Generate Package"
6. Download your APK file

### Step 3: Alternative - Capacitor with GitHub Actions
We've set up GitHub Actions to build APK automatically when you push code.

## Method 2: Local Build (Requires Android Studio)

### Prerequisites:
1. Install Java JDK 17+
2. Install Android Studio
3. Set ANDROID_HOME environment variable

### Build Commands:
```bash
# Debug APK
npm run build:apk

# Release APK (for distribution)
npm run build:apk-release
```

## Method 3: Using Cordova (Alternative)

If Capacitor doesn't work, you can also convert using Cordova:

```bash
npm install -g cordova
cordova platform add android
cordova build android
```

## APK Location

Once built locally, your APK will be located at:
- **Debug APK**: `android/app/build/outputs/apk/debug/app-debug.apk`
- **Release APK**: `android/app/build/outputs/apk/release/app-release.apk`

## App Details

- **App Name**: GymPro - Fitness Management
- **Package ID**: com.gympro.app
- **Features**: Offline support, PWA capabilities, gym management

## Quick Deploy to Device

```bash
# Install on connected Android device
npx cap run android
```
