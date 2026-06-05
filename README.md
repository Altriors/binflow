# BinFlow — Waste Collection Route & Complaint Intelligence Platform

A civic-tech platform for waste collection complaint management. Citizens report garbage issues with location coordinates and photos, admins dispatch field workers, and workers resolve and close complaints — with a full chronological audit trail and map visibility at every step.

Built as a B.Tech CSE project. Eliminates unorganized WhatsApp threads and phone calls, ensuring that civic issues are resolved with accountability and verified proofs.

---

## Key Features

<<<<<<< HEAD
- Citizens submit complaints with GPS coordinates and an image
- Admins see all complaints on a live map, assign workers, and dispatch trucks with ETA
- Workers get a queue of assigned complaints with location and navigation to resolve on-site
- Every status change is logged — nothing falls through the cracks
- Admins can view trends, complaint categories, and ward-level analytics
=======
- **Citizen Dashboard**: Report issues with GPS-coordinates map pinning, categorization, priority, and original photo upload. Track reported tickets on an interactive timeline modal.
- **Admin Command Center**: View all active reported issues on a fullscreen map, dispatch trucks with specific work instructions, monitor worker ETAs, and evaluate ward-level analytics.
- **Worker dispatch queue**: Responsive lists of assigned tasks showing GPS locations, Google Maps directions, and dispatch instructions.
- **Resolution Proof Uploads**: Requires field workers to upload an image proof (to Cloudinary) and document resolution comments when resolving tickets.
- **Audit logs / Chronological history**: Complete audit trails showing details of status changes, notes/comments, actors, and precise timestamps.
- **Eco-Dark SaaS Theme**: Responsive UI layout supporting Dark Mode and Light Mode toggles with glassmorphic elements and micro-animations.
>>>>>>> aa596f5 (feat: complete Phase 6 implementation (Worker Resolution Photo Proof uploads, Before/After image comparison, Profile modification page, secure logout, and detailed chronological activity logs audit trail))

---

## Tech Stack

| Layer | Choice |
|---|---|
<<<<<<< HEAD
| citizen | Register, submit complaints, track status of own complaints |
| admin | View all complaints, assign workers, dispatch trucks, view analytics and map |
| worker | View assigned complaints, navigate to location, update progress |

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite, React Router, Axios, Framer Motion, react-countup |
| Maps | React-Leaflet + OpenStreetMap (no API key needed) |
| Charts | Recharts |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs |
| File uploads | Multer + Cloudinary |
| Styling | Plain CSS (global.css + citizen.css, Plus Jakarta Sans, no Tailwind) |
=======
| Frontend | React + Vite (v6), React Router, Axios |
| Maps | Leaflet + OpenStreetMap (no API key needed) |
| Charts | Recharts |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| File uploads | Multer (memoryStorage) + Cloudinary |
| Styling | Tailwind CSS v4 (with `@tailwindcss/vite` plugin), Framer Motion, and Lucide React |
>>>>>>> aa596f5 (feat: complete Phase 6 implementation (Worker Resolution Photo Proof uploads, Before/After image comparison, Profile modification page, secure logout, and detailed chronological activity logs audit trail))

---

## Folder Structure

