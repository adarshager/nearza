"""
Nearza — Gunicorn Production Configuration
Binds dynamically to $PORT (Render/Heroku standard, default 10000 or 8000).
"""

import os

port = os.environ.get("PORT", "8000")
bind = f"0.0.0.0:{port}"
workers = int(os.environ.get("WEB_CONCURRENCY", 3))
timeout = int(os.environ.get("GUNICORN_TIMEOUT", 60))
accesslog = "-"
errorlog = "-"
capture_output = True
enable_stdio_inheritance = True
