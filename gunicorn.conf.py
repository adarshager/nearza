"""
Nearza — Root Gunicorn Configuration
Ensures proper module resolution and dynamic port binding if executed from repository root.
"""

import os
import sys

root_dir = os.path.dirname(os.path.abspath(__file__))
backend_dir = os.path.join(root_dir, "backend")
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)

chdir = backend_dir
port = os.environ.get("PORT", "8000")
bind = f"0.0.0.0:{port}"
workers = int(os.environ.get("WEB_CONCURRENCY", 3))
timeout = int(os.environ.get("GUNICORN_TIMEOUT", 60))
accesslog = "-"
errorlog = "-"
capture_output = True
