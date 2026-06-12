# PopEyez — Pop-Up Café Event Management Platform

A full-stack event management platform for pop-up café events, built as a Software Engineering university project.

## Project Overview

PopEyez helps **Event Organizers** manage pop-up café events end-to-end — from venue booking, vendor sourcing, guest management, to real-time day-of operations. It supports five user roles, each with a dedicated portal and workflow.

## Tech Stack

| Layer     | Technology                          |
|-----------|-------------------------------------|
| Frontend  | React 18, Vite, React Router v6, Axios, Recharts, qrcode.react |
| Backend   | Node.js, Express.js, REST API       |
| Database  | MongoDB with Mongoose ODM           |
| Auth      | JWT (Bearer token), bcryptjs        |

## User Roles

| Role          | Description |
|---------------|-------------|
| Organizer     | Creates and manages events, books venues, manages staff and vendors |
| Staff         | Assigned to events, completes tasks, handles guest check-in |
| Vendor        | Manages product catalogue, receives sourcing orders, submits invoices |
| Guest         | Views invitations, RSVPs, has QR code for check-in, leaves feedback |
| Venue Owner   | Lists venues, responds to booking requests, views performance reports |

## Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local installation or Docker)
- npm v9+

### 1. Clone and install dependencies

```bash
# Backend
cd backend
npm install
cp .env.example .env

# Frontend
cd ../frontend
npm install
```

### 2. Configure environment

Edit `backend/.env`:
```
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/popeyez
JWT_SECRET=popeyez_super_secret_jwt_key_change_in_production
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 3. Seed the database

```bash
cd backend
npm run seed
```

This creates 9 demo users, 4 Cairo venues, 2 events, and all related data.

### 4. Start both servers

Terminal 1 (backend):
```bash
cd backend
npm run dev
```

Terminal 2 (frontend):
```bash
cd frontend
npm run dev
```

Open **http://localhost:5173**

## Demo Credentials

| Role         | Email                     | Password    |
|--------------|---------------------------|-------------|
| Organizer    | organizer@popeyez.com     | password123 |
| Staff        | staff@popeyez.com         | password123 |
| Staff 2      | staff2@popeyez.com        | password123 |
| Vendor       | vendor@popeyez.com        | password123 |
| Vendor 2     | vendor2@popeyez.com       | password123 |
| Vendor 3     | vendor3@popeyez.com       | password123 |
| Guest        | guest@popeyez.com         | password123 |
| Venue Owner  | venueowner@popeyez.com    | password123 |
| Venue Owner 2| venueowner2@popeyez.com   | password123 |

You can also use the **quick login buttons** on the Login page.

## Project Structure

```
popeyez/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection
│   │   ├── controllers/     # 17 controllers (business logic)
│   │   ├── middleware/       # auth (protect/authorize), errorHandler
│   │   ├── models/          # 15 Mongoose models
│   │   ├── routes/          # 17 route files
│   │   └── seed/            # seed.js with realistic Cairo data
│   ├── server.js
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── api/             # Axios instance + all API calls
│   │   ├── components/      # Shared components (StatusBadge, Toast, etc.)
│   │   ├── context/         # AuthContext
│   │   ├── layouts/         # MainLayout, Sidebar
│   │   └── pages/
│   │       ├── organizer/   # All organizer pages
│   │       ├── staff/       # All staff pages
│   │       ├── vendor/      # All vendor pages
│   │       ├── guest/       # All guest pages
│   │       ├── venue/       # All venue owner pages
│   │       ├── public/      # Landing, Login, Register
│   │       └── shared/      # Profile, Notifications, NotFound
│   ├── index.css            # Design system (CSS variables)
│   ├── vite.config.js       # Proxy /api → localhost:5000
│   └── package.json
├── docs/
│   ├── assumptions.md
│   └── AI-chatlog.md
├── database/
│   ├── schema-notes.md
│   └── seed-data-description.md
└── README.md
```

## Key Features

### Organizer Portal
- Dashboard with charts (Recharts PieChart, BarChart)
- Event CRUD with venue selector and staff assignment
- Venue search with filters (city, area, capacity, price range)
- Booking request tracking with counter-proposal support
- Task management with staff assignment and priority levels
- Staff management (create accounts, view per-staff tasks)
- Budget management with planned vs. actual tracking and alerts
- Drag-and-drop venue layout designer (canvas-based, no library)
- Vendor directory with product catalogue view
- Sourcing requests with dynamic item lists
- Invoice review (approve, reject, mark paid)
- Guest management with dietary/allergy tracking
- Invitation sending with custom messages
- Day-of operations: live check-in, vendor delivery tracking
- Communications to all/specific guests with follow-up for unseen
- Feedback review with sentiment analysis and radar chart
- Multi-tab reports with CSV export

### Staff Portal
- Dashboard with assigned events and pending tasks
- Task management with status updates (Pending → In Progress → Done)
- Guest check-in panel with real-time status
- Vendor arrival tracking with delivery timeline
- Read-only floor plan view (if shared by organizer)

### Vendor Portal
- Profile management with pricing catalogue
- Product catalogue editor (inline edit)
- Incoming sourcing request handling with status flow
- Delivery tracking with delay reporting
- Invoice submission with line items
- Invoice status monitoring

### Guest Portal
- Invitations view with RSVP actions
- QR code display (using qrcode.react library)
- Day-of messages from organizer (auto-refresh every 30s)
- Event feedback submission with star ratings

### Venue Owner Portal
- Venue listings management (create/edit/activate/deactivate)
- Booking request handling (approve/decline/counter-propose)
- Confirmed bookings calendar view
- Venue performance report with charts

## API Endpoints Summary

The backend exposes ~60 REST endpoints:

```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me

