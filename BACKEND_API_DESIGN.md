# Backend API Endpoints Design for Attendance System

## Authentication Required
All endpoints require authentication via Bearer token unless specified otherwise.

## Base URL: `/api/attendance`

---

## **1. Check-in/Check-out Operations**

### POST `/api/attendance/checkin/quick`
**Quick Check-in (Location-based)**
```json
{
  "method": "quick_checkin",
  "user_location": {
    "latitude": 28.6139,
    "longitude": 77.2090
  },
  "gym_id": null, // optional, will find nearest subscribed gym if not provided
  "device_info": {
    "device_id": "device123",
    "platform": "android",
    "app_version": "1.0.0"
  }
}
```
**Response:**
```json
{
  "success": true,
  "message": "Checked in successfully",
  "data": {
    "attendance_id": 123,
    "gym": {
      "id": 1,
      "name": "FitZone Gym",
      "address": "123 Main St"
    },
    "check_in_time": "2024-01-15T10:30:00Z",
    "distance_from_gym": 25.5,
    "session_duration_expected": 120
  }
}
```

### POST `/api/attendance/checkin/gym-qr`
**Check-in by Scanning Gym QR Code**
```json
{
  "method": "gym_qr_scan",
  "qr_code": "GYM_1_1641234567",
  "user_location": {
    "latitude": 28.6139,
    "longitude": 77.2090
  },
  "scanned_at": "2024-01-15T10:30:00Z",
  "device_info": {
    "device_id": "device123",
    "platform": "android",
    "camera_used": true
  }
}
```

### POST `/api/attendance/checkin/gym-code`
**Check-in by Gym Unique Code**
```json
{
  "method": "gym_code",
  "unique_code": "123456",
  "user_location": {
    "latitude": 28.6139,
    "longitude": 77.2090
  }
}
```

### POST `/api/attendance/checkin/owner-scan`
**Check-in by Gym Owner Scanning User QR**
```json
{
  "method": "owner_scan_user",
  "user_qr_code": "USER_123_1641234567",
  "gym_id": 1,
  "scanned_by": "owner@gym.com",
  "gym_location": {
    "latitude": 28.6139,
    "longitude": 77.2090
  },
  "notes": "Front desk check-in"
}
```

### POST `/api/attendance/checkout/:attendance_id`
**Check-out from Gym**
```json
{
  "checkout_location": {
    "latitude": 28.6139,
    "longitude": 77.2090
  },
  "session_rating": 5, // optional 1-5 rating
  "session_notes": "Great workout today!" // optional
}
```

### POST `/api/attendance/checkout/quick`
**Quick Check-out (for users with single active session)**
```json
{
  "checkout_location": {
    "latitude": 28.6139,
    "longitude": 77.2090
  }
}
```

---

## **2. Attendance History & Status**

### GET `/api/attendance/active-sessions`
**Get User's Active Sessions**
```json
{
  "success": true,
  "data": [
    {
      "attendance_id": 123,
      "gym": {
        "id": 1,
        "name": "FitZone Gym",
        "address": "123 Main St",
        "current_occupancy": 45,
        "max_occupancy": 100
      },
      "check_in_time": "2024-01-15T10:30:00Z",
      "duration_minutes": 45,
      "check_in_method": "quick_checkin",
      "can_checkout": true
    }
  ]
}
```

### GET `/api/attendance/history`
**Get User's Attendance History**
Query Parameters: `?page=1&limit=20&start_date=2024-01-01&end_date=2024-01-31&gym_id=1&method=quick_checkin`
```json
{
  "success": true,
  "data": {
    "attendances": [
      {
        "id": 123,
        "gym": {
          "id": 1,
          "name": "FitZone Gym"
        },
        "check_in_time": "2024-01-15T10:30:00Z",
        "check_out_time": "2024-01-15T12:00:00Z",
        "duration_minutes": 90,
        "check_in_method": "quick_checkin",
        "distance_from_gym": 25.5,
        "session_rating": 5
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total_pages": 5,
      "total_records": 95
    },
    "stats": {
      "total_visits": 95,
      "total_hours": 142.5,
      "avg_session_duration": 90,
      "favorite_gym": "FitZone Gym",
      "most_used_method": "quick_checkin"
    }
  }
}
```

### GET `/api/attendance/stats`
**Get User's Attendance Statistics**
Query Parameters: `?period=monthly&year=2024&month=1`
```json
{
  "success": true,
  "data": {
    "period": "monthly",
    "total_visits": 12,
    "total_hours": 24.5,
    "avg_session_duration": 122,
    "weekly_breakdown": [
      { "week": 1, "visits": 3, "hours": 6.5 },
      { "week": 2, "visits": 4, "hours": 8.0 }
    ],
    "gym_breakdown": [
      { "gym_name": "FitZone Gym", "visits": 8, "hours": 16.0 },
      { "gym_name": "PowerLift", "visits": 4, "hours": 8.5 }
    ],
    "method_breakdown": [
      { "method": "quick_checkin", "count": 7, "percentage": 58.3 },
      { "method": "gym_qr_scan", "count": 5, "percentage": 41.7 }
    ]
  }
}
```

