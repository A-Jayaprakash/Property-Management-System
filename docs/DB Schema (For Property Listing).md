# Database Schema – Property Listing Module

---

## 📦 Table/Collection: `properties`

This table stores details about properties managed by the property manager. It is the core entity for associating units, tenants, and reports.

---

### 🔧 Fields

| Field Name    | Data Type       | Constraints                        | Description                                      |
|---------------|------------------|-------------------------------------|--------------------------------------------------|
| `_id`         | ObjectId / UUID  | Primary Key, Auto-generated         | Unique identifier for the property               |
| `name`        | String           | Required, min 3 characters          | Name of the property                             |
| `address`     | String           | Required                            | Full address of the property                     |
| `locality`    | String           | Optional                            | Area/locality information                        |
| `type`        | Enum (String)    | Required, one of: `Residential`, `Commercial` | Type of property                       |
| `unitCount`   | Integer          | Required, min: 1                    | Total number of units under this property        |
| `createdBy`   | ObjectId (FK)    | Required, references `users._id`    | User who created the property                    |
| `createdAt`   | Date             | Auto-generated                      | Timestamp of creation                            |
| `updatedAt`   | Date             | Auto-updated                        | Timestamp of last update                         |

---

## 🧩 Relationships

- 🔗 `createdBy` → Foreign Key to `users` (Property Manager)
- 🔗 One `property` can have **many** `units`
- 🔗 One `property` can have **many** `tenancies`, `payments`, and `expenses`

---

## 📏 Example Document (MongoDB JSON)

```json
{
  "_id": "60f1e75ec25e4a5eb5ef1e76",
  "name": "Lakshmi Enclave",
  "address": "45 MG Road, Bengaluru",
  "locality": "South Zone",
  "type": "Residential",
  "unitCount": 20,
  "createdBy": "5f87d1a2c2b4f9a3d4c0a8b1",
  "createdAt": "2025-06-26T12:00:00Z",
  "updatedAt": "2025-06-26T12:00:00Z"
}

