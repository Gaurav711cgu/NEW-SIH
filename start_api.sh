#!/bin/bash
# start_api.sh — Start the DeepScan FastAPI backend
set -e
cd "$(dirname "$0")"

# Activate venv if present
[ -f venv/bin/activate ] && source venv/bin/activate

# Install FastAPI if not present
pip install fastapi "uvicorn[standard]" python-multipart -q

echo ""
echo "🌊 DeepScan API starting on http://localhost:8000"
echo "   Docs: http://localhost:8000/docs"
echo ""
python -m uvicorn api.main:app --host 0.0.0.0 --port 8000 --reload
