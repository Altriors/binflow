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
| Styling | Plain CSS (global.css design system, Plus Jakarta Sans, animations, no Tailwind) |

---

## User Roles

| Role | Access |
|---|---|
| citizen | Register, submit complaints, view own complaints, track status |
| admin | View all complaints, update status, assign workers, dispatch trucks, view analytics |
| worker | View assigned complaints, update progress, upload resolution proof |

---

## Folder Structure

```
D:\PROJECTS\binflow
├── client
│   └── src
│       ├── components
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── PublicOnlyRoute.jsx
│       │   ├── MapPicker.jsx
│       │   ├── StatusBadge.jsx
│       │   └── TruckAnimation.jsx
│       ├── context
│       │   └── AuthContext.jsx
│       ├── pages
│       │   ├── HomePage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── NewComplaintPage.jsx
│       │   ├── MyComplaintsPage.jsx
│       │   ├── admin
│       │   │   ├── AdminDashboard.jsx
│       │   │   ├── AdminComplaintsPage.jsx
│       │   │   ├── AdminComplaintDetailPage.jsx
│       │   │   └── AdminMapPage.jsx
│       │   └── worker
│       │       ├── WorkerQueuePage.jsx
│       │       └── WorkerComplaintDetailPage.jsx
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
```

---

## Environment Variables

**server/.env**

```
PORT=5000
MONGO_URI=your_atlas_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**client/.env**

```
REACT_APP_API_URL=http://localhost:5000
```

> If MongoDB Atlas password contains @, encode it as %40 in MONGO_URI.
> Never commit .env files. Both are already in .gitignore.

### Windows: `querySrv ECONNREFUSED` (Node cannot resolve `mongodb+srv://`)

On some Windows networks, **Node.js** fails SRV DNS while `nslookup` works. Registration and seeds then fail with `ECONNREFUSED` on `_mongodb._tcp....mongodb.net`.

**Fix (already in repo):**

```bash
cd D:\PROJECTS\binflow\server
npm run mongo:fix-uri    # rewrites MONGO_URI in .env to standard mongodb:// (3 shard hosts)
npm run dev
```

Or in Atlas: **Connect → Drivers** → copy the **non-SRV** connection string (`mongodb://` with comma-separated hosts).

**Local dev without Atlas:** `MONGO_URI=mongodb://127.0.0.1:27017/binflow` (requires MongoDB installed locally).

---

## Run Commands

```bash
# Terminal 1 — backend
cd D:\PROJECTS\binflow\server
npm run dev

# Terminal 2 — frontend
cd D:\PROJECTS\binflow\client
npm run dev

# Seed admin account (run only once)
cd D:\PROJECTS\binflow\server
npm run seed:admin
# Creates: admin@binflow.com / admin123

# Seed worker account (run only once, for dispatch E2E testing)
npm run seed:worker
# Creates: worker@binflow.com / worker123
```

- Backend runs on: http://localhost:5000
- Frontend runs on: http://localhost:5173
- Both must run together for full app behavior
- Vite proxy: all /api requests from frontend → http://localhost:5000

---

## MongoDB Collections

### users
```
name          String   required
email         String   required, unique, lowercase
passwordHash  String   required (never returned in responses)
role          String   enum: citizen | admin | worker, default: citizen
phone         String   optional
ward          String   optional
createdAt     Date     default: now
```

### complaints
```
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
```

### statusLogs
```
complaintId  ObjectId  ref: Complaint, required
updatedBy    ObjectId  ref: User, required
oldStatus    String
newStatus    String    required
comment      String
timestamp    Date      default: now
```

---

## API Routes

```
AUTH
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me                     verifyToken
GET    /api/auth/workers                admin, returns [{ id, name }]

COMPLAINTS
POST   /api/complaints                  citizen, multipart image upload
GET    /api/complaints/my               citizen, own complaints
GET    /api/complaints/assigned         worker, active jobs (assigned + in_progress)
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
```

---

## API Response Shape

Every response from the server follows this shape:

```json
{ "success": true, "data": {}, "message": "string" }
```

---

## Complaint Status Flow

```
reported → assigned → in_progress → resolved → closed
```

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

**Customer geolocation (`utils/geolocation.js`):**
- Tries fast GPS (low accuracy) → `watchPosition` → high accuracy → IP approximate fallback
- Avoids starting with `enableHighAccuracy` (common Windows/desktop timeout cause)
- MapPicker uses this helper; tap map always works as manual fallback

**Truck animation UX:**
- On "Dispatch Truck" submit, overlay opens immediately with `autoStart` (no manual button)
- Phases: arriving → loading → leaving → done, then overlay closes

**Complaint model additions for this feature:**
- dispatchNote: String
- estimatedArrival: String

---

## Middleware

```
verifyToken         Reads Authorization: Bearer <token>
                    Verifies with JWT_SECRET
                    Attaches decoded payload to req.user
                    Returns 401 if missing or invalid

requireRole(...roles)
                    Checks req.user.role is in roles array
                    Returns 403 if not authorized
```

---

## Frontend Pages Built

| Page | Path | Role | Status |
|---|---|---|---|
| Landing / Dashboard | / | all | done |
| Login | /login | public only | done |
| Register | /register | public only | done |
| New Complaint | /complaints/new | citizen | done |
| My Complaints | /complaints/my | citizen | done |
| Admin Dashboard | /admin | admin | done |
| All Complaints (admin) | /admin/complaints | admin | done |
| Complaint Detail + Dispatch | /admin/complaints/:id | admin | done |
| Map Intelligence | /admin/map | admin | done |
| Worker Queue | /worker | worker | done |
| Worker Job Detail | /worker/:id | worker | done |

---

## Frontend Components Built

