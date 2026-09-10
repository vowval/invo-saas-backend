# User Management API Documentation

## Overview
The User Management API allows factory admins to create, read, update, and delete user accounts within their subscription plan limits.

## Key Features
- **Subscription Plan Enforcement**: Users cannot create more accounts than allowed by their plan
- **Role-Based Access Control**: Only ADMIN and SUPER_ADMIN can manage users
- **Email Uniqueness**: Prevents duplicate email addresses across the platform
- **Soft Permissions**: ADMIN users cannot delete themselves or other ADMIN users

## Endpoints

### 1. GET /api/users/company/:companyId
Retrieve all users for a specific company

**Access Control:**
- SUPER_ADMIN: Can view users for any company
- ADMIN: Can only view users for their own company  
- STAFF: Forbidden

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "name": "John Doe",
    "email": "john@factory.com",
    "role": "STAFF",
    "createdAt": "2025-01-01T00:00:00Z",
    "updatedAt": "2025-01-01T00:00:00Z"
  }
]
```

### 2. GET /api/users/:id
Retrieve a single user by ID

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@factory.com",
  "role": "STAFF",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### 3. POST /api/users
Create a new user with maxUsers enforcement

**Access Control:**
- SUPER_ADMIN: Can create users for any company
- ADMIN: Can only create users for their own company (up to maxUsers limit)
- STAFF: Forbidden

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@factory.com",
  "password": "SecurePass123",
  "role": "STAFF",
  "companyId": "company-uuid"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "name": "John Doe",
  "email": "john@factory.com",
  "role": "STAFF",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

**Error Responses:**
- `403 Forbidden`: User limit reached for company's subscription plan
  ```json
  {
    "statusCode": 403,
    "message": "User limit reached for this company's plan. Current: 5, Limit: 5. Please upgrade your subscription plan to add more users.",
    "error": "USER_LIMIT_REACHED"
  }
  ```
- `409 Conflict`: Email already in use
  ```json
  {
    "statusCode": 409,
    "message": "Email already in use"
  }
  ```

### 4. PUT /api/users/:id
Update a user (name and role fields only)

**Access Control:**
- SUPER_ADMIN: Can update any user
- ADMIN: Can only update users in their own company
- STAFF: Forbidden

**Request Body:**
```json
{
  "name": "Jane Doe",
  "role": "STAFF"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "name": "Jane Doe",
  "email": "john@factory.com",
  "role": "STAFF",
  "createdAt": "2025-01-01T00:00:00Z",
  "updatedAt": "2025-01-01T00:00:00Z"
}
```

### 5. DELETE /api/users/:id
Delete a user

**Access Control:**
- SUPER_ADMIN: Can delete any user
- ADMIN: Can only delete users in their own company
- STAFF: Forbidden

**Restrictions:**
- Cannot delete yourself
- Cannot delete ADMIN users

**Response:** `200 OK`
```json
{
  "message": "User deleted successfully"
}
```

**Error Responses:**
- `403 Forbidden`: Cannot delete yourself
- `403 Forbidden`: Cannot delete ADMIN users

### 6. GET /api/users/status/company/:companyId
Get company user limit status

**Access Control:**
- SUPER_ADMIN: Can get status for any company
- ADMIN: Can only get status for their own company
- STAFF: Forbidden

**Response:** `200 OK`
```json
{
  "companyId": "uuid",
  "companyName": "Sample Factory",
  "maxUsers": 5,
  "currentUsers": 2,
  "availableSlots": 3,
  "canAddMore": true
}
```

## Authentication
All endpoints require JWT token in Authorization header:
```
Authorization: Bearer <jwt-token>
```

## User Roles
- **SUPER_ADMIN**: Platform administrator, can manage all companies
- **ADMIN**: Factory administrator, can manage users in their company
- **STAFF**: Factory staff, limited access

## Subscription Plan Limits
| Plan | Max Users |
|------|-----------|
| FREE | 1 |
| BASIC | 5 |
| PRO | 20 |
| ENTERPRISE | 1000 |

Admin user counts as 1 towards the limit.

## Error Handling
All errors follow this format:
```json
{
  "statusCode": <http-status>,
  "message": "Human-readable error message",
  "error": "ERROR_CODE" // Optional
}
```

## Implementation Notes

### Key Validation Points
1. **Email Validation**: Email must be unique across platform
2. **Password Requirements**: Min 8 characters (enforced frontend-side)
3. **Role Validation**: Only ADMIN or STAFF values allowed
4. **maxUsers Enforcement**: Checked BEFORE user creation (quota first)
5. **Company Ownership**: ADMIN users can only manage their own company

### Frontend Integration
The User Management UI (`/factory-admin/settings/users`) uses these endpoints:
- `GET /api/users/company/:companyId` - Load user list
- `POST /api/users` - Add new user
- `PUT /api/users/:id` - Edit user
- `DELETE /api/users/:id` - Remove user

### Database Changes
- Added `createdAt` and `updatedAt` timestamp columns to User entity
- Changed `role` column type to PostgreSQL ENUM with values: SUPER_ADMIN, ADMIN, STAFF
- Created index on company_id for faster user lookups (TODO: add if needed)

## Testing Checklist
- [ ] Login as factory admin (BASIC plan: 5 users max)
- [ ] Create 4 staff users (should succeed)
- [ ] Try to add 5th staff user (should fail with USER_LIMIT_REACHED)
- [ ] Edit a staff user's name and role
- [ ] Delete a staff user (should succeed)
- [ ] Try to delete admin user (should fail)
- [ ] Try to delete yourself (should fail)
- [ ] Verify createdAt and updatedAt timestamps are set correctly
