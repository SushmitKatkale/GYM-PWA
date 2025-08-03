# Troubleshooting Guide: PWA and Google Maps Issues

## Issues Identified and Fixed

### 1. Service Worker MIME Type Error ❌→✅

**Problem:** Service worker files were being served with incorrect MIME type ('text/html') instead of JavaScript.

**Error:**
```
The script has an unsupported MIME type ('text/html').
Service Worker registration failed: SecurityError
```

**Solution:** Updated `pwaService.ts` to use vite-plugin-pwa's built-in registration system:
- Replaced manual service worker registration with `registerSW` from `virtual:pwa-register`
- This ensures proper MIME type handling and integration with Vite's PWA plugin

### 2. Google Maps Billing Not Enabled ❌

**Problem:** Your Google Maps API key exists but billing is not enabled on your Google Cloud Project.

**Error:**
```
BillingNotEnabledMapError
GEOCODER_GEOCODE: REQUEST_DENIED: The webpage is not allowed to use the geocoder.
```

**Solution Required (Manual):**
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Navigate to Billing → Enable Billing
4. Add a payment method
5. Enable the required APIs:
   - Maps JavaScript API
   - Geocoding API
   - Places API (if using Places features)

### 3. Deprecated Google Maps Marker ⚠️

**Problem:** Using deprecated `google.maps.Marker` instead of the new `google.maps.marker.AdvancedMarkerElement`.

**Current Status:** Added deprecation comment for future migration. The old Marker API still works but shows warnings.

**Future Migration:** Consider upgrading to AdvancedMarkerElement when convenient.

## How to Enable Google Maps Billing

### Step 1: Access Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with your Google account
3. Select your project (or create one if needed)

### Step 2: Enable Billing
1. In the left sidebar, click "Billing"
2. Click "Link a billing account" or "Enable billing"
3. Create a new billing account or select an existing one
4. Add a payment method (credit card)

### Step 3: Enable Required APIs
1. Go to "APIs & Services" → "Library"
2. Search for and enable these APIs:
   - **Maps JavaScript API** (required)
   - **Geocoding API** (for address lookup)
   - **Places API** (for place search)

### Step 4: Set Up API Restrictions (Recommended)
1. Go to "APIs & Services" → "Credentials"
2. Click on your API key
3. Under "API restrictions", select "Restrict key"
4. Choose the APIs you enabled above
5. Under "Website restrictions", add your domains:
   - `http://localhost:3000` (for development)
   - Your production domain

## Testing Your Fixes

### 1. Restart Development Server
```bash
npm run dev
```

### 2. Check Browser Console
- Service Worker should register without MIME type errors
- Google Maps should load without billing errors
- Deprecation warnings about Marker are expected (non-blocking)

### 3. Test Features
- ✅ PWA installation prompt should work
- ✅ Google Maps should display correctly
- ✅ Location selection should work
- ✅ Geocoding (address lookup) should work

## Additional Notes

### Service Worker Registration
The app now uses vite-plugin-pwa's built-in registration system, which:
- Handles MIME types correctly
- Provides better development experience
- Includes automatic update detection
- Works seamlessly with Vite's hot reload

### Google Maps Integration
- Added deprecation comments for future reference
- Included marker library in the loader
- Error handling for API key and billing issues
- Graceful fallbacks for failed geocoding

### PWA Features
- Install prompt with custom UI
- Push notification support (requires server setup)
- Offline capability with workbox caching
- Update notifications for new versions

## Common Issues

### "API key not configured" Error
- Check that `VITE_GOOGLE_MAPS_API_KEY` is set in your `.env` file
- Restart the development server after changing environment variables

### Maps Still Not Loading After Enabling Billing
- Wait 5-10 minutes for billing to propagate
- Clear browser cache and reload
- Check API quotas in Google Cloud Console

### Service Worker Registration Fails
- Check browser console for detailed error messages
- Ensure you're serving from `http://localhost` (not `127.0.0.1`)
- Service workers require HTTPS in production

## Getting Help

If you continue to experience issues:

1. **Check Browser Console:** Look for specific error messages
2. **Verify Environment Variables:** Ensure your `.env` file is properly configured
3. **Google Cloud Console:** Check API quotas and billing status
4. **Network Tab:** Look for failed API requests and their error responses

The most critical step is enabling billing in Google Cloud Console - this will resolve the majority of the Google Maps related errors you're seeing.
