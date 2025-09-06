# 🚀 Nyhetsportalen Backend - Deployment Guide

## 📋 Produktionsdeployment

### Railway.app (Rekommenderat - Gratis tier)

1. **Skapa Railway-konto:** https://railway.app/
2. **Connect GitHub repository:**
   ```bash
   git push origin main  # Se till att allt är committat
   ```
3. **Deploy från GitHub:**
   - Gå till Railway dashboard
   - "New Project" → "Deploy from GitHub repo"
   - Välj denna repository
   - Railway detekterar automatiskt Python-projektet

4. **Sätt miljövariabler i Railway:**
   ```
   FLASK_ENV=production
   PORT=5000
   TED_API_KEY=din-ted-api-nyckel-här
   BOLAGSVERKET_API_KEY=din-bolagsverket-nyckel-här
   ```

5. **URL:** Railway ger dig automatiskt en URL typ: `nyhetsportalen-production-xxxx.up.railway.app`

### Render.com (Alternativ)

1. **Skapa Render-konto:** https://render.com/
2. **Ny Web Service:**
   - Connect GitHub repository
   - Build command: `cd backend && pip install -r requirements.txt`
   - Start command: `cd backend && python app.py`

3. **Miljövariabler:**
   ```
   FLASK_ENV=production
   TED_API_KEY=din-api-nyckel
   BOLAGSVERKET_API_KEY=din-api-nyckel
   ```

### Heroku (Om du har Heroku-konto)

1. **Installera Heroku CLI och logga in**
2. **Deploy:**
   ```bash
   heroku create nyhetsportalen-backend
   heroku config:set FLASK_ENV=production
   heroku config:set TED_API_KEY=din-nyckel
   heroku config:set BOLAGSVERKET_API_KEY=din-nyckel
   git push heroku main
   ```

## 🔑 API-nycklar

### TED (Tenders Electronic Daily) API

1. **Registrera:** https://ted.europa.eu/
2. **API-dokumentation:** https://ted.europa.eu/api/
3. **Gratis tier:** 1000 requests/dag
4. **Kostnad:** Högre tier från €50/månad

**Alternativ för TED:**
- **Open Contracting Data:** https://standard.open-contracting.org/
- **Svenska ESV-data:** https://www.esv.se/statistik-och-uppfoljning/
- **Upphandlingsmyndigheten:** https://upphandlingsmyndigheten.se/

### Bolagsverket API

1. **Registrera:** https://data.bolagsverket.se/
2. **API-nyckel:** Gratis för grunddata
3. **Premium:** Styrelsedata och finansiell info (kostnad)

**Alternativ för företagsdata:**
- **Allabolag.se API:** https://www.allabolag.se/api
- **Bisnode API:** https://www.bisnode.se/
- **UC API:** https://www.uc.se/

## 🔧 Lokal utveckling med riktiga API:er

1. **Skapa .env-fil:**
   ```bash
   cp backend/.env.example backend/.env
   ```

2. **Redigera .env:**
   ```
   FLASK_ENV=development
   TED_API_KEY=din-ted-nyckel-här
   BOLAGSVERKET_API_KEY=din-bolagsverket-nyckel
   DATABASE_URL=sqlite:///nyhetsportalen.db
   ```

3. **Installera dependencies:**
   ```bash
   cd backend
   pip install -r requirements.txt
   ```

4. **Starta backend:**
   ```bash
   python app.py
   ```

## 📊 Uppdatera frontend för produktions-backend

När din backend är deployad, uppdatera `production-api.js`:

```javascript
// Ändra i production-api.js
const BACKEND_URL = 'https://din-railway-url.up.railway.app';
// eller din Render/Heroku URL
```

## 🛡️ Säkerhet

### Produktionsrekommendationer:

1. **HTTPS:** Alla deployment-plattformar ger automatiskt HTTPS
2. **API-nycklar:** Använd alltid miljövariabler, aldrig hårdkodade nycklar
3. **Rate limiting:** Implementera i produktion
4. **Monitoring:** Lägg till error tracking (Sentry, etc.)

### Rate Limiting exempel:
```python
# Lägg till i requirements.txt:
# Flask-Limiter==3.5.0

from flask_limiter import Limiter
from flask_limiter.util import get_remote_address

limiter = Limiter(
    app,
    key_func=get_remote_address,
    default_limits=["200 per day", "50 per hour"]
)

@app.route('/api/update-data', methods=['POST'])
@limiter.limit("5 per hour")
def update_data():
    # ...
```

## 📈 Monitoring och underhåll

### Automatiska datauppdateringar:

Backend inkluderar `scheduler.py` som automatiskt:
- Hämtar nya upphandlingar var 6:e timme
- Kör anomalianalys dagligen
- Loggar alla aktiviteter

### Health check:
```bash
curl https://din-backend-url.com/
```

### Manuell datauppdatering:
```bash
curl -X POST https://din-backend-url.com/api/update-data \
     -H "Content-Type: application/json" \
     -d '{"days_back": 30}'
```

### Avancerad anomalianalys:
```bash
curl -X POST https://din-backend-url.com/api/run-analysis
```

## 🎯 Nästa steg

1. **Deploy backend** till Railway/Render
2. **Hämta API-nycklar** för TED och Bolagsverket
3. **Uppdatera frontend** med din backend-URL
4. **Testa systemet** med riktiga data
5. **Övervaka prestanda** och felsök vid behov

## 💡 Tips

- **Börja med gratis tiers** för att testa
- **Använd fallback-data** när API:er inte svarar
- **Övervaka API-kvoter** för att undvika extra kostnader
- **Implementera caching** för bättre prestanda
- **Sätt upp alerts** för systemhälsa

Din backend kommer nu att fungera med riktiga svenska data! 🇸🇪
