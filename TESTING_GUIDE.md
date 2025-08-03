# Gym Location Features Testing Guide

## 🧪 Testing Overview
This guide will help you systematically test all the location-related features in your Gym Management application.

## 🔧 Prerequisites
1. **Development server running**: `npm run dev` (should be on http://localhost:3001)
2. **Google Maps API Key**: Configured in `.env` file as `VITE_GOOGLE_MAPS_API_KEY`
3. **Browser permissions**: Location access may be required for geolocation features
4. **Internet connection**: Required for Google Maps API calls

## 📱 Test Scenarios

### 1. **Basic Application Access**
#### Steps:
1. Open http://localhost:3001 in your browser
2. Login with any credentials (demo mode)
3. Navigate to "Gym Management" from the sidebar (or "My Gyms" for owners)
4. Click "Add Gym" button

#### Expected Results:
✅ Modal opens with multi-step form
✅ Step 1 (Basic Info) is active
✅ No console errors

---

### 2. **Location Step Navigation**
#### Steps:
1. Fill in basic information in Step 1
2. Click "Next" to reach Step 2 (Location)

#### Expected Results:
✅ Location step displays with:
- Search input field
- Manual address fields (Address, City, State, ZIP)
- Google Map component (if API key is valid)
- Current location detection button

---

### 3. **Google Places Autocomplete Testing**
#### Steps:
1. In the "Search Location" field, type a real address (e.g., "123 Main St, New York")
2. Wait for autocomplete suggestions to appear
3. Select a suggestion from the dropdown

#### Expected Results:
✅ Dropdown appears with place suggestions
✅ Selecting a place automatically populates:
- Address field
- City field  
- State field
- ZIP field
- Map marker updates to new location
- Coordinates display updates

---

### 4. **Current Location Detection**
#### Steps:
1. Click the navigation/location button (📍) in the search input
2. Allow location access when browser prompts
3. Wait for location detection

#### Expected Results:
✅ Browser requests location permission
✅ After allowing, map centers on your current location
✅ Address fields auto-populate with reverse-geocoded address
✅ Coordinates display updates with your location

---

### 5. **Interactive Map Testing**
#### Steps:
1. If map is visible, try clicking on different locations on the map
2. Try dragging the marker to a new position
3. Observe the form updates

#### Expected Results:
✅ Clicking map places marker at clicked location
✅ Dragging marker updates location
✅ Address fields update via reverse geocoding
✅ Coordinates display updates

---

### 6. **Manual Address Entry**
#### Steps:
1. Manually type in the address fields:
   - Address: "456 Test Street"
   - City: "Test City"
   - State: "CA"
   - ZIP: "90210"
2. Proceed to next step

#### Expected Results:
✅ Manual input works normally
✅ Form accepts manually entered data
✅ Can proceed to next step

---

### 7. **Fallback Mode Testing** (If API key is missing/invalid)
#### Steps:
1. Temporarily remove or invalidate the Google Maps API key in `.env`
2. Restart the development server
3. Navigate to the Location step

#### Expected Results:
✅ Shows fallback input component instead of Google Places
✅ Shows warning about Google Maps API not configured
✅ Manual address entry still works
✅ Current location button still works (using browser geolocation only)

---

### 8. **Form Validation & Persistence**
#### Steps:
1. Fill in location information
2. Navigate to Step 3 (Operating Hours)
3. Navigate back to Step 2 (Location)
4. Check if location data is preserved

#### Expected Results:
✅ Location data persists when navigating between steps
✅ Map shows previously selected location
✅ All form fields retain their values

---

### 9. **Complete Gym Creation**
#### Steps:
1. Complete all form steps with location data
2. Click "Create Gym" on the final step
3. Check if gym appears in the gym list

#### Expected Results:
✅ Gym is created successfully  
✅ Location information is saved
✅ Gym appears in the list with correct address

---

### 10. **Edit Existing Gym Location**
#### Steps:
1. Click edit button on an existing gym
2. Navigate to Location step
3. Change the location
4. Update the gym

#### Expected Results:
✅ Current location data loads correctly
✅ Map shows existing location
✅ Can update location successfully
✅ Changes are saved

---

## 🐛 Common Issues & Troubleshooting

### Issue: Map doesn't load
**Possible causes:**
- Invalid Google Maps API key
- API key restrictions (check Google Cloud Console)
- Network connectivity issues

**Solution:**
- Verify API key in `.env` file
- Check browser console for API errors
- Test with a fresh API key

### Issue: Geolocation doesn't work
**Possible causes:**
- Browser blocked location access
- HTTPS required (some browsers)
- Location services disabled

**Solution:**
- Check browser settings for location permissions
- Test in different browsers
- Use HTTPS for production

### Issue: Autocomplete not showing suggestions
**Possible causes:**
- Places API not enabled
- API key lacks Places API permissions
- Typing too fast before API initializes

**Solution:**
- Enable Places API in Google Cloud Console
- Wait a moment after typing before expecting results

### Issue: Address fields not populating
**Possible causes:**
- Reverse geocoding API errors
- Component parsing issues
- Network delays

**Solution:**
- Check console for API errors
- Test with different locations
- Manually fill fields as fallback

---

## 📊 Test Results Checklist

Mark off each feature as you test:

- [ ] Application loads without errors
- [ ] Modal opens and displays location step
- [ ] Google Places autocomplete works
- [ ] Current location detection works
- [ ] Interactive map works (click & drag)
- [ ] Manual address entry works
- [ ] Fallback mode works (without API key)
- [ ] Form data persists between steps
- [ ] Gym creation completes successfully
- [ ] Edit existing gym locations works

---

## 🚀 Performance Notes

- **First load**: Google Maps API loads asynchronously
- **Geolocation**: May take 5-10 seconds for high accuracy
- **Autocomplete**: Shows results after ~1 second of typing
- **Map interactions**: Should be immediate once loaded

---

## 💻 Development Commands

```bash
# Start development server
npm run dev

# Check for TypeScript errors
npm run type-check

# Run linting
npm run lint
```

---

**🎯 Success Criteria**: All location features work smoothly, providing a seamless user experience for gym location input and management.
