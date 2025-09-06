#!/bin/bash
# Produktionsstart för Nyhetsportalen Backend

echo "🚀 Startar Nyhetsportalen Backend - Produktionsversion"

# Kontrollera om Python finns
if ! command -v python3 &> /dev/null; then
    echo "❌ Python3 krävs men är inte installerat"
    exit 1
fi

# Skapa virtuell miljö om den inte finns
if [ ! -d "venv" ]; then
    echo "📦 Skapar virtuell miljö..."
    python3 -m venv venv
fi

# Aktivera virtuell miljö
echo "🔧 Aktiverar virtuell miljö..."
source venv/bin/activate

# Installera dependencies
echo "📚 Installerar dependencies..."
pip install -r requirements.txt

# Skapa logs-mapp
mkdir -p logs

# Skapa .env från exempel om den inte finns
if [ ! -f ".env" ]; then
    echo "⚙️  Skapar .env från exempel..."
    cp .env.example .env
    echo "⚠️  VIKTIGT: Redigera .env med dina API-nycklar!"
fi

# Initiera databas
echo "🗄️  Initierar databas..."
python3 -c "
from app import db_manager
print('Databas initierad!')
"

# Starta Flask API i bakgrunden
echo "🌐 Startar Flask API..."
export FLASK_APP=app.py
export FLASK_ENV=production

# Kör med Gunicorn för produktion
if command -v gunicorn &> /dev/null; then
    echo "🚀 Startar med Gunicorn (produktionsserver)"
    gunicorn --bind 0.0.0.0:5000 --workers 4 --timeout 120 app:app &
    API_PID=$!
else
    echo "🔧 Startar med Flask dev server (installera gunicorn för produktion)"
    python3 app.py &
    API_PID=$!
fi

echo "📝 API PID: $API_PID"

# Vänta lite för API att starta
sleep 5

# Starta scheduler
echo "⏰ Startar automatisk datauppdatering..."
python3 scheduler.py &
SCHEDULER_PID=$!

echo "📝 Scheduler PID: $SCHEDULER_PID"

# Spara PID:s för att kunna stoppa senare
echo $API_PID > api.pid
echo $SCHEDULER_PID > scheduler.pid

echo "✅ Nyhetsportalen Backend igång!"
echo "🌐 API: http://localhost:5000"
echo "📊 Test API: curl http://localhost:5000"

# Första datauppdatering
echo "🔄 Kör första datauppdatering..."
sleep 2
curl -X POST http://localhost:5000/api/update-data -H "Content-Type: application/json" -d '{"days_back": 30}'

echo ""
echo "🎯 För att stoppa servern: ./stop.sh"
echo "📋 För att se loggar: tail -f logs/*.log"
echo "🔧 För att konfigurera: redigera .env"

# Håll scriptet igång
echo "💡 Tryck Ctrl+C för att stoppa..."
wait
