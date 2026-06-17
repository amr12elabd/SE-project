# PopEyez — Event Management Platform

A full-stack event management system built for managing pop-up café events, guest lists, vendor coordination, venue bookings, staff tasks, and real-time notifications.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, Vite, React Router v6, Recharts |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT (JSON Web Tokens) |
| Real-time | Socket.io |
| PDF Export | jsPDF + jspdf-autotable |
| QR Codes | qrcode.react |
| Deployment | Render (backend) · Vercel (frontend) · MongoDB Atlas |

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                    Browser (React)                   │
│  Vite + React Router + Recharts + Socket.io-client   │
└───────────────────┬────────────────────┬─────────────┘
                    │ REST /api/*         │ WebSocket
                    ▼                    ▼
┌─────────────────────────────────────────────────────┐
│              Node.js / Express Server                │
│   JWT Auth Middleware · Role-Based Authorization     │
│   Socket.io Server · REST API Routes                 │
└───────────────────┬─────────────────────────────────┘
                    │ Mongoose ODM
                    ▼
┌─────────────────────────────────────────────────────┐
│                    MongoDB Atlas                     │
│  Users · Events · Venues · Guests · Tasks · Invoices │
│  Bookings · Notifications · Budget · Feedback        │
└─────────────────────────────────────────────────────┘
```

---

## Entity Relationship Overview

```
User (5 roles)
 ├── organizer  ──creates──▶ Event ──has──▶ Task (assigned to staff)
 │                │                 ──has──▶ Guest
 │                │                 ──has──▶ BudgetItem
 │                │                 ──has──▶ Communication
 │                │                 ──has──▶ Feedback
 │                └──requests──▶ BookingRequest ──for──▶ Venue
 │
 ├── staff      ──assigned──▶ Task
 │               ──checks in──▶ Guest
 │
 ├── vendor     ──has──▶ VendorProfile
 │               ──receives──▶ SourcingRequest
 │               ──submits──▶ Invoice
 │
 ├── venueOwner ──owns──▶ Venue
 │               ──responds to──▶ BookingRequest
 │
 └── guest      ──receives──▶ Invitation · Notification
```

---

## User Roles & Features

| Role | Key Features |
|------|-------------|
| **Organizer** | Create/manage events, assign tasks, manage guests, book venues, review invoices (with PDF export), send sourcing requests, view reports (PDF + CSV), budget tracking |
| **Staff** | View assigned tasks with deadlines, check guests in/out, manage vendor arrivals, see floor plan |
| **Vendor** | Manage product catalogue, respond to sourcing requests, submit invoices, track delivery status |
| **Venue Owner** | List venues, review booking requests (approve/counter/decline), view confirmed bookings |
| **Guest** | View invitation, submit feedback, QR code check-in |

---

## Real-time Features (Socket.io)

Events emitted to specific users via private rooms:
- `notification` — sent when a booking is approved/declined, task is assigned, invoice status changes

The frontend receives these and shows an instant toast notification without refreshing the page.

---

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)

### 1. Clone & Install

```bash
git clone https://github.com/amr12elabd/SE-project.git
cd SE-project

cd backend && npm install
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
# backend/.env
cp backend/.env.example backend/.env
# Fill in MONGODB_URI and JWT_SECRET

# frontend/.env  (optional for local dev)
cp frontend/.env.example frontend/.env
```

### 3. Seed the Database

```bash
cd backend
node src/seed/seed.js
```

This creates **16 users** across all roles with realistic events, tasks, guests, venues, invoices, and notifications.

### 4. Run

```bash
# Terminal 1 — backend
cd backend && npm run dev

# Terminal 2 — frontend
cd frontend && npm run dev
```

Open [http://localhost:5173](http://localhost:5173)

---

## Demo Login

All accounts use password: **password123**

| Name | Role | Email |
|------|------|-------|
| Sara Hassan | Organizer | organizer@popeyez.com |
| Rami Adel | Organizer | organizer2@popeyez.com |
| Ahmed Karim | Staff | staff@popeyez.com |
| Nour El-Din | Staff | staff2@popeyez.com |
| Lina Saad | Staff | staff3@popeyez.com |
| Khaled Mansour | Staff | staff4@popeyez.com |
| Atwa's Bakery | Vendor | vendor@popeyez.com |
| Cairo Coffee Supplies | Vendor | vendor2@popeyez.com |
| Nile Equipment | Vendor | vendor3@popeyez.com |
| Nour Floral Design | Vendor | vendor4@popeyez.com |
| SoundWave Productions | Vendor | vendor5@popeyez.com |
| Seifedin Khaled | Venue Owner | venueowner@popeyez.com |
| Layla Nasser | Venue Owner | venueowner2@popeyez.com |
| Tarek Bishara | Venue Owner | venueowner3@popeyez.com |
| Yasmin Ibrahim | Guest | guest@popeyez.com |
| Shady Peter | Guest | shady@popeyez.com |

---

## API Overview

All endpoints are prefixed with `/api`.

| Resource | Endpoint | Auth |
|----------|----------|------|
| Auth | `POST /auth/login` `POST /auth/register` | Public |
| Events | `GET/POST /events` `PUT/DELETE /events/:id` | Organizer |
| Tasks | `GET/POST /tasks` `PUT /tasks/:id` `PATCH /tasks/:id/status` | Organizer/Staff |
| Guests | `GET/POST /guests` `PATCH /guests/:id/checkin` `PATCH /guests/:id/rsvp` | Organizer/Staff |
| Venues | `GET/POST /venues` `PUT /venues/:id` | VenueOwner |
| Bookings | `GET/POST /bookings` `PATCH /bookings/:id/status` | Organizer/VenueOwner |
| Invoices | `GET/POST /invoices` `PATCH /invoices/:id/status` | Vendor/Organizer |
| Sourcing | `GET/POST /sourcing-requests` `PATCH /sourcing-requests/:id/status` | Organizer/Vendor |
| Reports | `GET /events/:id/dashboard` `GET /reports/:id/full` | Organizer |
| Notifications | `GET /notifications` `PATCH /notifications/:id/read` | All |

---

## Deployment

### Backend → Render
1. Connect repo to [render.com](https://render.com)
2. Use `render.yaml` at repo root (auto-detected)
3. Set env vars: `MONGODB_URI`, `JWT_SECRET`, `CLIENT_URL`

### Frontend → Vercel
1. Import repo to [vercel.com](https://vercel.com), set root to `frontend/`
2. Set env vars: `VITE_API_URL`, `VITE_SOCKET_URL`
3. `vercel.json` handles SPA routing automatically

### Database → MongoDB Atlas
1. Create free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Whitelist `0.0.0.0/0` for Render's dynamic IPs
3. Use the connection string as `MONGODB_URI`

---

## Team

| Name | Role | GitHub |
|------|------|--------|
| Amr Wafik | Backend & Architecture | [@amr12elabd](https://github.com/amr12elabd) |
| Mahmoud Ahmed Atwa | Frontend Development | [@ma7moudatwaa](https://github.com/ma7moudatwaa) |
| Seifedin Khaled | Full Stack | [@seifeldin20](https://github.com/seifeldin20) |
| Shady Peter Magdy | Frontend & QR/PDF | [@shadypeterr](https://github.com/shadypeterr) |
