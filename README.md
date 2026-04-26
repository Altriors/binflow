# BinFlow

A civic-tech platform for waste collection complaint management. Citizens report garbage issues with location and photos, admins dispatch field workers, and workers resolve and close complaints — with full audit trail and map visibility at every step.

Built as a B.Tech CSE project. No WhatsApp threads, no phone calls, no lost complaints.

---

## What it does

- Citizens submit complaints with GPS coordinates and an image
- Admins see all complaints on a live map, assign workers, and dispatch trucks with ETA
- Workers get a queue of assigned complaints with location to navigate to
- Every status change is logged — nothing falls through the cracks
- Admins can view trends, complaint categories, and ward-level analytics

---

## Roles

| Role | What they can do |
|---|---|
| citizen | Register, submit complaints, track status of own complaints |
| admin | View all complaints, assign workers, dispatch trucks, view analytics and map |
| worker | View assigned complaints, update progress, upload resolution proof |

---

## Tech stack

| Layer | Tech |
|---|---|
| Frontend | React + Vite, React Router, Axios |
| Maps | React-Leaflet + OpenStreetMap (no API key needed) |
| Charts | Recharts |
| Backend | Node.js + Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT + bcryptjs |
| File uploads | Multer + Cloudinary |
| Styling | Plain CSS (custom design system, no Tailwind) |

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
│       │   ├── StatusBadge.jsx
│       │   └── TruckAnimation.jsx
│       ├── context/
│       │   └── AuthContext.jsx
│       ├── pages/
│       │   ├── HomePage.jsx
│       │   ├── LoginPage.jsx
│       │   ├── RegisterPage.jsx
│       │   ├── NewComplaintPage.jsx
│       │   ├── MyComplaintsPage.jsx
│       │   └── admin/
│       │       ├── AdminDashboard.jsx
│       │       ├── AdminComplaintsPage.jsx
│       │       ├── AdminComplaintDetailPage.jsx
│       │       └── AdminMapPage.jsx
│       ├── services/
│       │   ├── api.js
│       │   └── complaints.js
│       └── styles/
│           └── global.css
└── server/
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

### Seed the admin account

Run this once after the server is up:

```bash
cd server
npm run seed:admin
```

This creates: `admin@binflow.com` / `admin123`

---

## API reference

### Auth

| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | public |
| POST | `/api/auth/login` | public |
| GET | `/api/auth/me` | authenticated |

### Complaints

| Method | Route | Access |
|---|---|---|
| POST | `/api/complaints` | citizen (multipart, image upload) |
| GET | `/api/complaints/my` | citizen |
| GET | `/api/complaints` | admin (filters: status, category, ward, date range) |
| GET | `/api/complaints/map` | admin (lat, lng, status, category only) |
| GET | `/api/complaints/:id` | citizen + admin |
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

1. Citizen submits a complaint with GPS coordinates
2. Admin sees it on the dashboard or map
3. Admin opens the complaint, selects a worker, writes a dispatch note, sets an ETA
4. Status moves to `assigned`, the worker is linked, note and ETA are saved
5. A status log entry records the dispatch
6. Worker sees the complaint in their queue with coordinates to navigate to
7. Worker marks it `in_progress` on arrival, `resolved` when done

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

- Full authentication flow with role-based access
- Citizen complaint submission with live map pin and image upload
- My Complaints page with status tracking
- Admin dashboard with real stats and Recharts analytics
- Admin complaints table with filters
- Admin complaint detail page with dispatch truck UI
- Admin map page with complaint pins
- Truck dispatch animation
- StatusBadge component for all status and priority states
- Full backend: models, controllers, middleware, routes, Cloudinary integration

## What's next

- Worker queue page (assigned complaints list + map navigation)
- Duplicate complaint detection by proximity radius
- SLA auto-escalation for complaints unresolved too long
- Notifications system
- Mobile layout pass

---

## Notes

- `.env` files are gitignored — never commit them
- `passwordHash` is never returned in any API response
- JWT tokens expire in 7 days
- Images are stored on Cloudinary, uploaded via multer memory storage
