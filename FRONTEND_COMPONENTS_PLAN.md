# Frontend Components Plan for Attendance System

## Updates to Existing Components

### 1. QRCodePage.tsx - Enhanced Check-in Interface
**Current:** Basic QR display and scanner
**Updates Needed:**
- Add method selection (Quick, QR Scan, Code Entry, Owner Scan)
- Location validation before check-in
- Support for gym-specific QR codes
- Multiple active sessions display
- Enhanced error handling with specific error types

### 2. QrScanner.tsx - Dual-purpose Scanner
**Current:** Demo QR scanner
**Updates Needed:**
- Support scanning gym QR codes (not just generating user QR)
- Validate scanned QR codes via API
- Handle gym-specific QR validation
- Owner mode for scanning user QR codes

### 3. AttendanceReports.tsx - Enhanced Analytics
**Current:** Basic attendance reports
**Updates Needed:**
- Method breakdown statistics
- Gym-wise attendance analysis
- Location accuracy metrics
- Session duration trends

## New Components Required

### 4. GymCheckInMethods.tsx
```tsx
interface CheckInMethod {
  type: 'quick_checkin' | 'gym_qr_scan' | 'gym_code' | 'owner_scan_user';
  enabled: boolean;
  requiresLocation: boolean;
  maxDistance: number;
  name: string;
  description: string;
}
```

### 5. LocationValidator.tsx
```tsx
// Real-time location validation
// Distance calculation from gym
// Location accuracy display
// Permission handling
```

### 6. GymCodeEntry.tsx
```tsx
// Gym unique code input
// Code validation
// Location check integration
```

### 7. OwnerScanInterface.tsx
```tsx
// Owner/staff interface for scanning user QR codes
// User lookup and validation
// Manual check-in controls
```

### 8. BiometricCheckIn.tsx (Future)
```tsx
// Fingerprint/face scan interface
// Biometric registration flow
// Device compatibility check
```

### 9. AttendanceStats.tsx
```tsx
// Personal attendance statistics
// Streak tracking
// Favorite gyms analysis
// Check-in patterns
```

### 10. GymOccupancyDisplay.tsx
```tsx
// Real-time gym occupancy
// Peak hours indicator
// Capacity alerts
```

## Service Layer Updates

### attendanceService.ts Enhancements
```typescript
class AttendanceService {
  // New methods needed:
  quickCheckIn(location: Location, gymId?: number)
  gymQrCheckIn(qrCode: string, location: Location)
  gymCodeCheckIn(code: string, location: Location)
  ownerScanCheckIn(userQr: string, gymId: number)
  validateLocation(location: Location, gymId?: number)
  validateQrCode(qrCode: string)
  getNearbyGyms(location: Location, radius: number)
  getActiveCheckInMethods(gymId: number)
}
```

## State Management Updates

### attendanceStore.ts Enhancements
```typescript
interface AttendanceState {
  // New state properties:
  nearbyGyms: Gym[];
  availableCheckInMethods: CheckInMethod[];
  locationPermission: 'granted' | 'denied' | 'prompt';
  locationAccuracy: 'high' | 'medium' | 'low';
  currentLocation: Location | null;
  
  // New actions:
  fetchNearbyGyms(location: Location);
  validateLocation(location: Location, gymId?: number);
  updateCheckInMethods(gymId: number);
  setLocationPermission(status: string);
}
```
