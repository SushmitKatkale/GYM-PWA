// Quick test script to verify fixes
// Run this in browser console after starting the app

console.log('🔍 Testing PWA and Google Maps fixes...\n');

// Test 1: Service Worker Registration
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then(registrations => {
    if (registrations.length > 0) {
      console.log('✅ Service Worker registered successfully');
      console.log('  - Active:', registrations[0].active?.state);
      console.log('  - Scope:', registrations[0].scope);
    } else {
      console.log('❌ No service workers registered');
    }
  });
} else {
  console.log('❌ Service Worker not supported');
}

// Test 2: Google Maps API Key
const apiKey = import.meta?.env?.VITE_GOOGLE_MAPS_API_KEY;
if (apiKey) {
  console.log('✅ Google Maps API key is configured');
} else {
  console.log('❌ Google Maps API key not found');
}

// Test 3: PWA Installation
if (window.deferredPrompt) {
  console.log('✅ PWA install prompt is available');
} else {
  console.log('ℹ️  PWA install prompt not triggered yet (normal)');
}

// Test 4: Check for common errors
const commonErrors = [
  'MIME type',
  'BillingNotEnabledMapError',
  'SERVICE_DISABLED',
  'SecurityError'
];

let hasErrors = false;
commonErrors.forEach(error => {
  if (console.logs && console.logs.some(log => log.includes(error))) {
    console.log(`❌ Found error: ${error}`);
    hasErrors = true;
  }
});

if (!hasErrors) {
  console.log('✅ No common errors detected in console');
}

console.log('\n🎯 Next steps:');
console.log('1. Check browser console for any new errors');
console.log('2. Enable Google Maps billing if maps still fail');
console.log('3. Test PWA installation on mobile device');
console.log('4. Verify offline functionality');

export {};
