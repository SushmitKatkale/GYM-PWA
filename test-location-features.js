/**
 * Quick Test Script for Location Features
 * Run this in the browser console to test core functionality
 */

// Test 1: Check if Google Maps API is loaded
function testGoogleMapsAPI() {
  console.log('🗺️ Testing Google Maps API...');
  if (typeof window.google !== 'undefined' && window.google.maps) {
    console.log('✅ Google Maps API is loaded');
    return true;
  } else {
    console.log('❌ Google Maps API is not loaded');
    return false;
  }
}

// Test 2: Check if geolocation is available
function testGeolocation() {
  console.log('📍 Testing Geolocation API...');
  if ('geolocation' in navigator) {
    console.log('✅ Geolocation API is available');
    return true;
  } else {
    console.log('❌ Geolocation API is not available');
    return false;
  }
}

// Test 3: Test current location (with user permission)
function testCurrentLocation() {
  console.log('🎯 Testing current location detection...');
  if (!navigator.geolocation) {
    console.log('❌ Geolocation not supported');
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (position) => {
      console.log('✅ Current location detected:');
      console.log(`   Latitude: ${position.coords.latitude}`);
      console.log(`   Longitude: ${position.coords.longitude}`);
      console.log(`   Accuracy: ${position.coords.accuracy}m`);
    },
    (error) => {
      console.log('❌ Geolocation error:', error.message);
    },
    {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 60000
    }
  );
}

// Test 4: Check if environment variables are loaded
function testEnvironmentVariables() {
  console.log('🔧 Testing environment variables...');
  
  // In Vite, environment variables are available as import.meta.env
  // This won't work in console, but you can check manually
  console.log('Check these in your component:');
  console.log('- import.meta.env.VITE_GOOGLE_MAPS_API_KEY should have your API key');
  console.log('- import.meta.env.VITE_API_BASE_URL should be http://localhost:8080');
}

// Test 5: Validate sample gym data structure
function testSampleData() {
  console.log('📊 Testing sample gym data structure...');
  
  const requiredFields = ['id', 'name', 'address', 'latitude', 'longitude'];
  const sampleGym = {
    id: '1',
    name: 'Test Gym',
    address: '123 Test St',
    latitude: 40.7128,
    longitude: -74.0060
  };

  const isValid = requiredFields.every(field => sampleGym.hasOwnProperty(field));
  
  if (isValid) {
    console.log('✅ Sample gym data structure is valid');
  } else {
    console.log('❌ Sample gym data structure is missing fields');
  }
}

// Main test runner
function runAllTests() {
  console.log('🚀 Running Location Features Test Suite...\n');
  
  testGoogleMapsAPI();
  testGeolocation();
  testEnvironmentVariables();
  testSampleData();
  
  console.log('\n📝 To test current location (requires user permission):');
  console.log('Run: testCurrentLocation()');
  
  console.log('\n🎯 Next Steps:');
  console.log('1. Open the gym management page');
  console.log('2. Click "Add Gym"');
  console.log('3. Navigate to Step 2 (Location)');
  console.log('4. Test the location features manually');
}

// Auto-run tests when script is loaded
runAllTests();

// Export functions for manual testing
window.locationTests = {
  testGoogleMapsAPI,
  testGeolocation,
  testCurrentLocation,
  testEnvironmentVariables,
  testSampleData,
  runAllTests
};
