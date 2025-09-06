#!/bin/bash
# Stoppa Nyhetsportalen Backend

echo "🛑 Stoppar Nyhetsportalen Backend..."

# Stoppa API
if [ -f "api.pid" ]; then
    API_PID=$(cat api.pid)
    echo "🌐 Stoppar API (PID: $API_PID)..."
    kill $API_PID 2>/dev/null
    rm api.pid
fi

# Stoppa scheduler
if [ -f "scheduler.pid" ]; then
    SCHEDULER_PID=$(cat scheduler.pid)
    echo "⏰ Stoppar scheduler (PID: $SCHEDULER_PID)..."
    kill $SCHEDULER_PID 2>/dev/null
    rm scheduler.pid
fi

# Stoppa eventuella Gunicorn-processer
pkill -f "gunicorn.*app:app" 2>/dev/null

echo "✅ Backend stoppad!"