```
binflow/
├── client/
<<<<<<< HEAD
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx
│       │   ├── ProtectedRoute.jsx
│       │   ├── PublicOnlyRoute.jsx
│       │   ├── MapPicker.jsx
│       │   ├── ComplaintMap.jsx
│       │   ├── StatusBadge.jsx
│       │   ├── TruckAnimation.jsx
│       │   ├── map/
│       │   │   ├── MapInvalidateSize.jsx
│       │   │   └── MapLoader.jsx
│       │   └── citizen/
│       │       ├── CitizenShell.jsx
│       │       ├── AnimatedCard.jsx
│       │       ├── AnimatedButton.jsx
│       │       ├── AnimatedCounter.jsx
│       │       ├── PageTransition.jsx
│       │       ├── FloatingBackground.jsx
│       │       └── SuccessModal.jsx
│       ├── utils/
│       │   ├── geolocation.js
│       │   └── leafletIcons.js
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── NewComplaintPage.jsx
│       │   ├── MyComplaintsPage.jsx
│       │   ├── admin/
│       │   │   ├── AdminDashboard.jsx
│       │   │   ├── AdminComplaintsPage.jsx
│       │   │   ├── AdminComplaintDetailPage.jsx
│       │   │   └── AdminMapPage.jsx
│       │   └── worker/
│       │       ├── WorkerQueuePage.jsx
│       │       └── WorkerComplaintDetailPage.jsx
│       ├── services/
│       │   ├── api.js
│       │   └── complaints.js
│       └── styles/
│           ├── global.css
│           └── citizen.css
└── server/
    ├── scripts/
    │   ├── seedAdmin.js
    │   ├── seedWorker.js
    │   └── fixMongoUri.js
    └── src/
        ├── config/
        │   ├── db.js
        │   └── cloudinary.js
        ├── controllers/
        │   ├── authController.js
        │   ├── complaintController.js
        │   └── adminController.js
        ├── middleware/
        │   ├── auth.js
        │   └── upload.js
        ├── models/
        │   ├── User.js
        │   ├── Complaint.js
        │   └── StatusLog.js
        ├── routes/
        │   ├── authRoutes.js
        │   ├── complaintRoutes.js
        │   └── adminRoutes.js
        ├── services/
        │   └── cloudinaryUpload.js
        ├── utils/
        │   └── response.js
        ├── app.js
        └── server.js
=======
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx              # Responsive navigation bar
│   │   │   ├── Sidebar.jsx             # Collapsible SaaS navigation sidebar
│   │   │   ├── ProtectedRoute.jsx      # Role-based route protectors
│   │   │   ├── PublicOnlyRoute.jsx     # Auth-guest route filters
│   │   │   ├── MapPicker.jsx           # Coordinate picker map
│   │   │   ├── ComplaintMap.jsx        # Detail markers coordinates map
│   │   │   ├── StatusBadge.jsx         # Custom Tailwind v4 status/priority badges
│   │   │   ├── TruckAnimation.jsx      # Animated CSS dispatch truck
│   │   │   ├── map/
│   │   │   │   ├── MapInvalidateSize.jsx
│   │   │   │   └── MapLoader.jsx
│   │   │   └── citizen/
│   │   │       ├── CitizenShell.jsx
│   │   │       ├── AnimatedCard.jsx
│   │   │       ├── AnimatedButton.jsx
│   │   │       ├── AnimatedCounter.jsx
│   │   │       ├── PageTransition.jsx
│   │   │       ├── FloatingBackground.jsx
│   │   │       └── SuccessModal.jsx
│   │   ├── utils/
│   │   │   ├── geolocation.js
│   │   │   └── leafletIcons.js
│   │   ├── context/
│   │   │   ├── AuthContext.jsx         # JWT validation & user details synchronization
│   │   │   └── ThemeContext.jsx        # Dark/Light mode preferences trigger
│   │   ├── pages/
│   │   │   ├── HomePage.jsx            # Redesigned hero landing
│   │   │   ├── LoginPage.jsx           # Glassmorphic entry forms
│   │   │   ├── RegisterPage.jsx        # Glassmorphic citizen signup
│   │   │   ├── ProfilePage.jsx         # Profile settings name, phone, ward updates & logout
│   │   │   ├── NewComplaintPage.jsx    # Complaint reporting uploader
│   │   │   ├── MyComplaintsPage.jsx    # Ticket tracking timeline modal
│   │   │   ├── admin/
│   │   │   │   ├── AdminDashboard.jsx  # KPI widgets and trends charts
│   │   │   │   ├── AdminComplaintsPage.jsx # Complaints data tables with filters
│   │   │   │   ├── AdminComplaintDetailPage.jsx # Dispatch panel & timeline log audit
│   │   │   │   └── AdminMapPage.jsx    # Fullscreen interactive maps filters
│   │   │   └── worker/
│   │   │       ├── WorkerQueuePage.jsx # Active & completed assignments records list
│   │   │       └── WorkerComplaintDetailPage.jsx # Inline resolution forms & Before/After photo comparison
│   │   ├── services/
│   │   │   ├── api.js                  # Axios interceptor setups
│   │   │   └── complaints.js           # API backend mappings
│   │   └── styles/
│   │       ├── global.css              # Overhauled Tailwind CSS v4 styles
│   │       ├── legacy.css              # Scoped CSS selectors fallback
│   │       └── citizen.css
│   └── package.json
└── server/
    ├── scripts/
    │   ├── seedAdmin.js            # Initial admin seed script
    │   ├── seedWorker.js           # Initial worker seed script
    │   └── fixMongoUri.js          # MongoDB URI sanitizer helper
    ├── src/
    │   ├── config/
    │   │   ├── db.js                   # Mongoose connection config
    │   │   └── cloudinary.js           # Cloudinary credentials config
    │   ├── controllers/
    │   │   ├── authController.js       # Authentication log, register, and profile updates
    │   │   ├── complaintController.js  # Complaint operations & status patching
    │   │   └── adminController.js      # Dashboard aggregation reports
    │   ├── middleware/
    │   │   ├── auth.js                 # Authentication verify tokens & role authorizations
    │   │   └── upload.js               # Multer image upload constraints
    │   ├── models/
    │   │   ├── User.js                 # Citizen/Admin/Worker collection schema
    │   │   ├── Complaint.js            # Complaint collection schema
    │   │   └── StatusLog.js            # Chronological audit collection schema
    │   ├── routes/
    │   │   ├── authRoutes.js           # Auth endpoint paths
    │   │   ├── complaintRoutes.js      # Complaints endpoint paths
    │   │   └── adminRoutes.js          # Analytics aggregation paths
    │   ├── services/
    │   │   └── cloudinaryUpload.js     # Cloudinary buffer upload streams
    │   ├── utils/
    │   │   └── response.js
    │   ├── app.js
    │   └── server.js
    └── package.json
>>>>>>> aa596f5 (feat: complete Phase 6 implementation (Worker Resolution Photo Proof uploads, Before/After image comparison, Profile modification page, secure logout, and detailed chronological activity logs audit trail))
```

