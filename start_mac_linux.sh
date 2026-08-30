#!/bin/bash
# ==============================================================================
# AQUILA (DeepScan) - Autonomous Marine Intelligence OS
# Smart India Hackathon 2026 (PS-26057 & PS-1)
# 1-Click Startup Script for macOS & Linux
# ==============================================================================

set -e
PROJECT_ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$PROJECT_ROOT"

echo "======================================================================"
echo "  🌊 LAUNCHING AQUILA OCEANOGRAPHIC COMMAND & CONTROL OS"
echo "======================================================================"

# 1. Check Python
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is required but not installed. Please install Python 3.9+."
    exit 1
fi

# 2. Check Node & NPM
if ! command -v npm &> /dev/null; then
    echo "❌ Node.js and NPM are required for the frontend. Please install Node.js 18+."
    exit 1
fi

# 3. Setup Python Backend Virtual Environment (if needed)
if [ ! -d "venv" ]; then
    echo "📦 Creating Python virtual environment..."
    python3 -m venv venv
fi

echo "📦 Activating virtual environment & checking backend dependencies..."
source venv/bin/activate
pip install -q -r requirements.txt

# 4. Setup Frontend Dependencies (if node_modules is missing)
if [ ! -d "frontend/node_modules" ]; then
    echo "📦 Installing frontend dependencies (React 19 + Tailwind + Lucide)..."
    cd "$PROJECT_ROOT/frontend"
    npm install
    cd "$PROJECT_ROOT"
fi

# 5. Terminate any previous instances on ports 8000 and 5173
echo "🧹 Cleaning up existing server processes..."
lsof -ti:8000 | xargs kill -9 2>/dev/null || true
lsof -ti:5173 | xargs kill -9 2>/dev/null || true

# 6. Start FastAPI Backend
echo "🚀 Starting AQUILA FastAPI Backend on http://localhost:8000..."
python3 -m uvicorn api.main:app --host 0.0.0.0 --port 8000 > api_server.log 2>&1 &
BACKEND_PID=$!
echo "   Backend running (PID: $BACKEND_PID)"

# 7. Start React Frontend
echo "🚀 Starting AQUILA React Frontend on http://localhost:5173..."
cd "$PROJECT_ROOT/frontend"
npm run dev -- --host 0.0.0.0 --port 5173 > ../frontend_dev.log 2>&1 &
FRONTEND_PID=$!
cd "$PROJECT_ROOT"
echo "   Frontend running (PID: $FRONTEND_PID)"

# 8. Wait for services to become available
echo "⏳ Waiting for services to initialize..."
sleep 3

echo ""
echo "======================================================================"
echo "  ✅ AQUILA SYSTEM IS LIVE AND OPERATIONAL!"
echo "  🌐 Frontend Dashboard: http://localhost:5173"
echo "  ⚡ Backend API Docs:   http://localhost:8000/docs"
echo "  📊 Health Endpoint:    http://localhost:8000/api/health"
echo "======================================================================"
echo ""
echo "Press Ctrl+C to stop all services."

# Open Browser automatically
if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:5173"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "http://localhost:5173" 2>/dev/null || true
fi

# Trap SIGINT to kill background processes on exit
trap "echo 'Stopping AQUILA servers...'; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null || true; exit" SIGINT SIGTERM
wait
