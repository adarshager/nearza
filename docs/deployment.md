# Nearza — Production Deployment Guide

This guide covers deployment procedures for Nearza using Docker, Supabase PostgreSQL, and standalone cloud hosts.

---

## 1. Prerequisites

- **Host Machine**: Ubuntu 22.04 LTS or Debian 12 (2+ vCPU, 4GB+ RAM recommended).
- **Installed Software**: Docker Engine 24+, Docker Compose v2, Git, Nginx (or Cloudflare Reverse Proxy).
- **External Services**:
  - Supabase Project (PostgreSQL database & object storage).
  - Domain Name with SSL certificates (Let's Encrypt / Certbot).

---

## 2. Environment Configuration

### Backend (`backend/.env`)

```ini
DJANGO_SECRET_KEY=generate-a-strong-50-char-secret-key-here
DJANGO_DEBUG=False
DJANGO_ALLOWED_HOSTS=api.yourdomain.com,yourdomain.com

# Supabase Database (Session Pooler or Direct)
DB_NAME=postgres
DB_USER=postgres
DB_PASSWORD=your_secure_supabase_db_password
DB_HOST=aws-0-ap-south-1.pooler.supabase.com
DB_PORT=6543

# Supabase API
SUPABASE_URL=https://your-project-ref.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# CORS
CORS_ALLOWED_ORIGINS=https://yourdomain.com,https://www.yourdomain.com

# Security
SECURE_SSL_REDIRECT=True
ACCESS_TOKEN_LIFETIME_MINUTES=15
REFRESH_TOKEN_LIFETIME_DAYS=7
```

### Frontend (`frontend/.env`)

```ini
VITE_API_BASE_URL=https://api.yourdomain.com/api
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your_public_anon_key
VITE_SUPABASE_PUBLISHABLE_KEY=your_public_publishable_key
```

---

## 3. Deployment using Docker Compose

From the repository root:

```bash
# 1. Build and start services in background
docker compose -f docker-compose.yml up --build -d

# 2. Run database migrations
docker compose exec backend python manage.py migrate --settings=config.settings.production

# 3. Create initial superadmin account
docker compose exec backend python manage.py createsuperuser --settings=config.settings.production

# 4. Verify running health
docker compose ps
```

---

## 4. Bare-Metal / Cloud VM Deployment

### Backend Setup (Gunicorn + Systemd)

1. Create a systemd service `/etc/systemd/system/nearza-backend.service`:

```ini
[Unit]
Description=Nearza Django Gunicorn Application
After=network.target

[Service]
User=www-data
Group=www-data
WorkingDirectory=/var/www/nearza/backend
ExecStart=/var/www/nearza/backend/venv/bin/gunicorn \
    --access-logfile - \
    --workers 3 \
    --bind 127.0.0.1:8000 \
    config.wsgi:application
Restart=always

[Install]
WantedBy=multi-user.target
```

2. Collect static files and migrate:

```bash
cd backend
source venv/bin/activate
pip install -r requirements.txt
python manage.py collectstatic --noinput --settings=config.settings.production
python manage.py migrate --settings=config.settings.production
sudo systemctl daemon-reload
sudo systemctl restart nearza-backend
```

### Frontend Setup (Vite Production Build + Nginx)

```bash
cd frontend
npm ci
npm run build
# Built files output to frontend/dist/
```

### Nginx Reverse Proxy Configuration

```nginx
# Frontend
server {
    server_name yourdomain.com;
    root /var/www/nearza/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }
}

# Backend API
server {
    server_name api.yourdomain.com;

    location / {
        proxy_pass http://127.0.0.1:8000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /static/ {
        alias /var/www/nearza/backend/staticfiles/;
    }
}
```

---

## 5. Post-Deployment Verification Checklist

1. [ ] Test HTTPS redirect: `curl -I http://yourdomain.com` redirects to `https://`.
2. [ ] Test API Health: `curl -s https://api.yourdomain.com/api/products/` returns `status: 200 OK`.
3. [ ] Test CORS headers: Verify `access-control-allow-origin` matches `https://yourdomain.com`.
4. [ ] Test Auth Token Refresh: Sign in and verify token persists and rotates.
5. [ ] Test Geolocation fallback: Deny location on test client and verify fallback UI renders.
6. [ ] Test Communication Links: Tap WhatsApp, Call, and Directions on mobile.

---

## 6. Troubleshooting

- **Database Connection Refused**:
  - Verify `DB_HOST` in `.env` uses port `6543` for connection pooling or `5432` for direct connection.
  - Check Supabase Network Restrictions under Database settings.
- **CORS Errors**:
  - Ensure `CORS_ALLOWED_ORIGINS` in `backend/.env` has no trailing slashes (e.g., `https://yourdomain.com`).
- **Static Assets 404 in Admin**:
  - Run `python manage.py collectstatic --noinput`.
