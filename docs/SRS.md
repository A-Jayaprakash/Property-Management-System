# Software Requirements Specification (SRS)

## 1. Introduction

### 1.1 Purpose
This document outlines the Software Requirements Specification for a **Property Management System** designed for property managers to handle units, tenants, tenancy agreements, rental income, and expenses, along with profitability reports.

### 1.2 Intended Audience
- Property Managers
- Internal Admin Staff
- Application Developers
- QA Engineers
- Stakeholders / Clients

### 1.3 Scope
The system will allow:
- CRUD operations for properties, units, managers, and tenants.
- Creation and management of tenancy agreements with document uploads.
- Capturing of rental payments and expenses.
- Generating reports for profitability and expenses.

The system will be deployed for **real-time usage** by property managers and should be highly reliable, secure, and maintainable.

---

## 2. Overall Description

### 2.1 Product Perspective
This is a **standalone web-based application** using a client-server architecture, intended to be accessed through modern browsers.

### 2.2 Product Functions
- Manage property and unit details
- Manage tenant and manager profiles
- Manage tenancy agreements with file uploads
- Record and track rental income and expenses
- Generate downloadable monthly rental slips
- Generate profitability and expense reports

### 2.3 User Characteristics
- Non-technical users (property managers)
- Admin users (business owners or internal staff)

### 2.4 Constraints
- Web-based (responsive design needed)
- Secure file upload (e.g., rental agreements, tenant IDs)
- Local currency support
- Must support multi-property context

### 2.5 Assumptions and Dependencies
- Users have stable internet
- Hosting is done on cloud (e.g., Azure or Render)
- Authentication via email/password initially

---

## 3. Specific Requirements

### 3.1 Functional Requirements
#### Create Entities
- [FR-1] The system shall allow creation and editing of property details.
- [FR-2] The system shall allow entry of property manager details.
- [FR-3] The system shall allow adding units under a property.
- [FR-4] The system shall allow entry of potential tenant details.

#### Tenancy Management
- [FR-5] The system shall allow creation of tenancies by linking tenant and unit.
- [FR-6] The system shall allow uploading of rental agreement and tenant ID.

#### Payments and Expenses
- [FR-7] The system shall allow recording unit-level rental payments.
- [FR-8] The system shall allow recording unit-level expenses.
- [FR-9] The system shall allow recording of property-level common expenses.

#### Reporting
- [FR-10] The system shall generate monthly rental slips for each unit.
- [FR-11] The system shall report unit-level profitability for a given date range.
- [FR-12] The system shall report property-level profitability for a given date range.
- [FR-13] The system shall report category-wise expense breakdown (percentage-wise) per property.

### 3.2 Non-Functional Requirements
- [NFR-1] The system shall respond to user interactions within 2 seconds.
- [NFR-2] The system shall support concurrent access by 20+ users.
- [NFR-3] The system shall ensure secure storage of uploaded files.
- [NFR-4] The system shall be responsive across desktop and mobile devices.
- [NFR-5] The system shall be deployable via CI/CD pipelines.

---

## 4. External Interfaces

### 4.1 User Interface
- Web app with dashboard, forms, and reports.
- Admin panel for tenant and property management.

### 4.2 Database
- Relational schema with entities like Property, Unit, Manager, Tenant, Tenancy, Payments, Expenses.
- Use of foreign keys and indexing for efficient querying.

### 4.3 Hardware Interface
- Standard browser and internet connection.
- Responsive design for desktops, tablets, and phones.

---

## 5. Appendices
- Diagrams: Use Case, ERD (to be added)
- Future enhancements (e.g., reminder notifications, SMS/email alerts)

