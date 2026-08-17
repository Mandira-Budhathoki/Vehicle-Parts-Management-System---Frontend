# 🚗 Vehicle Parts Management System — Frontend

<p align="center">
  <img src="https://img.shields.io/badge/React-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB"/>
  <img src="https://img.shields.io/badge/TypeScript-%23007ACC.svg?style=for-the-badge&logo=typescript&logoColor=white"/>
  <img src="https://img.shields.io/badge/Vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white"/>
  <img src="https://img.shields.io/badge/Tailwind_CSS-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white"/>
</p>

> **Frontend for the Vehicle Parts Management System** — A full-stack web platform for managing vehicle parts inventory, staff, customers, sales, and financial reporting.

🔗 **Backend Repo**: [Vehicle-Parts-Management-System-Backend](https://github.com/Mandira-Budhathoki/Vehicle-Parts-Management-System-Backend)

---

## 📌 Project Overview

This is the **React + TypeScript frontend** of a comprehensive Vehicle Parts Management System. The platform serves three types of users — **Admins**, **Staff**, and **Customers** — each with their own dedicated portal and features.

### Key Features by Role

| Role | Features |
|---|---|
| **Admin** | Dashboard, Parts Management, Purchase Invoices, Vendor Management, Staff Management, Financial Reports |
| **Staff** | Staff Dashboard, Point of Sale, Customer Registration & Directory, Appointments, Part Requests, Reviews & Reports |
| **Customer** | Customer Portal, Book Appointments, Purchase History, Part Requests, Loyalty Programme |

---

## 🛠️ Tech Stack

- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios / Fetch API
- **Routing**: React Router DOM
- **State Management**: React Context API

---

## 📁 Project Structure

```
src/
├── pages/
│   ├── admin/
│   │   ├── AdminDashboard.tsx       # Admin overview & analytics
│   │   ├── PartsManagement.tsx      # CRUD for vehicle parts inventory
│   │   ├── PurchaseInvoices.tsx     # Purchase invoice management
│   │   ├── VendorsManagement.tsx    # Vendor/supplier CRUD
│   │   ├── StaffManagement.tsx      # Staff roles & registration
│   │   └── FinancialReports.tsx     # Revenue, sales & financial reports
│   ├── staff/
│   │   ├── StaffDashboard.tsx       # Staff overview
│   │   ├── PointOfSale.tsx          # Sales invoice creation
│   │   ├── CustomerRegistration.tsx # Register new customers
│   │   ├── CustomerDirectory.tsx    # Browse & manage customers
│   │   ├── StaffAppointments.tsx    # Manage bookings
│   │   ├── StaffPartRequests.tsx    # Handle customer part requests
│   │   ├── StaffReports.tsx         # Staff-level reporting
│   │   └── StaffReviews.tsx         # Customer reviews
│   ├── customer/
│   │   ├── CustomerPortal.tsx       # Customer home
│   │   ├── BookAppointment.tsx      # Book a service appointment
│   │   ├── History.tsx              # Purchase & service history
│   │   └── PartRequest.tsx          # Request a specific part
│   └── auth/
│       ├── Login.tsx                # Login page
│       └── Register.tsx             # Self-registration
├── components/                      # Reusable UI components
├── services/                        # API service layer (Axios calls)
├── context/                         # React Context (Auth, Global state)
└── App.tsx                          # Root app with routing
```

---

## ⚙️ Getting Started

### Prerequisites
- **Node.js** (v18+)
- The backend server must be running (see [Backend Repo](https://github.com/Mandira-Budhathoki/Vehicle-Parts-Management-System-Backend))

### Installation & Run

```bash
# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Build for Production

```bash
npm run build
```

---

## 👥 Team

This was a collaborative group project developed as part of a BSc Computing module.

---

## 👩‍💻 Author

**Mandira Budhathoki**
📧 [mandirabudhathoki091@gmail.com](mailto:mandirabudhathoki091@gmail.com)
🔗 [LinkedIn](https://www.linkedin.com/in/mandira-budhathoki-8077a0338/)
🐙 [GitHub](https://github.com/Mandira-Budhathoki)
