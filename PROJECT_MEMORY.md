# BinFlow Project Memory

> Cursor/AI has no memory between sessions. This file is the single source
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
| Frontend | React + Vite (v6), React Router, Axios, React-Leaflet, Recharts, react-hot-toast, framer-motion, react-countup, lucide-react |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas + Mongoose |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| File uploads | Multer (memoryStorage) + Cloudinary |
| Maps | Leaflet + OpenStreetMap (no API key needed) |
| Styling | Tailwind CSS v4 (with `@tailwindcss/vite` plugin), custom theme variables, and Framer Motion transitions. Legacy styles scoped to `legacy.css` inside `.legacy-theme` class wrapper. |

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
│       │   ├── Sidebar.jsx             # Collapsible SaaS navigation drawer [NEW]
│       │   ├── ProtectedRoute.jsx
│       │   ├── PublicOnlyRoute.jsx
│       │   ├── MapPicker.jsx
│       │   ├── ComplaintMap.jsx
│       │   ├── StatusBadge.jsx         # Custom Tailwind v4 status badge with glowing pulse
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
│       ├── utils
│       │   ├── geolocation.js
│       │   └── leafletIcons.js
│       ├── context
│       │   ├── AuthContext.jsx
│       │   └── ThemeContext.jsx        # Light/Dark mode state management [NEW]
│       ├── pages
│       │   ├── HomePage.jsx            # Redesigned (staged, unwrapped in Phase 2)
│       │   ├── LoginPage.jsx           # Redesigned (staged, unwrapped in Phase 2)
│       │   ├── RegisterPage.jsx        # Redesigned (staged, unwrapped in Phase 2)
│       │   ├── NewComplaintPage.jsx
│       │   ├── MyComplaintsPage.jsx
│       │   ├── admin
│       │   │   ├── AdminDashboard.jsx
│       │   │   ├── AdminComplaintsPage.jsx
│       │   │   ├── AdminComplaintDetailPage.jsx
│       │   │   └── AdminMapPage.jsx
│       │   └── worker
│       │       ├── WorkerQueuePage.jsx  # Redesigned using Tailwind CSS v4 & Lucide
│       │       └── WorkerComplaintDetailPage.jsx
│       ├── services
│       │   ├── api.js
│       │   └── complaints.js
│       └── styles
│           ├── global.css              # Overhauled to Tailwind CSS v4 setup
│           ├── legacy.css              # Scoped CSS styles for unmigrated pages [NEW]
│           └── citizen.css
└── server
    ├── scripts/
    │   ├── seedAdmin.js
    │   ├── seedWorker.js
    │   └── fixMongoUri.js
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

---

## Migration & UI Modernization Journey

To build a premium eco-dark SaaS theme matching current UI trends, the project is undergoing a page-by-page styling migration to **Tailwind CSS v4** and **Framer Motion**, maintaining backend functionality and database rules completely intact.

### Scoping Strategy (Legacy Coexistence)
- Unmigrated pages are wrapped in `<LegacyWrapper>` in [App.jsx](file:///d:/PROJECTS/binflow/client/src/App.jsx) which applies the class `legacy-theme`.
- The legacy styles are isolated in [legacy.css](file:///d:/PROJECTS/binflow/client/src/styles/legacy.css) under `.legacy-theme` selectors to ensure they do not collide with new Tailwind utilities.

---

## Key Mistakes & Rectifications (From Migration Phase 1)

During Phase 1 execution, several layout, click-event, and variable issues arose. The table below details what went wrong, why, and how they were rectified:

| Mistake / Bug Identified | Root Cause | Rectification Applied |
|---|---|---|
| **Title Field Click Bug** | In the complaint reporting form, clicking the "Title" field triggered the image file picker. The file input's wrapper overlay was positioned absolute but lacked `position: relative` on its parent, stretching the invisible file input over the entire card. | Added explicit `position: relative` to the wrapper class `.file-input-wrapper` inside `legacy.css` to restrict the file input overlay boundaries. |
| **Blank/Invisible Customer Map & Blobs** | Commenting out `citizen.css` to migrate to Tailwind broke the Leaflet Map Picker tiles and background blobs. Visual assets and Leaflet components relied on specific selectors and global CSS variables. | Restored layout CSS rules and Leaflet styles by scoping them under `.legacy-theme` within `legacy.css` so that the map initializes and loads tile images correctly. |
| **Admin Stats Page `BlueIcon` Reference Crash** | In the updated statistics metrics array inside [HomePage.jsx](file:///d:/PROJECTS/binflow/client/src/pages/HomePage.jsx#L370), `BlueIcon` was defined but never imported. Evaluating it in the object literal throws a fatal `ReferenceError`. | Replaced the undefined `BlueIcon` with a valid Lucide icon `Truck` to ensure the Home component loads safely without runtime crashes. |
| **Global Theme Collision** | Introducing dark/light mode toggling caused unmigrated pages to lose contrast or display text as white on white or dark on dark. | Built the `<LegacyWrapper>` component to scope unmigrated page elements. Applied a structured dark/light variable set in `global.css` that maps correctly to system backgrounds. |

---

## Project Status & Checkpoint

- **Current Git Checkpoint**: Commit `d33e25c` ("checkpoint: save progress before phase 2 migration") is committed on the `main` branch.
- **Vite Build**: Compiles cleanly with zero errors/warnings.

---

## What Is Next (UI Migration Roadmap)

### Phase 2: Core Entry & Landing Pages [Active Phase]
1. **Unwrap Routes**: In [App.jsx](file:///d:/PROJECTS/binflow/client/src/App.jsx), unwrap the routes `/login`, `/register`, and `/` (Home) from `<LegacyWrapper>` to render them using the new Tailwind v4 styling.
2. **HomePage Redesign Fixes**: Clean up `HomePage.jsx` variables (e.g., replacement of `BlueIcon` with `Truck`).
3. **Parity Check**: Open `/login`, `/register`, and `/` in browser. Verify card glassmorphism, responsive forms, focus outlines, loading spin states, and theme color switches.

### Phase 3: Citizen Pages
- Redesign `NewComplaintPage.jsx` (modern layout, upload dropzone, MapPicker).
- Redesign `MyComplaintsPage.jsx` (complaint detail drawer, history timeline).

### Phase 4: Admin Dashboard & Actions
- Redesign `AdminDashboard.jsx` (responsive statistics grids, animated count-ups, charts).
- Redesign `AdminComplaintsPage.jsx` (table rows, action dropdowns, loader shimmers).
- Redesign `AdminComplaintDetailPage.jsx` (dispatch actions overlay, Leaflet worker tracker).
- Redesign `AdminMapPage.jsx` (fullscreen status filters).

### Phase 5: Worker Detail View
- Redesign `WorkerComplaintDetailPage.jsx` (quick actions, status buttons, directions links).

### Phase 6: Worker Resolution Photo Upload Feature
- **Backend**: Update `PATCH /api/complaints/:id/status` endpoint in Express controller to accept multipart uploads via multer, saving resolution photos to Cloudinary.
- **Frontend**: Create file selection form for workers resolving complaints. Add parallel view panes in Citizen & Admin details to view "Reported Image" and "Worker Resolution Proof".

---

## Resume Prompt

Copy this into the AI agent chat at the start of the next session:

```
Read PROJECT_MEMORY.md fully. Proceed with Phase 2 of the UI migration:
1. Unwrap /login, /register, and / (Home) routes from <LegacyWrapper> in App.jsx.
2. Fix the BlueIcon bug in HomePage.jsx.
3. Build the application (npm run build) and perform visual check of these entry pages.
```