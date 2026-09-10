# Process Master API - Process Parameters Endpoints

## Overview

The Process Parameters API provides endpoints for managing textile process operational parameters in both super-admin and factory-admin contexts.

## Architecture

- **Super Admin**: Can only create/modify global parameters (factory_id = null)
- **Factory Admin**: Can view global parameters, create/modify factory-specific customizations (factory_id = their factory)
- **Multi-tenant**: Parameters automatically scoped by factory_id

## Super Admin Endpoints

Base URL: `/api/admin/process-master/parameters`

### 1. Get Parameters for a Process
```
GET /process/:processId
```

Returns all global parameters for a process.

**Response:**
```json
[
  {
    "id": "uuid",
    "process_id": "uuid",
    "parameter_code": "MACHINE",
    "parameter_name": "Machine",
    "data_type": "machine",
    "unit": null,
    "is_required": true,
    "display_order": 1,
    "default_value": null,
    "min_value": null,
    "max_value": null,
    "allowed_values": null,
    "help_text": "Select the washing machine to be used",
    "factory_id": null,
    "created_at": "2026-09-10T11:00:00Z",
    "updated_at": "2026-09-10T11:00:00Z"
  }
]
```

### 2. Get Single Parameter
```
GET /:id
```

Get a specific parameter by ID with access control validation.

### 3. Create Parameter
```
POST /
Content-Type: application/json

{
  "process_id": "uuid",
  "parameter_code": "TEMPERATURE",
  "parameter_name": "Temperature",
  "data_type": "temperature",
  "unit": "°C",
  "is_required": true,
  "display_order": 2,
  "min_value": "20",
  "max_value": "90",
  "help_text": "Temperature for the process"
}
```

**Response:** 201 Created with full parameter object

### 4. Update Parameter
```
PUT /:id
Content-Type: application/json

{
  "parameter_name": "Temperature (Updated)",
  "help_text": "Updated help text"
}
```

**Response:** 200 OK with updated parameter

### 5. Delete Parameter
```
DELETE /:id
```

**Response:** 200 OK
```json
{
  "success": true,
  "id": "uuid"
}
```

### 6. Reorder Parameters
```
POST /reorder
Content-Type: application/json

{
  "parameters": [
    { "id": "uuid-1", "display_order": 1 },
    { "id": "uuid-2", "display_order": 2 },
    { "id": "uuid-3", "display_order": 3 }
  ]
}
```

**Response:** 200 OK with reordered parameters list

### 7. Bulk Create Parameters
```
POST /process/:processId/bulk
Content-Type: application/json

{
  "parameters": [
    {
      "parameter_code": "MACHINE",
      "parameter_name": "Machine",
      "data_type": "machine",
      "is_required": true,
      "display_order": 1
    },
    {
      "parameter_code": "INPUT_QTY",
      "parameter_name": "Input Quantity",
      "data_type": "quantity",
      "unit": "kg",
      "is_required": true,
      "display_order": 2
    }
  ]
}
```

**Response:** 201 Created with array of created parameters

## Process Cloning Endpoints

### Clone Global Process for Factory
```
POST /api/admin/process-master/processes/:processId/clone?factoryId=<uuid>
```

**Request:**
```
Authorization: Bearer <jwt-token>
Query Params:
  - processId: UUID of global process to clone
  - factoryId: UUID of factory to clone for
```

**Response:** 201 Created
```json
{
  "process": {
    "id": "new-uuid",
    "name": "Normal Wash (abc12345)",
    "process_code": "WASH-NORM-3942",
    "description": "Customized clone of Normal Wash",
    "factory_id": "factory-uuid",
    "cloned_from_process_id": "original-process-uuid",
    "is_active": true,
    "created_at": "2026-09-10T11:00:00Z"
  },
  "message": "Process cloned successfully. You can now customize the parameters."
}
```

**Errors:**
- 403 Forbidden: Only factory admins can clone, must be their factory
- 404 Not Found: Global process not found
- 400 Bad Request: Factory already has a clone of this process

---

## Supported Data Types

### Basic Types
- `text`: Free text (string)
- `integer`: Whole numbers
- `decimal`: Decimal numbers
- `boolean`: True/False

### Date/Time Types
- `date`: Date picker
- `time`: Time picker
- `duration`: Duration in hours/minutes

### Textile-Specific Types
- `temperature`: °C, °F (unit required)
- `pH`: pH value (0-14)
- `quantity`: Weight in kg, units, etc (unit required)
- `percentage`: 0-100%
- `machine`: Dropdown of available machines
- `recipe`: Dropdown of saved recipes
- `chemical`: Chemical name (dropdown)
- `colour`: Colour code/name
- `shade`: Shade depth specification

### Special Handling
- **`select` type**: Use `allowed_values` array
  ```json
  {
    "data_type": "select",
    "allowed_values": ["Option1", "Option2", "Option3"]
  }
  ```

---

## Access Control

### Super Admin Context
- Can create/modify global parameters (factory_id = null)
- Can read all global parameters
- Cannot access or modify factory-specific parameters

### Factory Admin Context
- Can read global parameters (inherited from super-admin)
- Can read factory-specific parameters (their factory only)
- Can create/modify factory-specific parameters (override global)
- Cannot modify global parameters

### User Context Header Format (Mock)
```json
{
  "userId": "user-uuid",
  "role": "super-admin" | "factory-admin" | "factory-user",
  "factoryId": "factory-uuid or null"
}
```

---

## Error Handling

All endpoints return standard error responses:

```json
{
  "statusCode": 400,
  "message": "Parameter code already exists for this process",
  "error": "BadRequestException"
}
```

Common Status Codes:
- 200: Success
- 201: Created
- 400: Bad Request (validation error)
- 403: Forbidden (access denied)
- 404: Not Found
- 500: Internal Server Error

---

## Multi-Tenant Query Logic

### Get Parameters for Process (Factory Admin Context)
```sql
WHERE (process_id = ? AND factory_id IS NULL)
   OR (process_id = ? AND factory_id = ?)
ORDER BY display_order ASC, parameter_name ASC
```

This returns:
1. All global parameters (inherited)
2. Any factory-specific overrides

Factory-specific parameters can shadow/override global ones with the same code.

---

## Implementation Notes

### Authentication
Currently using mock user context. In production:
1. Implement JWT guard
2. Extract claims from token
3. Pass UserContext to all service methods
4. Validate factory_id against user's assigned factory

### Authorization
- Service layer handles all access control checks
- Controller only extracts user context and passes to service
- ForbiddenException thrown for unauthorized access

### Performance
- Indexed queries on (process_id, factory_id)
- Composite index on (factory_id, process_id, parameter_code)
- Eager loading of process relations when needed

### Database Constraints
- factory_id can be NULL (global) or UUID (factory-specific)
- parameter_code is unique per (process_id, factory_id) combination
- display_order controls UI presentation order
- All timestamps are in UTC

