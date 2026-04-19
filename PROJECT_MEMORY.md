# BinFlow Project Memory

> Cursor has no memory between sessions. This file is the single source
> of truth. Read it at the start of every session before writing any code.

---

## Project Overview

**Name:** BinFlow — Waste Collection Route & Complaint Intelligence Platform

**Purpose:** Civic-tech platform where citizens report garbage issues,
admins manage and dispatch field workers, and workers resolve complaints.
Solves the real problem of complaints being handled via WhatsApp/calls
with no accountability, no location intelligence, and no status tracking.

**Team:** 2-member B.Tech CSE project (college mini/major project)

**Repo:** https://github.com/Altriors/binflow.git

**Local path:** D:\PROJECTS\binflow\

---

## Tech Stack

| Layer | Choice |
|---|---|
| Frontend | React + Vite, React Router, Axios, React-Leaflet, Recharts, react-hot-toast |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| File uploads | Multer (memoryStorage) + Cloudinary |
| Maps | Leaflet + OpenStreetMap (no API key needed) |
| Styling | Plain CSS (global.css design system, no Tailwind) |

---

## User Roles

| Role | Access |
|---|---|
| citizen | Register, submit complaints, view own complaints, track status |
| admin | View all complaints, update status, assign workers, dispatch trucks, view analytics |
| worker | View assigned complaints, update progress, upload resolution proof |

---

## Folder Structure
D:\PROJECTS\binflow
├── client
│   └── src
│       ├── components
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── PublicOnlyRoute.jsx
│       │   ├── MapPicker.jsx
│       │   └── StatusBadge.jsx
│       ├── context
│       │   └── AuthContext.jsx
│       ├── pages
│       │   ├── HomePage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── NewComplaintPage.jsx
│       │   └── MyComplaintsPage.jsx
│       ├── services
│       │   ├── api.js
│       │   └── complaints.js
│       └── styles
│           └── global.css
└── server
└── src
├── config
│   ├── db.js
│   └── cloudinary.js
├── controllers
│   ├── authController.js
│   ├── complaintController.js
│   └── adminController.js
├── middleware
│   ├── auth.js
│   └── upload.js
├── models
│   ├── User.js
│   ├── Complaint.js
│   └── StatusLog.js
├── routes
│   ├── authRoutes.js
│   ├── complaintRoutes.js
│   └── adminRoutes.js
├── services
│   └── cloudinaryUpload.js
├── utils
│   └── response.js
├── app.js
└── server.js
---

## Environment Variables

**server/.env**

PORT=5000
MONGO_URI=your_atlas_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

**client/.env**
REACT_APP_API_URL=http://localhost:5000

> If MongoDB Atlas password contains @, encode it as %40 in MONGO_URI.
> Never commit .env files. Both are already in .gitignore.

---

## Run Commands

```bash
# Terminal 1 — backend
cd D:\PROJECTS\binflow\server
npm run dev

# Terminal 2 — frontend
cd D:\PROJECTS\binflow\client
npm run dev

# Seed admin account (run only once after server is implemented)
cd D:\PROJECTS\binflow\server
npm run seed:admin
# Creates: admin@binflow.com / admin123
```

- Backend runs on: http://localhost:5000
- Frontend runs on: http://localhost:5173
- Both must run together for full app behavior
- Vite proxy: all /api requests from frontend → http://localhost:5000

---

## MongoDB Collections

### users
name          String   required
email         String   required, unique, lowercase
passwordHash  String   required (never returned in responses)
role          String   enum: citizen | admin | worker, default: citizen
phone         String   optional
ward          String   optional
createdAt     Date     default: now

### complaints
userId            ObjectId  ref: User, required
assignedTo        ObjectId  ref: User
category          String    enum: overflowing_bin | missed_pickup |
roadside_dumping | dead_animal | other
title             String    required
description       String    required
imageUrl          String    (Cloudinary URL)
beforeImageUrl    String
afterImageUrl     String
latitude          Number    required
longitude         Number    required
address           String
ward              String
status            String    enum: reported | assigned | in_progress |
resolved | closed, default: reported
priority          String    enum: low | medium | high, default: medium
resolutionNote    String
dispatchNote      String    admin note when dispatching truck
estimatedArrival  String    ETA set by admin e.g. "30 mins"
createdAt         Date
updatedAt         Date
resolvedAt        Date

### statusLogs
complaintId  ObjectId  ref: Complaint, required
updatedBy    ObjectId  ref: User, required
oldStatus    String
newStatus    String    required
comment      String
timestamp    Date      default: now

---

## API Routes
AUTH
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me                     verifyToken
COMPLAINTS
POST   /api/complaints                  citizen, multipart image upload
GET    /api/complaints/my               citizen, own complaints
GET    /api/complaints/map              admin, lat+lng+status+category only
GET    /api/complaints                  admin, filters: status,category,ward,from,to
GET    /api/complaints/:id              citizen + admin
PATCH  /api/complaints/:id/status       admin + worker
PATCH  /api/complaints/:id/assign       admin
PATCH  /api/complaints/:id/dispatch     admin, truck dispatch
ADMIN
GET    /api/admin/stats                 counts by status
GET    /api/admin/trends                complaints per day last 30 days
GET    /api/admin/categories            count per category
GET    /api/admin/wards                 count per ward

---

## API Response Shape

Every response from the server follows this shape:
```json
{ "success": true, "data": {}, "message": "string" }
```

---

## Complaint Status Flow
reported → assigned → in_progress → resolved → closed

Every status change creates a StatusLog entry.

---

## Dispatch Feature (Truck to Location)

