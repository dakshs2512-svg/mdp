#!/usr/bin/env bash
# Focus Drift — Complete Local Launch Script
# Launches both FastAPI Backend (port 8000) and Vite Frontend (port 5173)

DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" >/dev/null 2>&1 && pwd )"
cd "$DIR"

# Ensure Node & npm from workspace tools are in PATH
if [ -d "/Users/aditrisingh/.gemini/antigravity/scratch/.tools/bin" ]; then
  export PATH="/Users/aditrisingh/.gemini/antigravity/scratch/.tools/bin:$PATH"
fi

echo "=========================================================="
echo "    ⚡ FOCUS DRIFT — Sustained Attention & Drift AI      "
echo "        College Multidisciplinary Project (MDP)           "
echo "=========================================================="
echo "Python: $(./backend/venv/bin/python --version 2>/dev/null || python3 --version)"
echo "Node:   $(node -v 2>/dev/null || echo 'Not found')"
echo ""

# Function to kill child processes on script exit
cleanup() {
  echo ""
  echo "Shutting down Focus Drift services..."
  if [ -n "$BACKEND_PID" ]; then
    kill "$BACKEND_PID" 2>/dev/null || true
  fi
  if [ -n "$FRONTEND_PID" ]; then
    kill "$FRONTEND_PID" 2>/dev/null || true
  fi
  exit 0
}
trap cleanup SIGINT SIGTERM EXIT

# 1. Start FastAPI Backend in background
echo "🚀 Starting FastAPI AI Change-Point Engine on http://127.0.0.1:8000..."
cd "$DIR/backend"
./venv/bin/uvicorn main:app --port 8000 --reload > /dev/null 2>&1 &
BACKEND_PID=$!
cd "$DIR"

# Wait a moment for backend to initialize
sleep 1.5

# 2. Start Vite Frontend
echo "🌐 Starting Vite React Frontend on http://localhost:5173..."
echo "   Interactive UI: http://localhost:5173"
echo "   API Swagger:    http://127.0.0.1:8000/docs"
echo "=========================================================="
echo "Press Ctrl+C to stop all services."
echo ""

npm run dev &
FRONTEND_PID=$!

wait
