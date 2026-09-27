"""
Nearza — Production Settings
Extends base settings with security hardening for production deployment on Render.
"""

from urllib.parse import urlparse, unquote
from .base import *  # noqa: F401, F403

DEBUG = False

# Reverse proxy SSL header (Essential for Render / Cloudflare / ALB)
SECURE_PROXY_SSL_HEADER = ("HTTP_X_FORWARDED_PROTO", "https")

# Production ALLOWED_HOSTS
raw_allowed = config(
    "DJANGO_ALLOWED_HOSTS",
    default=config("ALLOWED_HOSTS", default="nearza.onrender.com,localhost,127.0.0.1"),
)
ALLOWED_HOSTS = [h.strip() for h in str(raw_allowed).split(",") if h.strip()]
for default_host in ["nearza.onrender.com", "localhost", "127.0.0.1"]:
    if default_host not in ALLOWED_HOSTS:
        ALLOWED_HOSTS.append(default_host)

# Production CORS & CSRF
raw_cors = config(
    "CORS_ALLOWED_ORIGINS",
    default="https://nearzademo.netlify.app,http://localhost:5173,http://127.0.0.1:5173",
)
CORS_ALLOWED_ORIGINS = [o.strip() for o in str(raw_cors).split(",") if o.strip()]
if "https://nearzademo.netlify.app" not in CORS_ALLOWED_ORIGINS:
    CORS_ALLOWED_ORIGINS.append("https://nearzademo.netlify.app")

CORS_ALLOW_CREDENTIALS = True

raw_csrf = config(
    "CSRF_TRUSTED_ORIGINS",
    default="https://nearzademo.netlify.app,https://nearza.onrender.com,http://localhost:5173,http://127.0.0.1:5173",
)
CSRF_TRUSTED_ORIGINS = [o.strip() for o in str(raw_csrf).split(",") if o.strip()]
for default_csrf in ["https://nearzademo.netlify.app", "https://nearza.onrender.com"]:
    if default_csrf not in CSRF_TRUSTED_ORIGINS:
        CSRF_TRUSTED_ORIGINS.append(default_csrf)

# Database support for DATABASE_URL (if provided by hosting platform)
db_url = config("DATABASE_URL", default="")
if db_url:
    parsed = urlparse(db_url)
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": parsed.path.lstrip("/"),
            "USER": unquote(parsed.username) if parsed.username else "postgres",
            "PASSWORD": unquote(parsed.password) if parsed.password else "",
            "HOST": parsed.hostname or "localhost",
            "PORT": parsed.port or 5432,
            "OPTIONS": {
                "connect_timeout": 10,
            },
        }
    }

# Security hardening
SECURE_BROWSER_XSS_FILTER = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_HSTS_SECONDS = 31536000  # 1 year
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_HSTS_PRELOAD = True
SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_SSL_REDIRECT = config("SECURE_SSL_REDIRECT", default=True, cast=bool)

# Logging
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "[{asctime}] {levelname} {name} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "WARNING",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": "WARNING",
            "propagate": False,
        },
        "apps": {
            "handlers": ["console"],
            "level": "INFO",
            "propagate": False,
        },
    },
}
