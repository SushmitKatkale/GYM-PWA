# Backend API Response Structure for User Subscriptions

## Endpoint: GET /api/admin/user-subscriptions

The backend should return data in this structure to populate all fields in the frontend:

```json
{
  "success": true,
  "data": {
    "subscriptions": [
      {
        "id": 1,
        "userEmail": "john.doe@example.com",
        "subscriptionId": 15,
        "paymentId": 42,
        "validFrom": "2025-01-01T00:00:00Z",
        "validTo": "2025-02-01T00:00:00Z",
        "activeStatus": true,
        "createdAt": "2025-01-01T10:30:00Z",
        "updatedAt": "2025-01-01T10:30:00Z",
        // Backend-calculated fields
        "status": "active",
        "endDate": "2025-02-01T00:00:00Z",
        "startDate": "2025-01-01T00:00:00Z",
        "price": 1500,
        "paidAmount": 1200,     // This is crucial - the actual amount paid
        "paymentStatus": "completed",
        "paymentGateway": "razorpay",  // This is crucial - shows payment method
        "transactionId": "txn_abc123xyz",
        // User information (joined from users table)
        "user": {
          "id": 123,
          "name": "John Doe",
          "firstName": "John",
          "lastName": "Doe", 
          "email": "john.doe@example.com",
          "phoneNumber": "+91-9876543210"
        },
        // Subscription plan information (joined from subscriptions table)
        "subscription": {
          "id": 15,
          "title": "Premium Monthly Plan",
          "price": 1500,
          "validityDays": 30,
          "description": "Access to all gym facilities",
          "gym": {
            "id": 5,
            "name": "PowerFit Gym",
            "address": "123 Fitness Street",
            "city": "Mumbai",
            "phoneNumber": "+91-9876543211",
            "email": "contact@powerfitgym.com"
          }
        },
        // Gym information (can be separate or same as subscription.gym)
        "gym": {
          "id": 5,
          "name": "PowerFit Gym", 
          "address": "123 Fitness Street",
          "city": "Mumbai",
          "phoneNumber": "+91-9876543211",
          "email": "contact@powerfitgym.com"
        },
        // Payment information (joined from payments table)
        "payment": {
          "id": 42,
          "paymentAmount": 1200,  // Actual amount paid (might be different from plan price due to discounts)
          "status": "completed",
          "gateway": "razorpay",
          "completedAt": "2025-01-01T10:35:00Z",
          "transactionId": "txn_abc123xyz",
          "createdAt": "2025-01-01T10:30:00Z"
        },
        // Additional computed fields for display convenience
        "title": "Premium Monthly Plan",        // Fallback from subscription.title
        "validityDays": 30                     // Fallback from subscription.validityDays
      }
    ],
    "pagination": {
      "total": 150,
      "page": 1,
      "limit": 10,
      "totalPages": 15
    }
  }
}
```

## Key Fields for Frontend Display

### Critical Payment Fields:
- `paidAmount` - The actual amount the user paid (after discounts, taxes, etc.)
- `paymentGateway` or `payment.gateway` - The payment method used
- `paymentStatus` or `payment.status` - Status of the payment transaction
- `transactionId` or `payment.transactionId` - Transaction reference

### User Display Fields:
- `user.name` or `user.firstName` - User's display name
- `user.email` or `userEmail` - User's email address
- `user.phoneNumber` - User's contact number

### Subscription Display Fields:
- `subscription.title` or `title` - Plan name to display
- `subscription.validityDays` or `validityDays` - Plan duration
- `subscription.price` - Original plan price (for reference)

### Gym Information:
- `gym.name` - Gym name
- `gym.city` - Gym location
- `gym.address` - Full gym address

## Backend Implementation Notes

1. **JOIN queries**: The backend should join multiple tables:
   - user_subscriptions (main table)
   - users (for user info)
   - subscriptions (for plan details)
   - payments (for payment info)
   - gyms (for gym details)

2. **Calculated fields**: Backend should compute:
   - `status` based on current date vs validity dates
   - `paidAmount` from the payments table
   - `paymentGateway` from the payments table

3. **Fallback values**: Provide multiple ways to access the same data:
   - Both `subscription.title` and root-level `title`
   - Both `payment.paymentAmount` and root-level `paidAmount`
   - Both `payment.gateway` and root-level `paymentGateway`

## Example SQL Query Structure

```sql
SELECT 
    us.*,
    u.firstName, u.lastName, u.email as user_email, u.phoneNumber as user_phone,
    s.title as subscription_title, s.price as subscription_price, s.validityDays,
    p.paymentAmount as paidAmount, p.status as paymentStatus, 
    p.gateway as paymentGateway, p.transactionId,
    g.name as gym_name, g.city as gym_city, g.address as gym_address
FROM user_subscriptions us
LEFT JOIN users u ON us.userEmail = u.email  
LEFT JOIN subscriptions s ON us.subscriptionId = s.id
LEFT JOIN payments p ON us.paymentId = p.id
LEFT JOIN gyms g ON s.gymId = g.id
WHERE 1=1
-- Add filtering conditions here
ORDER BY us.createdAt DESC
LIMIT ? OFFSET ?;
```

This structure ensures that all fields in the frontend will have data to display, with appropriate fallbacks when primary fields are missing.