| Component | Purpose | Status |
|---|---|---|
| Navbar.jsx | Top nav with role-aware links | done |
| ProtectedRoute.jsx | Redirect to /login if not authed | done |
| PublicOnlyRoute.jsx | Redirect to / if already authed | done |
| MapPicker.jsx | Leaflet map with click-to-pin + geolocation (flyTo + errors) | done |
| ComplaintMap.jsx | Read-only map + Google Maps Navigate link | done |
| StatusBadge.jsx | Colored pill for status and priority | done |
| TruckAnimation.jsx | Full-screen truck animation on dispatch (autoStart) | done |

---

## CSS Design System (global.css)

Key CSS variables:
```
--color-primary: #4f7ef8
--color-bg: #f8f9fa
--color-surface: #ffffff
--color-border: #e0e3e8
--color-text: #1a1d23
--color-text-muted: #6b7280
--radius-lg: 16px
--shadow-md: 0 4px 12px rgba(0,0,0,0.08)
```

Key utility classes:
```
.card             white surface with border + shadow
.form-card        centered auth form card
.form-group       label + input stack
.form-input       styled input
.form-select      styled select with arrow
.btn              base button
.btn-primary      blue filled
.btn-secondary    white outlined
.btn-sm / lg      size variants
.btn-full         100% width
.btn-spinner      loading spinner inside button
.badge            pill label
.badge-{status}   color per complaint status
.complaint-card   hover card for complaint list
.auth-page        centered full-height auth layout
.loading-spinner  animated loading state
.empty-state      centered empty list state
.stats-grid       responsive stats row
.page-wrapper     max-width centered content area
```

---

## Known Issues Fixed

| Issue | Fix |
|---|---|
| CSS build error: unclosed bracket in .form-select | Replaced %3E/%3C encoded SVG with raw < > in data URL |
| MapPicker build error: default export not found | File was not saved correctly, re-created with export default |
| Leaflet marker icon broken in Vite | delete L.Icon.Default.prototype._getIconUrl + mergeOptions with unpkg URLs |

---

## Git Convention

```
Branches:
main            stable, milestone releases only
dev             working integration branch
feature/<name>  individual features, branch off dev

Commit format:
feat:      new feature
fix:       bug fix
style:     UI/CSS only
refactor:  code restructure, no behavior change
chore:     config, deps, tooling
```

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

## End-to-End Test Flow (three roles)

Use this checklist after any dispatch/worker changes:

1. **Citizen** — register or login, submit complaint at `/complaints/new` with map pin + photo
2. **Admin** — `admin@binflow.com` / `admin123`, open `/admin/complaints/:id`, select worker from dropdown (requires `npm run seed:worker`), dispatch with note + ETA → truck animation plays
3. **Worker** — `worker@binflow.com` / `worker123`, open `/worker`, see job card, open detail, map shows location, tap In Progress then Resolved

---

## What Is Done

- [x] Project scaffolded and pushed to GitHub
- [x] Frontend: global.css full design system (2025 UI refresh — gradients, glass, animations)
- [x] Frontend: Navbar with role-aware links
- [x] Frontend: Auth pages (Login, Register) with form styling
- [x] Frontend: AuthContext with JWT login/register/logout
- [x] Frontend: ProtectedRoute and PublicOnlyRoute
- [x] Frontend: NewComplaintPage with MapPicker + image upload
- [x] Frontend: MyComplaintsPage with complaint cards + status badges
- [x] Frontend: HomePage with dashboard shell + quick actions
- [x] Frontend: Vite proxy /api → localhost:5000
- [x] Frontend: TruckAnimation auto-plays on dispatch submit
- [x] Frontend: WorkerQueuePage — assigned jobs list with dispatch note + ETA
- [x] Frontend: WorkerComplaintDetailPage — map, status buttons (in_progress / resolved)
- [x] Frontend: Worker routes in App.jsx + Navbar "My Queue"
- [x] Frontend: HomePage worker dashboard stats + quick action
- [x] Server: GET /api/auth/workers (id + name for admin dropdown)
- [x] Server: GET /api/complaints/assigned for worker queue
- [x] Server: Worker-scoped access on getComplaintById + updateStatus
- [x] Server: seed:worker script (worker@binflow.com / worker123)
- [x] Frontend: AdminDashboard with real stats + Recharts analytics
- [x] Frontend: AdminComplaintsPage with filters + complaints table
- [x] Frontend: AdminComplaintDetailPage with dispatch truck UI
- [x] Frontend: AdminMapPage with complaint pins + filters
- [x] Server: All files scaffolded (config, controllers, middleware, models, routes, services, utils)
- [x] Server: All controllers, middleware, models implemented
- [x] Server: Dispatch feature added to Complaint model schema
- [x] Server: authRoutes updated
- [x] Seed script working: admin@binflow.com / admin123
- [x] Full stack working end to end — citizen flow confirmed
- [x] Complaint saved to MongoDB Atlas, image saved to Cloudinary
- [x] Git pushed to main

## What Is Next (Phase 2)

- [ ] Duplicate detection — on citizen submit, haversine check ~100–200 m for open complaints; link or message instead of duplicate
- [ ] SLA escalation — node-cron every few hours; bump priority to high if reported/assigned > 48h
- [ ] Notifications collection
- [x] UI refresh — mesh background, glass cards, gradient buttons, hero landing, role chips
- [ ] Mobile layout pass and testing
- [ ] Worker resolution proof photo upload (optional enhancement)

---

## Resume Prompt

Copy this into Cursor at the start of every new session:

```
Read PROJECT_MEMORY.md fully before doing anything.
Check "What Is Next" and start with the first unchecked item.
Do not touch files marked done unless asked.
```