# BinFlow

A civic-tech platform for waste collection complaint management. Citizens report garbage issues with location and photos, admins dispatch field workers, and workers resolve and close complaints — with full audit trail and map visibility at every step.

Built as a B.Tech CSE project. No WhatsApp threads, no phone calls, no lost complaints.

---

## What it does

- Citizens submit complaints with GPS coordinates and an image
- Admins see all complaints on a live map, assign workers, and dispatch trucks with ETA
- Workers get a queue of assigned complaints with location and navigation to resolve on-site
- Every status change is logged — nothing falls through the cracks
- Admins can view trends, complaint categories, and ward-level analytics
- **Citizen Dashboard**: Report issues with GPS-coordinates map pinning, categorization, priority, and original photo upload. Track reported tickets on an interactive timeline modal.
- **Admin Command Center**: View all active reported issues on a fullscreen map, dispatch trucks with specific work instructions, monitor worker ETAs, and evaluate ward-level analytics.
- **Worker dispatch queue**: Responsive lists of assigned tasks showing GPS locations, Google Maps directions, and dispatch instructions.
- **Resolution Proof Uploads**: Requires field workers to upload an image proof (to Cloudinary) and document resolution comments when resolving tickets.
- **Audit logs / Chronological history**: Complete audit trails showing details of status changes, notes/comments, actors, and precise timestamps.
- **Eco-Dark SaaS Theme**: Responsive UI layout supporting Dark Mode and Light Mode toggles with glassmorphic elements and micro-animations.

---

## Roles

| Role | What they can do |
|---|---|
| citizen | Register, submit complaints, track status of own complaints (including resolved proof and comments) |
| admin | View all complaints, assign workers, dispatch trucks, view analytics and map |
| worker | View assigned complaints, navigate to location, upload resolution proof photo and comment |

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite, React Router, Axios, Framer Motion, react-countup, lucide-react |
| Maps | React-Leaflet + OpenStreetMap (no API key needed) |
| Charts | Recharts |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs |
| File uploads | Multer + Cloudinary |
| Styling | Tailwind CSS v4 (with `@tailwindcss/vite` plugin), custom theme context (dark/light), no legacy CSS leakage |

---

## Folder structure

```
binflow/
├── client/
│   └── src/
│       ├── components/
│       │   ├── Navbar.jsx              # Responsive navigation bar
│       │   ├── Sidebar.jsx             # Collapsible SaaS navigation sidebar
│       │   ├── ProtectedRoute.jsx      # Role-based route protectors
│       │   ├── PublicOnlyRoute.jsx     # Auth-guest route filters
│       │   ├── MapPicker.jsx           # Coordinate picker map
│       │   ├── ComplaintMap.jsx        # Detail markers coordinates map
│       │   ├── StatusBadge.jsx         # Custom Tailwind v4 status/priority badges
│       │   ├── TruckAnimation.jsx      # Animated CSS dispatch truck
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
│       │   ├── AuthContext.jsx         # JWT validation & user details synchronization
│       │   └── ThemeContext.jsx        # Dark/Light mode preferences trigger
│       ├── pages/
│       │   ├── HomePage.jsx            # Redesigned hero landing
│       │   ├── LoginPage.jsx           # Glassmorphic entry forms
│       │   ├── RegisterPage.jsx        # Glassmorphic citizen signup
│       │   ├── ProfilePage.jsx         # Profile settings name, phone, ward updates & logout
│       │   ├── NewComplaintPage.jsx    # Complaint reporting uploader
│       │   ├── MyComplaintsPage.jsx    # Ticket tracking timeline modal
│       │   ├── admin/
│       │   │   ├── AdminDashboard.jsx  # KPI widgets and trends charts
│       │   │   ├── AdminComplaintsPage.jsx # Complaints data tables with filters
│       │   │   ├── AdminComplaintDetailPage.jsx # Dispatch panel & timeline log audit
│       │   │   └── AdminMapPage.jsx    # Fullscreen interactive maps filters
│       │   └── worker/
│       │       ├── WorkerQueuePage.jsx # Active & completed assignments records list
│       │       └── WorkerComplaintDetailPage.jsx # Inline resolution forms & Before/After photo comparison
│       ├── services/
│       │   ├── api.js                  # Axios interceptor setups
│       │   └── complaints.js           # API backend mappings
│       └── styles/
│           ├── global.css              # Overhauled Tailwind CSS v4 styles
│           ├── legacy.css              # Scoped CSS selectors fallback
│           └── citizen.css
└── server/
    ├── scripts/
    │   ├── seedAdmin.js            # Initial admin seed script
    │   ├── seedWorker.js           # Initial worker seed script
    │   └── fixMongoUri.js          # MongoDB URI sanitizer helper
    └── src/
        ├── config/
        │   ├── db.js                   # Mongoose connection config
        │   └── cloudinary.js           # Cloudinary credentials config
        ├── controllers/
        │   ├── authController.js       # Authentication log, register, and profile updates
        │   ├── complaintController.js  # Complaint operations & status patching
        │   └── adminController.js      # Dashboard aggregation reports
        ├── middleware/
        │   ├── auth.js                 # Authentication verify tokens & role authorizations
        │   └── upload.js               # Multer image upload constraints
        ├── models/
        │   ├── User.js                 # Citizen/Admin/Worker collection schema
        │   ├── Complaint.js            # Complaint collection schema
        │   └── StatusLog.js            # Chronological audit collection schema
        ├── routes/
        │   ├── authRoutes.js           # Auth endpoint paths
        │   ├── complaintRoutes.js      # Complaints endpoint paths
        │   └── adminRoutes.js          # Analytics aggregation paths
        ├── services/
        │   └── cloudinaryUpload.js     # Cloudinary buffer upload streams
        ├── utils/
        │   └── response.js
        ├── app.js
        └── server.js
```

