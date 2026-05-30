# PropertySync — Property Management System

A full-stack web application for managing properties, units, and tenants. Designed for property managers and administrators to handle the complete lifecycle of rental management, from listing properties to tracking leases and occupancy.

---

## Table of Contents

- [Overview](#overview)
- [Tech Stack](#tech-stack)
- [Features](#features)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Environment Variables](#environment-variables)
- [API Reference](#api-reference)
- [User Roles](#user-roles)
- [Database Schema](#database-schema)
- [Deployment](#deployment)
- [Known Limitations](#known-limitations)

---

## Overview

PropertySync provides three role-based dashboards:

| Role | Access |
|------|--------|
| **Admin** | Full access — manage all properties, units, and tenants |
| **Manager** | Manage properties they created, their units, and tenants |
| **Tenant** | Read-only view of properties; view their own lease info |

Live demo: [https://property-management-system-2.onrender.com](https://property-management-system-2.onrender.com)

---

## Tech Stack

**Backend**
- Node.js + Express.js
- MongoDB Atlas (via Mongoose ODM)
- JWT authentication (1-hour expiry)
- bcrypt password hashing
- express-validator + Joi for input validation

**Frontend**
- Vanilla HTML5, CSS3, JavaScript (no framework)
- FontAwesome 6.0.0 icons
- SessionStorage for auth token persistence

**Infrastructure**
- Docker (Node 18-Alpine)
- Render (cloud deployment)
- MongoDB Atlas (cloud database)

---

## Features

### Authentication
- Register with name, username, email, phone, and password (min 12 characters)
- Login returns a JWT token stored in sessionStorage
- All API routes (except auth) require a valid `Bearer` token
- Expired tokens redirect users back to login

### Property Management
- Create, edit, and delete properties
- Property types: Apartment, House, Condo, Villa, Studio, Penthouse, Commercial
- Managers can only edit/delete their own properties
- Admins can manage all properties

### Unit Management
- Add units to properties with detailed configuration
- Unit types: 1BHK, 2BHK, 3BHK, 4BHK, Studio, Penthouse, Office, Shop, Warehouse
- Track area, floor, rent, security deposit, and maintenance fee
- Amenities: AC, Heating, Balcony, Parking, Storage, Furnished, Wifi, Gym, Pool, etc.
- Configure utilities (electricity, water, gas, internet) as included/separate/shared
- Set lease term constraints (min/max duration, notice period)
- Unit statuses: `available`, `occupied`, `maintenance`, `reserved`
- Soft-delete units (units are deactivated, not permanently removed)
- Real-time statistics: occupancy rate, average rent, unit counts by status

### Tenant Management
- Full tenant lifecycle: create, edit, relocate, extend lease, delete
- Link tenants to a specific unit and property
- Track lease start/end dates with visual expiry warnings (≤30 days)
- Status tracking: Active, Inactive, Pending, Terminated
- Automatic unit status sync when adding or removing tenants
- Filter tenants by status, sort by name/lease date/unit
- Paginated tenant grid (12 per page)
- Expiring lease alerts dashboard

### Dashboard
- Total properties, units, and active tenants at a glance
- Occupancy rate calculation
- Light/Dark theme toggle persisted in sessionStorage

---

## Project Structure

```
Property-Management-System/
├── backend/
│   ├── app.js                    # Express app entry point
│   ├── .env                      # Environment variables
│   ├── package.json
│   ├── controllers/
│   │   ├── propertyController.js
│   │   ├── unitController.js
│   │   └── tenantController.js
│   ├── middlewares/
│   │   └── authMiddleware.js     # JWT verification + role guards
│   ├── models/
│   │   ├── User.js
│   │   ├── Property.js
│   │   ├── Unit.js
│   │   └── Tenant.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── propertyRoutes.js
│   │   ├── unitRoutes.js
│   │   └── tenantRoutes.js
│   ├── utils/
│   │   └── authUtils.js          # Token generation, password hashing
│   └── validators/
│       ├── propertyValidator.js
│       └── tenantValidator.js
├── frontend/
│   ├── login.html
│   ├── register.html
│   ├── home.html                 # Admin/Manager dashboard
│   ├── home-tenant.html          # Tenant dashboard
│   ├── index.html                # Property management
│   ├── unit.html                 # Unit management
│   ├── tenants.html              # Tenant management
│   ├── styles/
│   ├── auth/                     # Shared auth utilities
│   ├── home/                     # Dashboard JS modules
│   ├── home-tenant/              # Tenant dashboard JS modules
│   ├── property/                 # Property page JS modules
│   ├── unit/                     # Unit page JS modules
│   └── tenant/                   # Tenant page JS modules
├── docs/
│   ├── README.md                 # This file
│   ├── SRS.md
│   ├── API and Backend Design.md
│   ├── DB Schema (For Property Listing).md
│   └── diagrams/
├── docker/
│   └── Dockerfile
├── render.yaml
└── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- A MongoDB Atlas account (or local MongoDB instance)

### Local Setup

1. **Clone the repository**
   ```bash
   git clone <repo-url>
   cd Property-Management-System
   ```

2. **Install backend dependencies**
   ```bash
   cd backend
   npm install
   ```

3. **Configure environment variables**

   Create or edit `backend/.env`:
   ```env
   NODE_ENV=development
   PORT=3000
   MONGO_URI=mongodb+srv://<user>:<password>@<cluster>.mongodb.net/?retryWrites=true&w=majority
   JWT_SECRET=your_strong_secret_here
   ```

4. **Start the backend server**
   ```bash
   npm run dev      # development (nodemon)
   npm start        # production
   ```

5. **Open the frontend**

   The backend serves the frontend statically from the `frontend/` folder.
   Visit: [http://localhost:3000](http://localhost:3000)

   > For local development with Live Server, open `frontend/login.html` directly.
   > The `auth/config.js` automatically uses `http://localhost:3000` as the API base when running on localhost.

### Docker

```bash
docker build -f docker/Dockerfile -t propertysync .
docker run -p 3000:3000 \
  -e MONGO_URI="your_mongo_uri" \
  -e JWT_SECRET="your_secret" \
  propertysync
```

---

## Environment Variables

| Variable | Required | Description |
|----------|----------|-------------|
| `NODE_ENV` | Yes | `development` or `production` |
| `PORT` | No | Server port (default: `3000`) |
| `MONGO_URI` | Yes | MongoDB connection string |
| `JWT_SECRET` | Yes | Secret key for signing JWT tokens |

> **Security note:** Never commit `.env` to version control. Use a strong, random `JWT_SECRET` in production (at least 32 characters).

---

## API Reference

All endpoints except `/api/auth/login` and `/api/auth/register` require:
```
Authorization: Bearer <jwt_token>
```

### Auth — `/api/auth`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| POST | `/api/auth/register` | Register a new user | Public |
| POST | `/api/auth/login` | Login and receive JWT | Public |
| GET | `/api/auth` | Get current user | Authenticated |

### Properties — `/api/properties`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/properties` | List properties (role-filtered) | All roles |
| POST | `/api/properties` | Create a property | Admin, Manager |
| PUT | `/api/properties/:id` | Update a property | Admin, Manager (own) |
| DELETE | `/api/properties/:id` | Delete a property | Admin, Manager (own) |

### Units — `/api/units`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/units` | List units (filterable, paginated) | All roles |
| GET | `/api/units/stats` | Unit statistics | All roles |
| GET | `/api/units/search` | Search units | All roles |
| GET | `/api/units/available` | Available units only | All roles |
| GET | `/api/units/property/:propertyId` | Units for a property | All roles |
| GET | `/api/units/:id` | Get unit by ID | All roles |
| POST | `/api/units` | Create a unit | Admin, Manager |
| PUT | `/api/units/:id` | Update a unit | Admin, Manager |
| PATCH | `/api/units/:id/status` | Update unit status | Admin, Manager |
| DELETE | `/api/units/:id` | Soft-delete a unit | Admin, Manager |

**Query parameters for `GET /api/units`:**

| Param | Type | Description |
|-------|------|-------------|
| `property` | ObjectId | Filter by property ID |
| `status` | string | `available` \| `occupied` \| `maintenance` \| `reserved` |
| `type` | string | Unit type (e.g., `2BHK`) |
| `min_rent` | number | Minimum rent filter |
| `max_rent` | number | Maximum rent filter |
| `floor` | number | Floor number filter |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 10) |
| `sort_by` | string | Field to sort by (default: `createdAt`) |
| `sort_order` | string | `asc` \| `desc` (default: `desc`) |

### Tenants — `/api/tenants`

| Method | Endpoint | Description | Access |
|--------|----------|-------------|--------|
| GET | `/api/tenants` | List tenants (filterable, paginated) | Authenticated |
| GET | `/api/tenants/stats` | Tenant statistics | Authenticated |
| GET | `/api/tenants/expiring-leases` | Leases expiring within N days | Authenticated |
| GET | `/api/tenants/unit/:unit` | Tenants by unit number | Authenticated |
| GET | `/api/tenants/unit-id/:unitId` | Tenants by unit ObjectId | Authenticated |
| GET | `/api/tenants/:id` | Get tenant by ID | Authenticated |
| POST | `/api/tenants` | Create a tenant | Authenticated |
| PUT | `/api/tenants/:id` | Update tenant details | Authenticated |
| PATCH | `/api/tenants/:id/relocate` | Move tenant to a new unit | Authenticated |
| PATCH | `/api/tenants/:id/extend-lease` | Extend lease end date | Authenticated |
| DELETE | `/api/tenants/:id` | Delete a tenant | Authenticated |

**Query parameters for `GET /api/tenants`:**

| Param | Type | Description |
|-------|------|-------------|
| `status` | string | `Active` \| `Inactive` \| `Pending` \| `Terminated` |
| `propertyId` | ObjectId | Filter by property |
| `unitId` | ObjectId | Filter by unit |
| `search` | string | Search name, email, phone, unit |
| `sortBy` | string | `fullName` \| `leaseEndDate` \| `assignedUnit` \| `createdAt` |
| `sortOrder` | string | `asc` \| `desc` |
| `page` | number | Page number (default: 1) |
| `limit` | number | Results per page (default: 10, max: 100) |

---

## User Roles

### Admin
- Sees and manages all properties regardless of creator
- Full CRUD on all units and tenants
- Access to all dashboards and statistics

### Manager
- Creates and manages their own properties only
- Full CRUD on units within their properties
- Creates and manages tenants for their units
- Cannot edit or delete properties created by other managers

### Tenant
- Read-only access to properties and units
- Directed to a separate tenant dashboard (`home-tenant.html`)
- Cannot create, edit, or delete any records

---

## Database Schema

### User
```
name          String (min 3 chars)
username      String (unique, min 6 chars)
email         String (unique)
phone         String (10 digits)
password      String (hashed, min 12 chars)
role          "admin" | "manager" | "tenant"
```

### Property
```
name          String (min 3 chars)
address       String
locality      String (optional)
type          "Apartment" | "House" | "Condo" | "Villa" | "Studio" | "Penthouse" | "Commercial"
unitCount     Number (min 1)
createdBy     ObjectId → User
```

### Unit
```
unit_number       String (unique per property)
property          ObjectId → Property
type              "1BHK" | "2BHK" | "3BHK" | "4BHK" | "Studio" | "Penthouse" | "Office" | "Shop" | "Warehouse"
area              Number (sqft/sqm)
floor             Number
rent              Number
security_deposit  Number
maintenance_fee   Number
status            "available" | "occupied" | "maintenance" | "reserved"
amenities         String[] (AC, Parking, Gym, Pool, etc.)
utilities         { electricity, water, gas, internet }
lease_terms       { min_lease_duration, max_lease_duration, notice_period }
is_active         Boolean (soft-delete flag)
created_by        ObjectId → User
```

### Tenant
```
fullName          String
email             String (unique)
phoneNumber       String
assignedUnit      String (unit number display label)
unitId            ObjectId → Unit
propertyId        ObjectId → Property
leaseStartDate    Date
leaseEndDate      Date
status            "Active" | "Inactive" | "Pending" | "Terminated"
monthlyRent       Number
securityDeposit   Number
address           { street, city, state, zipCode, country }
notes             String (max 500 chars)
```

**Computed virtuals on Tenant:**
- `leaseDurationMonths` — duration in months between start and end dates
- `daysRemaining` — days left until lease expiry (negative = expired)

---

## Deployment

The app is deployed on **Render** with a **MongoDB Atlas** database.

### Render Configuration (`render.yaml`)
```yaml
services:
  - type: web
    name: property-management-system
    env: node
    buildCommand: npm install
    startCommand: npm start
    envVars:
      - key: NODE_ENV
        value: production
      - key: MONGO_URI
        sync: false
      - key: JWT_SECRET
        sync: false
```

The backend serves the frontend as static files from the `frontend/` directory, so only one Render service is needed.

---

## Known Limitations

- **No file upload**: Unit images accept URL strings only; no actual file upload is implemented.
- **Relocate uses prompt dialog**: The tenant relocation UI uses a browser `prompt()` for unit entry — a future improvement would be a proper modal with a searchable unit dropdown.
- **Extend lease uses prompt dialog**: Similarly, lease extension uses a browser `prompt()` for month entry.
- **No email notifications**: Expiring lease alerts are only shown in the UI; no automated emails are sent.
- **No tests**: The project currently has no automated test suite (unit, integration, or E2E).
- **Single timezone**: Lease date calculations use the browser's local timezone; multi-timezone support is not implemented.