---

## API Reference

### Auth Endpoint Routes

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | Public | Citizen registrations |
| POST | `/api/auth/login` | Public | Auth login & JWT generation |
| GET | `/api/auth/me` | Authenticated | Fetch active logged-in user profile details |
| PUT | `/api/auth/profile` | Authenticated | Modify user profile name, phone, and ward |
| GET | `/api/auth/workers` | Admin | Fetch registered workers for dispatch overlays |

### Complaints Endpoint Routes

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/complaints` | Citizen | Submit a complaint (multipart upload) |
| GET | `/api/complaints/my` | Citizen | Retrieve citizen-submitted complaints list |
| GET | `/api/complaints/assigned` | Worker | Fetch tasks assigned to the worker (active & completed) |
| GET | `/api/complaints` | Admin | Retrieve all complaints with query filters |
| GET | `/api/complaints/map` | Admin | Retrieve minimal coordinates & status list for maps |
| GET | `/api/complaints/:id` | Authenticated | Retrieve complete ticket details + timeline logs |
| PATCH | `/api/complaints/:id/status` | Admin, Worker | Update status (multer upload for worker resolutions) |
| PATCH | `/api/complaints/:id/assign` | Admin | Manually link worker assignee to complaint |
| PATCH | `/api/complaints/:id/dispatch` | Admin | Dispatch worker, set work instructions & ETA |

### Admin Analytics routes

| Method | Route | Returns |
|---|---|---|
| GET | `/api/admin/stats` | Complaint aggregate counts by status |
| GET | `/api/admin/trends` | 30-day chronological daily ticket volume |
| GET | `/api/admin/categories` | Count distributions per complaint category |
| GET | `/api/admin/wards` | Count distributions per geographic ward zone |

---

## Getting Started

### Prerequisites

- Node.js v18+
- MongoDB Atlas cluster
- Cloudinary credentials

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/Altriors/binflow.git
   cd binflow
   ```

