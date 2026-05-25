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

---

## Roles

| Role | What they can do |
|---|---|
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

---

## Folder structure

```
binflow/
├── client/
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

```
reported → assigned → in_progress → resolved → closed
```

Every transition creates a `StatusLog` entry with who changed it, when, and any comment attached.

---

## Dispatch flow

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
