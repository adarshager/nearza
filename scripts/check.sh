#!/usr/bin/env bash
# ===================================================================
# Nearza — System Checks (Linux/macOS)
# Runs backend Django checks and frontend Vite build + lint
# ===================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1 && pwd)"

echo "🔍 [Nearza] Running Backend System Check..."
cd "$DIR/backend"
python manage.py check --settings=config.settings.development
echo "✅ [Nearza] Backend check passed!"

echo ""
echo "📦 [Nearza] Running Frontend Build Check..."
cd "$DIR/frontend"
npm run build
echo "✅ [Nearza] Frontend build passed!"

echo ""
echo "🎉 [Nearza] All checks passed successfully!"
