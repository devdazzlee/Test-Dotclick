# Admin Account Setup Guide

This guide explains how to create admin accounts in your e-commerce backend system.

## Available Methods

### Method 1: Dedicated Admin Registration Endpoint (Recommended)

Use the dedicated admin registration endpoint to create admin accounts:

**Endpoint:** `POST /api/auth/register/admin`

**Request Body:**
```json
{
  "username": "admin_user",
  "email": "admin@example.com",
  "password": "AdminPass123!",
  "confirmPassword": "AdminPass123!",
  "phone": "+1234567890"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Admin registered successfully",
  "data": {
    "user": {
      "id": "user_id",
      "username": "admin_user",
      "email": "admin@example.com",
      "phone": "+1234567890",
      "profileImage": null,
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

### Method 2: Flexible Registration with Role

Use the flexible registration endpoint to specify any role:

**Endpoint:** `POST /api/auth/register/with-role`

**Request Body:**
```json
{
  "username": "admin_user",
  "email": "admin@example.com",
  "password": "AdminPass123!",
  "confirmPassword": "AdminPass123!",
  "phone": "+1234567890",
  "role": "admin"
}
```

### Method 3: Database Direct Creation

You can also create admin accounts directly in the database:

```javascript
// Using MongoDB shell or Mongoose
const adminUser = new User({
  username: "admin_user",
  email: "admin@example.com",
  password: "AdminPass123!", // Will be automatically hashed
  phone: "+1234567890",
  role: "admin"
});

await adminUser.save();
```

## Password Requirements

Admin passwords must meet the following criteria:
- At least 8 characters long
- Contains at least one uppercase letter
- Contains at least one lowercase letter
- Contains at least one number
- Contains at least one special character

## Admin Privileges

Users with the `admin` role have access to:
- All user management operations
- Product management (create, update, delete)
- Order management and status updates
- System configuration
- Analytics and reporting

## Protecting Admin Routes

Use the `requireAdmin` middleware to protect admin-only routes:

```typescript
import { requireAdmin } from '../middleware/auth';

// Admin-only route
router.get('/admin/users', authenticate, requireAdmin, getUsers);
```

## Security Considerations

1. **Limit Admin Creation**: Consider implementing additional security measures for admin account creation, such as:
   - Requiring a secret key or invitation code
   - Email verification for admin accounts
   - Two-factor authentication

2. **Strong Passwords**: Enforce strong password policies for admin accounts

3. **Audit Logging**: Log all admin actions for security monitoring

4. **Session Management**: Implement proper session management for admin accounts

## Testing Admin Accounts

You can test admin account creation using tools like:
- Thunder Client (VS Code extension)
- Postman
- cURL

Example cURL command:
```bash
curl -X POST http://localhost:3000/api/auth/register/admin \
  -H "Content-Type: application/json" \
  -d '{
    "username": "test_admin",
    "email": "admin@test.com",
    "password": "AdminPass123!",
    "confirmPassword": "AdminPass123!",
    "phone": "+1234567890"
  }'
```

## Default Admin Account

For development purposes, you might want to create a default admin account. You can do this by:

1. Creating a seed script
2. Using the registration endpoints
3. Directly inserting into the database

Remember to change default passwords in production environments!
