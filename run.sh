#!/usr/bin/env bash
set -e
DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$DIR"

if ! command -v python3 >/dev/null 2>&1; then
  echo "Python 3 is required."; exit 1
fi
if ! command -v node >/dev/null 2>&1 || ! command -v npm >/dev/null 2>&1; then
  echo "Node.js and npm are required."; exit 1
fi

if [ ! -x "backend/venv/bin/python" ]; then
  echo "Creating backend virtual environment..."
  python3 -m venv backend/venv
fi
backend/venv/bin/python -m pip install -r backend/requirements.txt
if [ ! -d node_modules ]; then npm install; fi

cleanup() {
  [ -n "${BACKEND_PID:-}" ] && kill "$BACKEND_PID" 2>/dev/null || true
}
trap cleanup EXIT INT TERM

echo "Starting Focus Drift API at http://127.0.0.1:8000"
(cd backend && ./venv/bin/python -m uvicorn main:app --host 127.0.0.1 --port 8000 --reload) &
BACKEND_PID=$!
sleep 2
echo "Starting frontend at http://localhost:5173"
npm run dev -- --host 127.0.0.1