2. Setup backend variables in `server/.env`:
   ```env
   PORT=5000
   MONGO_URI=your_mongodb_atlas_connection_string
   JWT_SECRET=your_jwt_signing_key
   CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
   CLOUDINARY_API_KEY=your_cloudinary_api_key
   CLOUDINARY_API_SECRET=your_cloudinary_api_secret
   ```

3. Setup frontend variables in `client/.env`:
   ```env
   VITE_API_URL=http://localhost:5000
   ```

4. Launch services:
   ```bash
   # Start backend API (Terminal 1)
   cd server
   npm install
   npm run dev

   # Start frontend UI (Terminal 2)
   cd client
   npm install
   npm run dev
   ```

5. Seed initial accounts:
   ```bash
   # Seed default admin (admin@binflow.com / admin123)
   cd server
   npm run seed:admin

<<<<<<< HEAD
```bash
# Terminal 1 — backend
cd server
npm install
npm run dev

# Terminal 2 — frontend
cd client
npm install
npm run dev
```

Backend runs on `http://localhost:5000`  
Frontend runs on `http://localhost:5173`  
Vite proxies all `/api` requests to the backend — both must run together.

### Seed accounts

Run these once after the server is up:

```bash
cd server

# Creates admin@binflow.com / admin123
npm run seed:admin

# Creates worker@binflow.com / worker123
npm run seed:worker
```

### Windows: MongoDB connection issue

On some Windows networks, Node.js fails to resolve `mongodb+srv://` URIs. If you see `querySrv ECONNREFUSED`, run:

```bash
cd server
npm run mongo:fix-uri
```

This rewrites the `MONGO_URI` in your `.env` from the SRV format to a standard `mongodb://` connection string with individual hosts. Alternatively, copy the non-SRV connection string directly from Atlas under **Connect > Drivers**.

---

## API reference

### Auth

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | authenticated |
| GET | `/api/auth/workers` | admin — returns worker list for dispatch dropdown |

### Complaints

| Method | Route | Access |
|---|---|---|
| POST | `/api/complaints` | citizen (multipart, image upload) |
| GET | `/api/complaints/my` | citizen |
| GET | `/api/complaints/assigned` | worker — active jobs (assigned + in_progress) |
| GET | `/api/complaints` | admin (filters: status, category, ward, date range) |
| GET | `/api/complaints/map` | admin (lat, lng, status, category only) |
| GET | `/api/complaints/:id` | citizen (own), admin, worker (assigned only) |
| PATCH | `/api/complaints/:id/status` | admin + worker |
| PATCH | `/api/complaints/:id/assign` | admin |
| PATCH | `/api/complaints/:id/dispatch` | admin |

### Admin analytics

| Method | Route | Returns |
|---|---|---|
| GET | `/api/admin/stats` | complaint counts by status |
| GET | `/api/admin/trends` | complaints per day, last 30 days |
| GET | `/api/admin/categories` | count per category |
| GET | `/api/admin/wards` | count per ward |

All responses follow this shape:

```json
{ "success": true, "data": {}, "message": "string" }
```

---

