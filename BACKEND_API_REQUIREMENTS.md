# Backend API Requirements for UserManagement

## 📋 **Status: Backend Implementation Required**

The frontend UserManagement component is **fully integrated** but requires backend API endpoints to be functional. Below are the required API endpoints that need to be implemented on the backend.

## 🔗 **Base URL Structure**
All endpoints are prefixed with: `/api/admin/users`

---

## 🚀 **Required API Endpoints**

### 1. **Get Users with Pagination & Filtering**
```
GET /api/admin/users?page=1&limit=10&[filters]
```

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `type` (string): User type filter ('1', '2', '3')
- `activeStatus` (boolean): Active status filter
- `isVerified` (boolean): Verification status filter
- `email` (string): Email filter (partial match)
- `firstName` (string): First name filter (partial match)
- `lastName` (string): Last name filter (partial match)
- `username` (string): Username filter (partial match)
- `phoneNumber` (string): Phone number filter
- `createdAfter` (ISO string): Created after date
- `createdBefore` (ISO string): Created before date
- `lastLoginAfter` (ISO string): Last login after date
- `lastLoginBefore` (ISO string): Last login before date

**Response:**
```json
{
  "success": true,
  "data": {
    "users": [
      {
        "id": "string",
        "firstName": "string",
        "lastName": "string",
        "username": "string",
        "email": "string",
        "phoneNumber": "string",
        "type": "1|2|3",
        "activeStatus": "0|1",
        "isVerified": boolean,
        "createTimestamp": "ISO string",
        "updateTimestamp": "ISO string",
        "lastLoginAt": "ISO string",
        "profileImageUrl": "string",
        "gym": {
          "id": "string",
          "name": "string"
        },
        "subscriptions": [],
        "totalLogins": number,
        "totalSpent": number
      }
    ],
    "pagination": {
      "currentPage": number,
      "totalPages": number,
      "total": number,
      "limit": number
    },
    "stats": {
      "totalUsers": number,
      "activeUsers": number,
      "inactiveUsers": number,
      "verifiedUsers": number,
      "unverifiedUsers": number,
      "regularUsers": number,
      "gymOwners": number,
      "admins": number,
      "newUsersThisMonth": number,
      "avgLoginFrequency": number
    }
  }
}
```

### 2. **Get User by ID**
```
GET /api/admin/users/{id}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "id": "string",
    "firstName": "string",
    "lastName": "string",
    "username": "string",
    "email": "string",
    "phoneNumber": "string",
    "type": "1|2|3",
    "activeStatus": "0|1",
    "isVerified": boolean,
    "createTimestamp": "ISO string",
    "updateTimestamp": "ISO string",
    "lastLoginAt": "ISO string",
    "profileImageUrl": "string",
    "gym": {
      "id": "string",
      "name": "string"
    },
    "subscriptions": [],
    "totalLogins": number,
    "totalSpent": number
  }
}
```

