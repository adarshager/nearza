# NEARZA

> **Find Nearby. Compare Prices. Shop Smarter.**

Nearza is a local product discovery and price comparison platform that connects customers with nearby merchants.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React, Vite, Tailwind CSS v4, Framer Motion, Lucide React, Axios |
| Backend | Python, Django 6, Django REST Framework |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage |
| Auth | JWT (djangorestframework-simplejwt) |

## Prerequisites

- **Python** 3.12+
- **Node.js** 20+
- **npm** 9+
- **Supabase** project (free tier works)
- **Git**

## Quick Start

### 1. Clone & Setup Environment

```bash
git clone <repo-url>
cd nearza

# Backend
cp backend/.env.example backend/.env
# Edit backend/.env with your Supabase credentials

# Frontend
cp frontend/.env.example frontend/.env
# Edit frontend/.env with your API URL
```

### 2. Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. Go to **Settings → Database** and copy the connection details
3. Fill in `backend/.env`:
   - `DB_HOST` — your Supabase database host
   - `DB_PASSWORD` — your database password
   - `SUPABASE_URL` — your project URL
   - `SUPABASE_SERVICE_ROLE_KEY` — from API Settings

### 3. Backend Setup

```bash
cd backend

# Create virtual environment (recommended)
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Create admin user
python manage.py createsuperuser

# Start server
python manage.py runserver
```

### 4. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Start dev server
npm run dev
```

### 5. Access

- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/

## Docker (Alternative)

```bash
cd docker
docker-compose up --build
```

## Project Structure

```
nearza/
├── backend/          # Django REST API
│   ├── config/       # Settings, URLs, WSGI
│   └── apps/         # Django apps (accounts, shops, products, etc.)
├── frontend/         # React + Vite SPA
│   └── src/          # Components, pages, services, contexts
├── docker/           # Docker configuration
└── docs/             # Documentation
```

## API Endpoints

| Group | Base URL | Description |
|---|---|---|
| Auth | `/api/auth/` | Register, login, logout, profile |
| Products | `/api/products/` | Product catalog & search |
| Categories | `/api/categories/` | Product categories |
| Shops | `/api/shops/` | Shop discovery & details |
| Merchant | `/api/merchant/` | Merchant dashboard & management |
| Favorites | `/api/favorites/` | Saved items |
| Reviews | `/api/reviews/` | Shop reviews |
| Reports | `/api/reports/` | Report incorrect info |
| Notifications | `/api/notifications/` | In-app notifications |
| Admin | `/api/admin-panel/` | Admin management |

## Documentation

Comprehensive engineering and operations documentation is located in the [`docs/`](docs/) directory:

- [**Architecture Guide**](docs/architecture.md) — System topology, component boundaries, frontend/backend architecture, and communication deep links.
- [**Database Reference**](docs/database.md) — ER diagrams, schema specifications, indexing strategy, and inventory confidence algorithms.
- [**API Documentation**](docs/api.md) — Complete REST endpoint reference with request/response payloads, authentication, and error formats.
- [**Security Specification**](docs/security.md) — RBAC matrix, IDOR defense, file validation, rate limiting, and threat mitigation audit.
- [**Deployment Runbook**](docs/deployment.md) — Docker, systemd, Gunicorn, Nginx reverse proxy, SSL, database migrations, and operational troubleshooting.

## Testing & Quality Assurance

```bash
# Backend unit & integration tests (50 tests covering auth, RBAC, IDOR, search, admin)
cd backend
python manage.py test

# Backend deployment checks
python manage.py check --deploy --settings=config.settings.production

# Frontend merchant contact unit tests (wa.me, tel:, directions)
cd frontend
node src/utils/test-merchant-contact.mjs

# Frontend production bundle build
npm run build
```

## Migration Instructions

When updating the database schema in development or production:

```bash
cd backend

# Check for pending model changes
python manage.py makemigrations --dry-run

# Create new migrations if schema modified
python manage.py makemigrations

# Apply migrations to database
python manage.py migrate
```

## Troubleshooting Common Issues

| Issue | Cause | Resolution |
|---|---|---|
| `DisallowedHost` error | `ALLOWED_HOSTS` missing domain | Add client IP or domain to `ALLOWED_HOSTS` in `.env` |
| `CORS Error` on API call | Missing origin in whitelist | Add frontend URL to `CORS_ALLOWED_ORIGINS` in `backend/.env` |
| Image upload fails | File exceeds 5MB or invalid MIME | Ensure file is JPEG/PNG/WebP and under 5MB |
| Maps not rendering | Missing GPS coordinates | Enable browser geolocation permissions or pick location manually |
| Gunicorn 502 Bad Gateway | Unix socket permission or crash | Check `journalctl -u gunicorn` and verify socket permissions |

For detailed production troubleshooting, see [`docs/deployment.md#troubleshooting-runbook`](docs/deployment.md#troubleshooting-runbook).

## Environment Variables

See [`backend/.env.example`](backend/.env.example) and [`frontend/.env.example`](frontend/.env.example) for all required variables.

> **⚠️ Security**: Never commit `.env` files. Never expose Supabase service-role keys to the frontend.

## License

Private — All rights reserved.

