# LeadManager — SaaS CRM & Lead Tracking Web Application

> **Full Stack Developer Screening Assignment**  
> **Company:** Meru Technosoft Pvt. Ltd.  
> **Developer:** Aryan Gavhane  
> **Repository:** [https://github.com/AryanG200/lead-manager](https://github.com/AryanG200/lead-manager)

---

## 1. Project Overview

**LeadManager** is a full-stack, production-quality CRM web application designed to help businesses, sales representatives, and account executives capture, organize, prioritize, and track sales prospects across all pipeline stages.

Built following modern SaaS dashboard design principles (inspired by Linear, HubSpot, and Stripe Dashboard), the application combines a minimalist, responsive React user interface with a robust, secured Express/Node.js REST API backed by MongoDB Atlas.

### Key Value Propositions
- **Complete Lead Lifecycle Management:** Create, view, search, filter, sort, update, and safely delete leads.
- **Enterprise Multi-Tenant Data Isolation:** Strict user-level access controls ensure sales reps can only see and manage their own leads.
- **Live Pipeline Analytics:** Instantaneous MongoDB aggregation calculations powering dashboard KPIs without mock or hardcoded data.
- **Defensive Engineering:** Dual-layer validation (client & server), robust security headers, centralized error boundaries, and token-based session handling.

---

## 2. Key Features

### 🔐 Authentication & Session Security (Bonus Feature)
- **User Registration & Login:** JWT-powered authentication with `bcryptjs` salted password hashing.
- **Safe Serialization:** User passwords and internal properties (`__v`) are excluded at the schema level and never returned in API responses.
- **Session Interceptors:** Centralized Axios interceptors automatically attach `Authorization: Bearer <token>` and intercept `401 Unauthorized` responses to clear sessions cleanly.
- **Protected Frontend Routing:** Role/state-based route guards (`ProtectedRoute` and `PublicRoute`) prevent unauthorized access and route flipping.

### 📊 Real-Time Dashboard & Pipeline Metrics
- **Dynamic KPI Summary Cards:**
  - **Total Leads:** Total number of leads tracked by the authenticated user.
  - **New Leads:** Inbound, uncontacted prospects.
  - **Contacted Leads:** Prospects currently engaged in outreach.
  - **Qualified Leads:** High-intent leads with qualified business potential.
- **Pipeline Stage Breakdown:** Visual progress bars displaying stage distribution percentages and pipeline conversion rates.
- **Recent Prospects Feed:** Direct overview of the 5 most recent leads with immediate navigation to edit forms.
- **Quick Actions:** One-click shortcuts to add prospects from any view.

### 👥 Comprehensive Lead Management (CRUD)
- **Lead Attributes:**
  - Full Name (required, 2–100 characters)
  - Email Address (required, RFC compliant format validation)
  - Phone Number (required, international phone format validation)
  - Company Name (optional)
  - Lead Source (dropdown: `Website`, `LinkedIn`, `Referral`, `Social Media`, `Advertisement`, `Cold Calling`, `Other`)
  - Pipeline Status (dropdown: `New`, `Contacted`, `Qualified`, `Lost`)
- **Search Engine:** Real-time, debounced search across name, email, and company.
- **Multi-Filter Engine:** Filter leads by pipeline status and lead source with active filter tags and one-click reset.
- **Custom Sorting:** Sort by creation date (newest/oldest), lead name (A-Z, Z-A), or company name.
- **SaaS Pagination:** Dynamic page calculation with configurable page limits and record summaries.
- **Accidental Deletion Shield:** Interactive confirmation modal highlighting the lead name before permanently deleting from MongoDB.

---

## 3. Technology Stack

### Frontend Architecture
- **Framework:** React 19 (via Vite 8)
- **Language:** JavaScript (ES6+ / Modern Modules)
- **Styling:** Tailwind CSS v4 (with `@tailwindcss/vite`)
- **Routing:** React Router DOM v7
- **HTTP Client:** Axios (with request & response interceptors)
- **Icons:** Lucide React
- **Notifications:** React Hot Toast
- **Error Handling:** Custom React `ErrorBoundary`

### Backend Architecture
- **Runtime:** Node.js (v20+)
- **Framework:** Express.js (v5)
- **Database ODM:** Mongoose (v9)
- **Authentication:** JSON Web Tokens (`jsonwebtoken`) & `bcryptjs`
- **Validation:** `express-validator` (v7)
- **Security:** `helmet` (HTTP headers) & `cors` (Cross-Origin Resource Sharing)
- **Environment:** `dotenv`

### Database
- **Primary:** MongoDB Atlas (Cloud Cluster)
- **Local Fallback:** Supported via `mongodb://127.0.0.1:27017/lead-manager`

### Testing Suite
- **Framework:** Jest
- **Integration Library:** Supertest

---

## 4. Project Structure

```
lead-manager/
├── client/                     # Frontend Application (React + Vite)
│   ├── public/                 # Static assets & favicon
│   ├── src/
│   │   ├── components/         # Reusable UI components
│   │   │   ├── DeleteConfirmationModal.jsx  # Safe deletion modal
│   │   │   ├── EmptyState.jsx               # Contextual empty state card
│   │   │   ├── ErrorBoundary.jsx            # Top-level error safety net
│   │   │   ├── LoadingSpinner.jsx           # Configurable loading spinner
│   │   │   ├── Navbar.jsx                   # Sticky header with breadcrumbs
│   │   │   ├── Pagination.jsx               # Numeric and prev/next page navigation
│   │   │   ├── ProtectedRoute.jsx           # Guard for private routes
│   │   │   ├── PublicRoute.jsx              # Guard preventing logged-in access to auth
│   │   │   ├── Sidebar.jsx                  # Collapsible navigation drawer
│   │   │   ├── StatCard.jsx                 # Dashboard metric card
│   │   │   └── StatusBadge.jsx              # Colored status pills
│   │   ├── context/
│   │   │   └── AuthContext.jsx # Global auth provider & session manager
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx # Master layout wrapper
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx   # Live dashboard with KPI cards & recent leads
│   │   │   ├── LeadForm.jsx    # Dual-mode Add / Edit lead form
│   │   │   ├── LeadsList.jsx   # Directory table with search, filter & pagination
│   │   │   ├── Login.jsx       # User login screen
│   │   │   └── Signup.jsx      # User registration screen
│   │   ├── services/
│   │   │   ├── api.js          # Centralized Axios client with interceptors
│   │   │   ├── authService.js  # Authentication endpoints
│   │   │   └── leadService.js  # Lead CRUD & stats endpoints
│   │   ├── App.jsx             # Route definitions & toast provider
│   │   ├── index.css           # Tailwind CSS directives
│   │   └── main.jsx            # React root with ErrorBoundary
│   ├── .env.example            # Frontend environment template
│   ├── package.json            # Frontend dependencies
│   └── vite.config.js          # Vite & Tailwind configuration + dev proxy
│
├── server/                     # Backend REST API (Node.js + Express)
│   ├── config/
│   │   └── db.js               # MongoDB Mongoose connection
│   ├── controllers/
│   │   ├── authController.js   # Register, Login, Me handlers
│   │   ├── dashboardController.js # Aggregated statistics handler
│   │   └── leadController.js   # Complete CRUD handlers
│   ├── middleware/
│   │   ├── auth.js             # JWT verification & req.user attachment
│   │   ├── errorHandler.js     # Centralized error handler
│   │   ├── notFound.js         # 404 handler
│   │   └── validateRequest.js  # express-validator evaluation middleware
│   ├── models/
│   │   ├── Lead.js             # Lead Mongoose schema with compound indexes
│   │   └── User.js             # User Mongoose schema with bcrypt hooks
│   ├── routes/
│   │   ├── authRoutes.js       # /api/auth endpoints
│   │   ├── dashboardRoutes.js  # /api/dashboard endpoints
│   │   └── leadRoutes.js       # /api/leads endpoints
│   ├── tests/                  # Automated integration test suite
│   │   ├── auth.test.js        # Auth API Jest & Supertest tests
│   │   └── leads.test.js       # Leads CRUD & Multi-tenant tests
│   ├── utils/
│   │   └── generateToken.js    # JWT generator helper
│   ├── validators/
│   │   ├── authValidators.js   # Input schemas for Auth
│   │   └── leadValidators.js   # Input schemas for Leads
│   ├── .env.example            # Backend environment template
│   ├── package.json            # Backend dependencies & test scripts
│   └── server.js               # Express application entrypoint
│
├── .gitignore                  # Comprehensive Git exclusion rules
└── README.md                   # Complete architectural & operational guide
```

---

## 5. Prerequisites

Before running the application locally, ensure you have:
- **Node.js:** v18.0.0 or higher (v20+ recommended).
- **npm:** v9.0.0 or higher.
- **MongoDB:** An active MongoDB Atlas cluster URI **or** a local MongoDB daemon running on port 27017.
- **Git:** Installed on your development environment.

---

## 6. Installation & Setup

### Clone the Repository
```bash
git clone https://github.com/AryanG200/lead-manager.git
cd lead-manager
```

### Backend Setup (`server/`)
```bash
# Navigate to the backend directory
cd server

# Install dependencies
npm install

# Create local environment configuration
copy .env.example .env   # On Windows PowerShell / CMD
# or: cp .env.example .env (on macOS / Linux)
```

Configure `server/.env` with your credentials:
```env
PORT=5000
MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/lead-manager?retryWrites=true&w=majority
JWT_SECRET=lead_manager_super_secret_jwt_key_2026
JWT_EXPIRE=7d
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

### Frontend Setup (`client/`)
```bash
# In a new terminal, navigate to the frontend directory
cd client

# Install dependencies
npm install

# Create local environment configuration
copy .env.example .env   # On Windows
# or: cp .env.example .env (on macOS / Linux)
```

Configure `client/.env`:
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 7. How to Run Locally

### Start Backend API Server
```bash
cd server
npm run dev
```
*The server will start on port `5000` and automatically connect to MongoDB Atlas.*

### Start Frontend Application
```bash
cd client
npm run dev
```
*The Vite development server will start at `http://localhost:5173`.*

Open your browser and navigate to **`http://localhost:5173`**.

---

## 8. API Endpoint Documentation

All endpoints (except public authentication) require the `Authorization: Bearer <token>` header.

### 🔑 Authentication Endpoints (`/api/auth`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/auth/register` | Public | Register new user; returns JWT token & user object |
| `POST` | `/api/auth/login` | Public | Authenticate user; returns JWT token & user object |
| `GET` | `/api/auth/me` | Private | Retrieve currently authenticated user profile |

### 👥 Lead Management Endpoints (`/api/leads`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `POST` | `/api/leads` | Private | Create a new lead assigned to the authenticated user |
| `GET` | `/api/leads` | Private | Retrieve user leads with search, filter, sort, & pagination |
| `GET` | `/api/leads/:id` | Private | Retrieve an individual lead by ID (user-isolated) |
| `PUT` | `/api/leads/:id` | Private | Update an existing lead (user-isolated) |
| `DELETE` | `/api/leads/:id` | Private | Delete a lead (user-isolated) |

#### Query Parameters for `GET /api/leads`:
- `search` *(string)*: Case-insensitive query matched against `name`, `email`, and `company`.
- `status` *(string)*: Filter by pipeline status (`New`, `Contacted`, `Qualified`, `Lost`).
- `source` *(string)*: Filter by lead source (`Website`, `LinkedIn`, `Referral`, etc.).
- `sortBy` *(string)*: Field to sort on (`createdAt`, `name`, `company`, `status`). Default: `createdAt`.
- `sortOrder` *(string)*: Sort direction (`asc`, `desc`). Default: `desc`.
- `page` *(number)*: Page number. Default: `1`.
- `limit` *(number)*: Records per page. Default: `10` (max: 100).

### 📈 Dashboard Statistics Endpoint (`/api/dashboard`)
| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/dashboard/stats` | Private | Aggregated real-time metrics (Totals, Breakdown, Recent leads) |

---

## 9. Automated Testing

The backend includes a comprehensive, real-database integration test suite written with **Jest** and **Supertest**.

### Run Tests
```bash
cd server
npm test
```

### Verified Test Results
```
PASS tests/leads.test.js
PASS tests/auth.test.js

Test Suites: 2 passed, 2 total
Tests:       28 passed, 28 total
Snapshots:   0 total
Time:        2.793 s
```

### Tested Workflows
1. **User Registration:** Valid inputs, password hashing, and token issuance.
2. **Duplicate Prevention:** Rejection of registered emails with HTTP 400.
3. **Input Sanitization:** Rejection of invalid email formats, weak passwords, and missing fields.
4. **Credential Verification:** Valid logins pass; incorrect passwords return HTTP 401.
5. **Token Security:** Unauthenticated requests or forged tokens are blocked with HTTP 401.
6. **Lead CRUD Lifecycle:** Creating, reading, editing, and deleting leads.
7. **Search & Filter:** Substring name matching and exact status filtering.
8. **Multi-Tenant Isolation:** User B cannot view, modify, or delete leads belonging to User A (returns HTTP 404).
9. **Dashboard Aggregations:** Verification of live totals, breakdown percentages, and recent lead lists.

---

## 10. Developer Notes & Technical Decisions

### Important Technical Decisions
1. **MongoDB Compound Indexes:**
   Because every query in a multi-tenant CRM is scoped by `user`, we defined compound indexes in [`Lead.js`](file:///c:/Users/Aryan/OneDrive/Desktop/CLIENT/server/models/Lead.js):
   - `{ user: 1, createdAt: -1 }` for high-throughput chronological sorting.
   - `{ user: 1, status: 1 }` for instant dashboard and status filter queries.
   - `{ user: 1, name: 1 }` for rapid search queries.
2. **Multi-Tenant Leak Prevention:**
   When an agent queries or mutates an ID they do not own (`Lead.findOne({ _id: id, user: req.user._id })`), the API intentionally returns `404 Not Found` rather than `403 Forbidden`. This security pattern prevents attackers from probing which resource IDs exist in the system.
3. **Dual Validation Architecture:**
   While the React frontend provides instantaneous user feedback, the backend enforces an independent validation layer via `express-validator` and Mongoose schema constraints, ensuring data integrity even against direct API calls.
4. **Tailwind CSS v4 & Modern Clean UX:**
   We strictly adhered to the design inspiration from Linear and Stripe: white cards, subtle `slate-200` borders, `slate-50` backgrounds, and purposeful indigo accents. Decorative distractions, heavy animations, and dark gradients were omitted to maintain a clean CRM product aesthetic.

### What Was Challenging
- **OneDrive Sync & Windows File Locks:** Operating inside a OneDrive synced directory caused sporadic lock contention on `.git/index.lock` during rapid file writes. We diagnosed this and ensured safe execution without impacting version control.
- **Mongoose 9 Async Pre-Hooks:** In Mongoose v9, declaring an `async` pre-save hook that accepts `next` can throw `next is not a function`. We updated the schema hook to modern promise-based resolution.

### Future Improvements (With More Time)
- **CSV Import / Export:** Bulk export leads to Excel/CSV and import contact lists.
- **Activity & Audit Timeline:** Add an internal notes and activity log for each lead (calls made, emails sent).
- **Kanban Board View:** Drag-and-drop lead cards across pipeline columns (`New` -> `Contacted` -> `Qualified` -> `Lost`).
- **Email Notifications / Webhooks:** Trigger automated email alerts when a lead is marked as `Qualified`.

---

## 11. Deployment Preparation

The project is fully prepared for multi-environment deployment:

- **Frontend (Vercel / Netlify):**
  - Run `npm run build` in `client/` to generate production assets in `client/dist/`.
  - Set the `VITE_API_URL` environment variable to your hosted backend URL (e.g., `https://api.yourdomain.com/api`).
- **Backend (Render / Railway):**
  - Configured to bind dynamically to `process.env.PORT`.
  - Environment variables `MONGODB_URI`, `JWT_SECRET`, and `CLIENT_URL` can be populated directly in the hosting provider's dashboard.
  - CORS middleware dynamically adapts to the production frontend domain.