### 3. **Create User**
```
POST /api/admin/users
```

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "username": "string",
  "email": "string",
  "password": "string",
  "phoneNumber": "string",
  "type": "1|2|3",
  "activeStatus": "0|1",
  "isVerified": boolean
}
```

**Response:** User object (same as Get User by ID)

### 4. **Update User**
```
PUT /api/admin/users/{id}
```

**Request Body:**
```json
{
  "firstName": "string",
  "lastName": "string",
  "username": "string",
  "email": "string",
  "phoneNumber": "string",
  "type": "1|2|3",
  "activeStatus": "0|1",
  "isVerified": boolean
}
```

**Response:** Updated user object

### 5. **Delete User**
```
DELETE /api/admin/users/{id}
```

**Response:**
```json
{
  "success": true,
  "message": "User deleted successfully"
}
```

### 6. **Quick Actions**

#### Activate User
```
PATCH /api/admin/users/{id}/activate
```

#### Deactivate User
```
PATCH /api/admin/users/{id}/deactivate
```

#### Verify User
```
PATCH /api/admin/users/{id}/verify
```

#### Unverify User
```
PATCH /api/admin/users/{id}/unverify
```

**Response for all quick actions:** Updated user object

### 7. **Reset User Password**
```
POST /api/admin/users/{id}/reset-password
```

**Request Body (Optional):**
```json
{
  "newPassword": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "temporaryPassword": "string"
  }
}
```

### 8. **Get User Statistics**
```
GET /api/admin/users/stats
```

**Response:**
```json
{
  "success": true,
  "data": {
    "totalUsers": number,
    "activeUsers": number,
    "inactiveUsers": number,
    "verifiedUsers": number,
    "unverifiedUsers": number,
    "regularUsers": number,
    "gymOwners": number,
    "admins": number,
    "newUsersThisMonth": number,
    "avgLoginFrequency": number
  }
}
```

### 9. **Get User Activity**
```
GET /api/admin/users/{id}/activity?days=30
```

**Query Parameters:**
- `days` (number): Number of days to fetch activity for (default: 30)

**Response:**
```json
{
  "success": true,
  "data": {
    "loginHistory": [
      {
        "date": "ISO string",
        "count": number
      }
    ],
    "activitySummary": {
      "totalLogins": number,
      "lastLogin": "ISO string",
      "avgSessionDuration": number,
      "deviceTypes": {
        "desktop": number,
        "mobile": number,
        "tablet": number
      }
    }
  }
}
```

### 10. **Bulk Update Users**
```
PATCH /api/admin/users/bulk-update
```

**Request Body:**
```json
{
  "userIds": ["string"],
  "updates": {
    "firstName": "string",
    "lastName": "string",
    "username": "string",
    "email": "string",
    "phoneNumber": "string",
    "type": "1|2|3",
    "activeStatus": "0|1",
    "isVerified": boolean
  }
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "updated": number,
    "errors": ["string"]
  }
}
```

### 11. **Export Users**
```
GET /api/admin/users/export?format=csv&[filters]
```

**Query Parameters:**
- `format` (string): Export format ('csv' or 'xlsx')
- Same filter parameters as Get Users endpoint

**Response:**
```json
{
  "success": true,
  "data": {
    "downloadUrl": "string"
  }
}
```

### 12. **Send Notification to Users**
```
POST /api/admin/users/notify
```

**Request Body:**
```json
{
  "userIds": ["string"],
  "title": "string",
  "message": "string",
  "type": "info|warning|success|error",
  "actionUrl": "string"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "sent": number,
    "failed": number
  }
}
```

---

## 🔐 **Authentication & Authorization**

All endpoints require:
- **Authentication**: Valid JWT token in Authorization header
- **Authorization**: Admin role required (user.role === 'admin')

**Headers:**
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

---

## 📊 **Database Schema Requirements**

The backend needs to support these user fields:

```sql
-- Users table structure needed
users {
  id: string (primary key)
  firstName: string
  lastName: string
  username: string (unique)
  email: string (unique)
  phoneNumber: string
  type: enum('1', '2', '3') -- 1=user, 2=owner, 3=admin
  activeStatus: enum('0', '1') -- 0=inactive, 1=active
  isVerified: boolean
  createTimestamp: datetime
  updateTimestamp: datetime
  lastLoginAt: datetime
  profileImageUrl: string
  password: string (hashed)
}

-- User activity tracking (optional)
user_activity {
  id: string
  userId: string (foreign key)
  loginDate: date
  deviceType: string
  sessionDuration: number
  ipAddress: string
}
```

---

## 🎯 **Implementation Priority**

### **Phase 1 - Core Functionality:**
1. ✅ GET `/api/admin/users` (with pagination & filtering)
2. ✅ GET `/api/admin/users/{id}`
3. ✅ POST `/api/admin/users`
4. ✅ PUT `/api/admin/users/{id}`
5. ✅ DELETE `/api/admin/users/{id}`

### **Phase 2 - Quick Actions:**
6. ✅ PATCH `/api/admin/users/{id}/activate`
7. ✅ PATCH `/api/admin/users/{id}/deactivate`
8. ✅ PATCH `/api/admin/users/{id}/verify`
9. ✅ PATCH `/api/admin/users/{id}/unverify`

### **Phase 3 - Advanced Features:**
10. ✅ GET `/api/admin/users/stats`
11. ✅ GET `/api/admin/users/{id}/activity`
12. ✅ PATCH `/api/admin/users/bulk-update`
13. ✅ POST `/api/admin/users/notify`

### **Phase 4 - Utilities:**
14. ✅ POST `/api/admin/users/{id}/reset-password`
15. ✅ GET `/api/admin/users/export`

---

## ⚠️ **Current Status**

**Frontend:** ✅ **Complete** - UserManagement component fully implemented
**Backend:** ❌ **Required** - API endpoints need to be implemented

**Next Steps:**
1. Implement the backend API endpoints listed above
2. Test the integration between frontend and backend
3. Deploy and verify full functionality

The frontend will gracefully handle API errors and show loading states until the backend endpoints are ready.