**Flow:**
1. Citizen submits complaint with GPS coordinates
2. Admin sees it on dashboard or map
3. Admin clicks "Dispatch Truck" on the complaint
4. Admin selects a worker, writes a dispatch note, sets ETA
5. Frontend calls PATCH /api/complaints/:id/dispatch
6. Server sets status = "assigned", saves assignedTo + dispatchNote + estimatedArrival
7. StatusLog entry created: comment = "Dispatched: <note>"
8. Worker sees complaint in their queue with coordinates to navigate to
9. Worker updates to "in_progress" when arrived, "resolved" when done

**Complaint model additions for this feature:**
- dispatchNote: String
- estimatedArrival: String

---

## Middleware
verifyToken       Reads Authorization: Bearer <token>
Verifies with JWT_SECRET
Attaches decoded payload to req.user
Returns 401 if missing or invalid
requireRole(...roles)
Checks req.user.role is in roles array
Returns 403 if not authorized

---

## Frontend Pages Built

| Page | Path | Role | Status |
|---|---|---|---|
| Landing / Dashboard | / | all | done |
| Login | /login | public only | done |
| Register | /register | public only | done |
| New Complaint | /complaints/new | citizen | done |
| My Complaints | /complaints/my | citizen | done |
| Admin Dashboard | /admin | admin | not built |
| All Complaints (admin) | /admin/complaints | admin | not built |
| Complaint Detail + Dispatch | /admin/complaints/:id | admin | not built |
| Map Intelligence | /admin/map | admin | not built |
| Worker Queue | /worker | worker | not built |

---

## Frontend Components Built

| Component | Purpose | Status |
|---|---|---|
| Navbar.jsx | Top nav with role-aware links | done |
| ProtectedRoute.jsx | Redirect to /login if not authed | done |
| PublicOnlyRoute.jsx | Redirect to / if already authed | done |
| MapPicker.jsx | Leaflet map with click-to-pin + geolocation | done |
| StatusBadge.jsx | Colored pill for status and priority | done |

---

## CSS Design System (global.css)

Key CSS variables:
--color-primary: #4f7ef8
--color-bg: #f8f9fa
--color-surface: #ffffff
--color-border: #e0e3e8
--color-text: #1a1d23
--color-text-muted: #6b7280
--radius-lg: 16px
--shadow-md: 0 4px 12px rgba(0,0,0,0.08)

Key utility classes:
card           white surface with border + shadow
.form-card      centered auth form card
.form-group     label + input stack
.form-input     styled input
.form-select    styled select with arrow
.btn            base button
.btn-primary    blue filled
.btn-secondary  white outlined
.btn-sm / lg    size variants
.btn-full       100% width
.btn-spinner    loading spinner inside button
.badge          pill label
.badge-{status} color per complaint status
.complaint-card hover card for complaint list
.auth-page      centered full-height auth layout
.loading-spinner animated loading state
.empty-state    centered empty list state
.stats-grid     responsive stats row
.page-wrapper   max-width centered content area

---

## Known Issues Fixed

| Issue | Fix |
|---|---|
| CSS build error: unclosed bracket in .form-select | Replaced %3E/%3C encoded SVG with raw < > in data URL |
| MapPicker build error: default export not found | File was not saved correctly, re-created with export default |
| Leaflet marker icon broken in Vite | delete L.Icon.Default.prototype._getIconUrl + mergeOptions with unpkg URLs |

---

## Git Convention
Branches:
main          stable, milestone releases only
dev           working integration branch
feature/<name> individual features, branch off dev
Commit format:
feat:     new feature
fix:      bug fix
style:    UI/CSS only
refactor: code restructure, no behavior change
chore:    config, deps, tooling

---

## Server Implementation Rules

These rules apply to all server code:
- async/await everywhere, never .then() chains
- All controllers wrapped in try/catch
- Use sendSuccess() and sendError() from utils/response.js
- Never return passwordHash in any response
- Image upload flow: multer memoryStorage → cloudinaryUpload service → save URL in DB
- JWT expires in 7d
- bcryptjs salt rounds: 10
- All protected routes use verifyToken
- Role-restricted routes use requireRole after verifyToken

---

## What Is Done

- [x] Project scaffolded and pushed to GitHub
- [x] Frontend: global.css full design system
- [x] Frontend: Navbar with role-aware links
- [x] Frontend: Auth pages (Login, Register) with form styling
- [x] Frontend: AuthContext with JWT login/register/logout
- [x] Frontend: ProtectedRoute and PublicOnlyRoute
- [x] Frontend: NewComplaintPage with MapPicker + image upload
- [x] Frontend: MyComplaintsPage with complaint cards + status badges
- [x] Frontend: HomePage with dashboard shell + quick actions
- [x] Frontend: Vite proxy /api → localhost:5000
- [x] Server: All files scaffolded (config, controllers, middleware, models, routes, services, utils)
- [x] Server: Dispatch feature added to Complaint model schema

## What Is Next

- [ ] Implement server controllers and middleware (use server prompt above)
- [ ] Run seed:admin and test login with Postman
- [ ] Confirm complaint submission saves to Atlas + Cloudinary
- [ ] Admin dashboard page (stats + full complaint table)
- [ ] Admin complaint detail page with Dispatch Truck UI
- [ ] Worker queue page (assigned complaints list + map)
- [ ] Map intelligence page (all pins with filters)
- [ ] Analytics page (Recharts trends + category breakdown)
- [ ] Phase 2: duplicate complaint detection by nearby radius
- [ ] Phase 2: SLA auto-escalation if complaint unresolved too long
- [ ] Phase 2: Notifications collection

---

## Resume Prompt

Copy this into Cursor at the start of every new session: