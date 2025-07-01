# API Design & Backend Logic – Property Listing Module

---

## 🔌 Base Route
```
/api/properties
```
All routes are protected using JWT authentication middleware. Only authenticated property managers or admins can access these endpoints.

---

## 📥 1. Create a Property

- **Method**: POST  
- **URL**: `/api/properties`  
- **Auth**: ✅ Required

{
  "name": "Lakshmi Enclave",
  "address": "45 MG Road, Bengaluru",
  "locality": "South Zone",
  "type": "Residential",
  "unitCount": 20
}


### Request Body
```json
{
  "name": "Lakshmi Enclave",
  "address": "45 MG Road, Bengaluru",
  "locality": "South Zone",
  "type": "Residential",
  "unitCount": 20
}
```

### Success Response
```json
{
  "message": "Property created successfully",
  "propertyId": "64f1a8d123ab3a4c0a55ef71"
}
```

---

## 📤 2. Get All Properties

- **Method**: GET  
- **URL**: `/api/properties`  
- **Auth**: ✅ Required

### Optional Query Parameters
- `limit=10&skip=0` – pagination
- `type=Residential` – filter by type

### Success Response
```json
[
  {
    "_id": "60f1e75ec25e4a5eb5ef1e76",
    "name": "Lakshmi Enclave",
    "type": "Residential",
    "unitCount": 20
  }
]
```

---

## 📄 3. Get Property by ID

- **Method**: GET  
- **URL**: `/api/properties/:id`  
- **Auth**: ✅ Required

### Success Response
```json
{
  "_id": "60f1e75ec25e4a5eb5ef1e76",
  "name": "Lakshmi Enclave",
  "address": "45 MG Road, Bengaluru",
  "locality": "South Zone",
  "type": "Residential",
  "unitCount": 20,
  "createdBy": "5f87d1a2c2b4f9a3d4c0a8b1"
}
```

---

## 🖊 4. Update Property

- **Method**: PUT  
- **URL**: `/api/properties/:id`  
- **Auth**: ✅ Required

### Request Body (Partial Allowed)
```json
{
  "name": "Lakshmi Enclave",
  "locality": "South Zone"
}
```

### Success Response
```json
{ "message": "Property updated successfully" }
```

---

## ❌ 5. Delete Property

- **Method**: DELETE  
- **URL**: `/api/properties/:id`  
- **Auth**: ✅ Required

### Success Response
```json
{ "message": "Property deleted successfully" }
```

### Conditional Logic
- Check if the property has active tenants or units before allowing deletion.

---

## 🔐 Middleware – `auth.js`

- Validates JWT
- Attaches user info to `req.user`
- Ensures only authorized users can access protected routes

---

## ⚙️ Controller Functions – `propertyController.js`

| Function Name        | Description                                |
|----------------------|--------------------------------------------|
| `createProperty()`   | Handle POST /api/properties                |
| `getProperties()`    | Handle GET /api/properties                 |
| `getPropertyById()`  | Handle GET /api/properties/:id             |
| `updateProperty()`   | Handle PUT /api/properties/:id             |
| `deleteProperty()`   | Handle DELETE /api/properties/:id          |

---

## 📁 Suggested Folder Structure (Node.js)

```
/controllers
    propertyController.js
/models
    Property.js
/routes
    propertyRoutes.js
/validators
    propertyValidator.js
/middlewares
    auth.js
```

---

## ✅ Validation Rules – `propertyValidator.js`

| Field       | Rules                                       |
|-------------|---------------------------------------------|
| `name`      | Required, min 3 chars                       |
| `type`      | Must be one of: Residential, Commercial     |
| `unitCount` | Integer ≥ 1                                 |
| `address`   | Required                                    |

---

## 🧠 Notes

- All API endpoints validate ownership via `createdBy`.
- Centralized error handler returns consistent JSON errors.
- Controllers split logic from route declarations for scalability.
