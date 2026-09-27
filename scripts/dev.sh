#!/usr/bin/env bash
# ===================================================================
# Nearza — Development Script (Linux/macOS)
# ===================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1 && pwd)"

echo "🚀 Starting Nearza development environment..."

# Start Django Backend in background
cd "$DIR/backend"
python manage.py runserver 0.0.0.0:8000 &
BACKEND_PID=$!

# Start Vite Frontend in background
cd "$DIR/frontend"
npm run dev &
FRONTEND_PID=$!

echo "✨ Services running:"
echo "   Backend:  http://localhost:8000/api/"
echo "   Frontend: http://localhost:5173/"

trap "kill $BACKEND_PID $FRONTEND_PID" EXIT
wait