---

## **3. Gym Management (Owner/Admin APIs)**

### GET `/api/gyms/:gym_id/checkin-methods`
**Get Gym's Check-in Methods Configuration**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "method_type": "quick_checkin",
      "is_enabled": true,
      "requires_location_check": true,
      "max_distance_meters": 50,
      "priority_order": 1,
      "method_name": "Quick Check-in",
      "method_description": "Simple location-based check-in"
    },
    {
      "id": 2,
      "method_type": "gym_qr_scan",
      "is_enabled": true,
      "requires_location_check": true,
      "max_distance_meters": 100,
      "priority_order": 2,
      "method_name": "Scan Gym QR Code"
    }
  ]
}
```

### PUT `/api/gyms/:gym_id/checkin-methods`
**Update Gym's Check-in Methods Configuration**
```json
{
  "methods": [
    {
      "method_type": "quick_checkin",
      "is_enabled": true,
      "requires_location_check": true,
      "max_distance_meters": 75,
      "priority_order": 1
    },
    {
      "method_type": "gym_qr_scan",
      "is_enabled": false
    }
  ]
}
```

### GET `/api/gyms/:gym_id/qr-codes`
**Get Gym's QR Codes**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "qr_code": "GYM_1_1641234567",
      "qr_type": "permanent",
      "is_active": true,
      "usage_count": 245,
      "qr_name": "Main Entrance QR",
      "location_name": "Main Entrance",
      "created_at": "2024-01-01T00:00:00Z"
    }
  ]
}
```

### POST `/api/gyms/:gym_id/qr-codes`
**Create New QR Code for Gym**
```json
{
  "qr_type": "permanent",
  "qr_name": "Secondary Entrance QR",
  "qr_description": "QR code for side entrance",
  "location_name": "Side Entrance",
  "max_usage_count": null,
  "expires_at": null
}
```

### PUT `/api/gyms/:gym_id/qr-codes/:qr_id`
**Update QR Code**
```json
{
  "is_active": false,
  "qr_name": "Disabled Main Entrance QR"
}
```

### GET `/api/gyms/:gym_id/unique-codes`
**Get Gym's Unique Codes**

### POST `/api/gyms/:gym_id/unique-codes`
**Create New Unique Code for Gym**
```json
{
  "code_type": "permanent",
  "code_name": "VIP Access Code",
  "code_description": "Special access code for VIP members",
  "auto_regenerate": false,
  "max_usage_count": 100
}
```

---

## **4. Real-time Gym Status**

### GET `/api/gyms/:gym_id/live-status`
**Get Gym's Real-time Status**
```json
{
  "success": true,
  "data": {
    "gym_id": 1,
    "current_occupancy": 45,
    "max_occupancy": 100,
    "occupancy_percentage": 45,
    "status": "open", // open, closed, maintenance
    "last_updated": "2024-01-15T10:30:00Z",
    "recent_checkins": 12, // last hour
    "peak_hour_today": {
      "hour": 18,
      "occupancy": 85
    },
    "available_methods": [
      "quick_checkin",
      "gym_qr_scan",
      "gym_code"
    ]
  }
}
```

### GET `/api/gyms/nearby`
**Get Nearby Gyms with Check-in Status**
Query Parameters: `?lat=28.6139&lng=77.2090&radius=5000`
```json
{
  "success": true,
  "data": [
    {
      "gym": {
        "id": 1,
        "name": "FitZone Gym",
        "address": "123 Main St",
        "latitude": 28.6145,
        "longitude": 77.2095
      },
      "distance_meters": 125,
      "can_checkin": true,
      "user_has_subscription": true,
      "available_methods": ["quick_checkin", "gym_qr_scan"],
      "current_occupancy": 45,
      "max_occupancy": 100,
      "occupancy_status": "available" // available, busy, full
    }
  ]
}
```

---

## **5. Attendance Reports (Gym Owner/Admin)**

### GET `/api/gyms/:gym_id/attendance-reports`
**Get Gym Attendance Reports**
Query Parameters: `?report_type=daily&start_date=2024-01-01&end_date=2024-01-31`
```json
{
  "success": true,
  "data": {
    "report_type": "daily",
    "date_range": {
      "start_date": "2024-01-01",
      "end_date": "2024-01-31"
    },
    "summary": {
      "total_checkins": 1245,
      "unique_visitors": 398,
      "avg_session_duration": 95,
      "peak_day": "2024-01-15",
      "peak_day_checkins": 67
    },
    "daily_data": [
      {
        "date": "2024-01-01",
        "total_checkins": 42,
        "unique_visitors": 38,
        "avg_session_duration": 88,
        "peak_hour": 18,
        "peak_hour_occupancy": 45
      }
    ],
    "method_breakdown": [
      { "method": "quick_checkin", "count": 678, "percentage": 54.5 },
      { "method": "gym_qr_scan", "count": 345, "percentage": 27.7 },
      { "method": "gym_code", "count": 156, "percentage": 12.5 },
      { "method": "owner_scan_user", "count": 66, "percentage": 5.3 }
    ],
    "hourly_pattern": [
      { "hour": 6, "avg_checkins": 12 },
      { "hour": 7, "avg_checkins": 18 },
      // ... 24 hours
    ]
  }
}
```