GET    /api/events
POST   /api/events
GET    /api/events/:id
PUT    /api/events/:id
DELETE /api/events/:id
GET    /api/events/:id/dashboard

GET    /api/events/:id/budget
POST   /api/events/:id/budget
PUT    /api/events/:id/budget/:itemId
DELETE /api/events/:id/budget/:itemId
PATCH  /api/events/:id/budget/total

GET    /api/events/:id/layout
PUT    /api/events/:id/layout
PATCH  /api/events/:id/layout/share

GET    /api/events/:id/feedback
POST   /api/events/:id/feedback

GET    /api/events/:id/reports/full
GET    /api/events/:id/reports/attendance
GET    /api/events/:id/reports/financial
GET    /api/events/:id/reports/export

GET    /api/events/:id/invitations
POST   /api/events/:id/invitations/send
GET    /api/invitations/guest

GET    /api/events/:id/communications
POST   /api/events/:id/communications
POST   /api/events/:id/communications/follow-up-unseen

GET    /api/venues
POST   /api/venues
GET    /api/venues/:id
PUT    /api/venues/:id
DELETE /api/venues/:id
GET    /api/venues/my-venues
GET    /api/venues/:id/report

GET    /api/bookings
POST   /api/bookings
PATCH  /api/bookings/:id/status

GET    /api/tasks
POST   /api/tasks
PUT    /api/tasks/:id
PATCH  /api/tasks/:id/status
DELETE /api/tasks/:id

GET    /api/vendors
GET    /api/vendors/profile
PUT    /api/vendors/profile

GET    /api/sourcing-requests
POST   /api/sourcing-requests
PATCH  /api/sourcing-requests/:id/status

GET    /api/invoices
POST   /api/invoices
PATCH  /api/invoices/:id/status

GET    /api/guests
POST   /api/guests
PUT    /api/guests/:id
PATCH  /api/guests/:id/rsvp
PATCH  /api/guests/:id/checkin

GET    /api/notifications
PATCH  /api/notifications/:id/read
PATCH  /api/notifications/mark-all-read
```

## Database Models (15)

User, Event, Venue, BookingRequest, Task, BudgetItem, VendorProfile, SourcingRequest, Invoice, Guest, Invitation, Communication, Feedback, Layout, Notification

See `database/schema-notes.md` for full schema details.

## Running Tests

No automated tests are included (see `docs/assumptions.md` for scope decisions). Manual testing can be done using the demo credentials above with the full user journeys described in `docs/assumptions.md`.

## Health Check

```bash
curl http://localhost:5000/api/health
# → {"status":"PopEyez API is running"}
```