## Complaint lifecycle
=======
   # Seed default worker (worker@binflow.com / worker123)
   npm run seed:worker
   ```

---

## Complaint Lifecycle Flow
>>>>>>> aa596f5 (feat: complete Phase 6 implementation (Worker Resolution Photo Proof uploads, Before/After image comparison, Profile modification page, secure logout, and detailed chronological activity logs audit trail))

```
reported → assigned → in_progress → resolved → closed
```

1. **reported**: Submitted by citizen (GPS pin coordinates + original photo).
2. **assigned**: Dispatched by admin to worker (dispatch instructions + ETA logs).
3. **in_progress**: Worker marks as progress active upon arrival on site.
4. **resolved**: Worker uploads resolution photo proof and description note.
5. **closed**: Reviewed and officially archived by an administrator.

---

## Git Conventions

<<<<<<< HEAD
1. Citizen submits a complaint with GPS coordinates and an image
2. Admin sees it on the dashboard or map
3. Admin opens the complaint, selects a worker from the dropdown, writes a dispatch note, sets an ETA
4. Status moves to `assigned`, worker is linked, note and ETA are saved, truck animation plays
5. Worker sees the complaint in their queue with the dispatch note and coordinates
6. Worker opens the job detail, uses the Google Maps link to navigate, marks it `in_progress` on arrival
7. Worker marks it `resolved` when done

---

## Test accounts

| Role | Email | Password |
|---|---|---|
| Admin | admin@binflow.com | admin123 |
| Worker | worker@binflow.com | worker123 |
| Citizen | register at /register | — |

---

## Complaint categories

`overflowing_bin` | `missed_pickup` | `roadside_dumping` | `dead_animal` | `other`

---

## Git conventions

```
main            stable, milestone releases only
dev             working integration branch
feature/<name>  individual features, branch off dev
```

Commit format: `feat:` / `fix:` / `style:` / `refactor:` / `chore:`

---

## What's built

- Full authentication with role-based access across three roles
- Citizen complaint submission with live map pin, geolocation, and image upload
- Multi-step geolocation — GPS, watchPosition fallback, IP approximate fallback
- My Complaints page with complaint cards and status tracking
- Admin dashboard with real stats and Recharts analytics (trends, categories, wards)
- Admin complaints table with filters by status, category, ward, and date range
- Admin complaint detail page with dispatch truck UI and animated truck overlay
- Admin map page with complaint pins and filters
- Worker queue page with assigned jobs, dispatch note, and ETA
- Worker complaint detail page with read-only map and Google Maps navigation link
- Worker status buttons — in_progress on arrival, resolved when done
- Full backend: models, controllers, middleware, routes, Cloudinary image storage
- Seed scripts for admin and worker accounts
- Windows MongoDB fix script for SRV DNS failures

## What's planned

- Duplicate complaint detection — haversine check on submit, ~100–200 m radius
- SLA auto-escalation — node-cron job, priority bumped to high after 48h unresolved
- Worker resolution proof photo upload
- Notifications collection
- Mobile layout pass and device testing

---

## Notes

- `.env` files are gitignored — never commit them
- `passwordHash` is never returned in any API response
- JWT tokens expire in 7 days
- Images are stored on Cloudinary via multer memory storage
- Leaflet marker icons are fixed via `utils/leafletIcons.js` — import this before rendering any map

## How this was built

-This project was built with AI assistance throughout — Cursor as the editor, with Claude and ChatGPT used for code generation, debugging, and design decisions.

-Every feature was reviewed, tested, and integrated manually. The architecture decisions, project structure, database schema, and overall direction were defined by us — the AI tools handled the implementation speed.

-This is increasingly how software gets built, and we're not hiding it.
=======
- Integration: `dev` branch is main integration path.
- Releases: `main` branch is stable production release only.
- Messages format: `feat:`, `fix:`, `style:`, `refactor:`, `chore:`.
>>>>>>> aa596f5 (feat: complete Phase 6 implementation (Worker Resolution Photo Proof uploads, Before/After image comparison, Profile modification page, secure logout, and detailed chronological activity logs audit trail))