### GET `/api/gyms/:gym_id/live-checkins`
**Get Real-time Check-ins (for gym dashboard)**
```json
{
  "success": true,
  "data": {
    "current_checkins": [
      {
        "user": {
          "name": "John Doe",
          "profile_image": "url",
          "membership_type": "Premium"
        },
        "check_in_time": "2024-01-15T10:30:00Z",
        "duration_minutes": 45,
        "check_in_method": "quick_checkin"
      }
    ],
    "recent_checkouts": [
      {
        "user": {
          "name": "Jane Smith",
          "membership_type": "Basic"
        },
        "session_duration": 90,
        "check_out_time": "2024-01-15T10:25:00Z"
      }
    ]
  }
}
```

---

## **6. Location & Validation APIs**

### POST `/api/attendance/validate-location`
**Validate User Location for Check-in**
```json
{
  "user_location": {
    "latitude": 28.6139,
    "longitude": 77.2090
  },
  "gym_id": 1 // optional
}
```
**Response:**
```json
{
  "success": true,
  "data": {
    "is_valid": true,
    "eligible_gyms": [
      {
        "gym_id": 1,
        "name": "FitZone Gym",
        "distance_meters": 25,
        "can_checkin": true,
        "available_methods": ["quick_checkin", "gym_qr_scan"]
      }
    ],
    "location_accuracy": "high", // high, medium, low
    "timestamp": "2024-01-15T10:30:00Z"
  }
}
```

### GET `/api/attendance/qr-codes/:qr_code/validate`
**Validate QR Code**
```json
{
  "success": true,
  "data": {
    "is_valid": true,
    "qr_type": "gym_qr",
    "gym": {
      "id": 1,
      "name": "FitZone Gym",
      "address": "123 Main St",
      "requires_location_check": true,
      "max_distance_meters": 100
    },
    "expires_at": null,
    "usage_count": 245,
    "max_usage_count": null
  }
}
```

---

## **7. User Preferences**

### GET `/api/users/attendance-preferences`
**Get User's Attendance Preferences**
```json
{
  "success": true,
  "data": {
    "default_gym_id": 1,
    "preferred_checkin_method": "quick_checkin",
    "location_sharing_enabled": true,
    "auto_checkin_enabled": false,
    "checkin_notification_enabled": true,
    "checkout_notification_enabled": true,
    "location_accuracy_preference": "medium"
  }
}
```

### PUT `/api/users/attendance-preferences`
**Update User's Attendance Preferences**
```json
{
  "default_gym_id": 2,
  "preferred_checkin_method": "gym_qr_scan",
  "auto_checkin_enabled": true,
  "location_accuracy_preference": "high"
}
```

---

## **8. Error Responses**

### Standard Error Response Format:
```json
{
  "success": false,
  "error": {
    "code": "LOCATION_TOO_FAR",
    "message": "You are too far from the gym to check in",
    "details": {
      "current_distance": 150,
      "max_allowed_distance": 50,
      "nearest_gym": "FitZone Gym"
    }
  },
  "timestamp": "2024-01-15T10:30:00Z"
}
```

### Common Error Codes:
- `LOCATION_TOO_FAR` - User location is outside allowed radius
- `ALREADY_CHECKED_IN` - User already has active session
- `INVALID_QR_CODE` - QR code is invalid or expired
- `INVALID_UNIQUE_CODE` - Unique code is invalid or expired
- `METHOD_NOT_ENABLED` - Check-in method disabled for this gym
- `NO_ACTIVE_SUBSCRIPTION` - User doesn't have active subscription
- `GYM_AT_CAPACITY` - Gym has reached maximum occupancy
- `LOCATION_PERMISSION_DENIED` - User hasn't granted location permission
- `BIOMETRIC_NOT_REGISTERED` - User biometric data not found
- `SESSION_EXPIRED` - User session has expired

---

## **9. WebSocket Events (Real-time Updates)**

### For Gym Owners/Staff:
- `gym_checkin` - New user checked in
- `gym_checkout` - User checked out
- `occupancy_update` - Occupancy count changed
- `method_usage_update` - Check-in method statistics updated

### For Users:
- `checkin_success` - Check-in successful
- `checkout_reminder` - Reminder to check out
- `session_timeout_warning` - Session about to auto-checkout
- `gym_capacity_alert` - Favorite gym nearing capacity

---

## **10. Rate Limiting**

- Check-in operations: 5 requests per minute per user
- Validation endpoints: 10 requests per minute per user
- Reports endpoints: 20 requests per hour per gym owner
- Real-time status: 30 requests per minute per user