---

## Getting started

### Prerequisites

- Node.js v18+
- A MongoDB Atlas cluster
- A Cloudinary account (free tier is fine)

### Environment variables

Create `server/.env`:

```
PORT=5000
MONGO_URI=your_atlas_connection_string
JWT_SECRET=your_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

> If your MongoDB Atlas password contains `@`, encode it as `%40` in the URI.

Create `client/.env`:

```
REACT_APP_API_URL=http://localhost:5000
```

### Running locally

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

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/auth/register` | public | Citizen registrations |
| POST | `/api/auth/login` | public | Auth login & JWT generation |
| GET | `/api/auth/me` | authenticated | Fetch current user profiles |
| PUT | `/api/auth/profile` | authenticated | Update user name, phone, and ward info |
| GET | `/api/auth/workers` | admin | Returns worker list for dispatch dropdown |

### Complaints

| Method | Route | Access | Purpose |
|---|---|---|---|
| POST | `/api/complaints` | citizen | Submit a complaint (multipart, image upload) |
| GET | `/api/complaints/my` | citizen | Retrieve citizen's submitted complaints |
| GET | `/api/complaints/assigned` | worker | Retrieve worker's queue (active & completed) |
| GET | `/api/complaints` | admin | Retrieve all complaints with status/category/date filters |
| GET | `/api/complaints/map` | admin | Lat, lng, status, category only for map |
| GET | `/api/complaints/:id` | authenticated | Citizen, admin, and worker detailed complaint fetch + audit status logs |
| PATCH | `/api/complaints/:id/status` | admin + worker | Update status (accepts resolution photo uploader via multer for workers) |
| PATCH | `/api/complaints/:id/assign` | admin | Link worker assignee to complaint |
| PATCH | `/api/complaints/:id/dispatch` | admin | Dispatch worker, write instructions & estimated arrival |

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

```
reported → assigned → in_progress → resolved → closed
```

Every transition creates a `StatusLog` entry with who changed it, when, and any comment attached.

---

## Dispatch & Resolution Flow

1. Citizen submits a complaint with GPS coordinates and an image
2. Admin sees it on the dashboard or map
3. Admin opens the complaint, selects a worker from the dropdown, writes a dispatch note, sets an ETA
4. Status moves to `assigned`, worker is linked, note and ETA are saved, truck animation plays
5. Worker sees the complaint in their queue with the dispatch note and coordinates
6. Worker opens the job detail, uses the Google Maps link to navigate, marks it `in_progress` on arrival
7. Worker marks it `resolved` when done by uploading a resolution proof photo and comment
8. Citizen can track the ticket and view both Reported Image and Resolution Proof photo + worker comment side-by-side (including after the ticket is closed)
9. Admin verifies the resolution, views the Before/After photo grid comparison, and closes the ticket

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
- Profile Settings Page (`/profile`) allowing users to update name, phone, and ward, and securely sign out
- Citizen complaint submission with live map pin, geolocation, and image upload
- Multi-step geolocation — GPS, watchPosition fallback, IP approximate fallback
- My Complaints page with cards, progress timeline (reported → assigned → in_progress → resolved → closed), and detailed Before/After photos comparison
- Admin dashboard with real status KPIs and Recharts analytics (trends, categories, wards)
- Admin complaints table with filters by status, category, ward, and date range
- Admin complaint detail page with worker assigning overlay, truck dispatching, and chronological status log audit timelines
- Admin map page with complaint pins and filters
- Truck dispatch animation overlay
- StatusBadge component for all status and priority states
- Worker Queue page with tabbed views for **Active Assignments** and **Completed History** records
- Worker uploader form for submitting resolution photo proof and comments
- Full backend: models, controllers, middleware, routes, Cloudinary image storage
- Seed scripts for admin and worker accounts
- Windows MongoDB fix script for SRV DNS failures

## What's planned

- Duplicate complaint detection — haversine check on submit, ~100–200 m radius
- SLA auto-escalation — node-cron job, priority bumped to high after 48h unresolved
- Notifications collection

---

## Notes

- `.env` files are gitignored — never commit them
- `passwordHash` is never returned in any API response
- JWT tokens expire in 7 days
- Images are stored on Cloudinary via multer memory storage
- Leaflet marker icons are fixed via `utils/leafletIcons.js` — import this before rendering any map

## How this was built

- This project was built with AI assistance throughout — Cursor as the editor, with Claude, Antigravity, and ChatGPT used for code generation, debugging, and design decisions.
- Every feature was reviewed, tested, and integrated manually. The architecture decisions, project structure, database schema, and overall direction were defined by us — the AI tools handled the implementation speed.
- This is increasingly how software gets built, and we're not hiding it.
