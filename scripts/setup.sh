#!/usr/bin/env bash
# ===================================================================
# Nearza — Project Setup Script (Linux/macOS)
# ===================================================================

set -e

DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." >/dev/null 2>&1 && pwd)"

echo "🛠️ [Nearza] Setting up project environment..."

# 1. Copy env templates if not present
if [ ! -f "$DIR/backend/.env" ]; then
    echo "📄 Copying backend/.env.example to backend/.env..."
    cp "$DIR/backend/.env.example" "$DIR/backend/.env"
fi

if [ ! -f "$DIR/frontend/.env" ]; then
    echo "📄 Copying frontend/.env.example to frontend/.env..."
    cp "$DIR/frontend/.env.example" "$DIR/frontend/.env"
fi

# 2. Install backend dependencies
echo "🐍 Installing Python dependencies..."
cd "$DIR/backend"
pip install -r requirements.txt

# 3. Install frontend dependencies
echo "⚛️ Installing Node dependencies..."
cd "$DIR/frontend"
npm install

echo "🎉 [Nearza] Setup complete! Remember to configure Supabase credentials in backend/.env."
