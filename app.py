from flask import Flask, render_template, jsonify, request, session, redirect, url_for
from flask_cors import CORS
import json
import threading
import time
from datetime import datetime
from procurement_monitor import get_monitor, ProcurementMonitor

app = Flask(__name__)
app.secret_key = 'your-secret-key-here-change-in-production'
CORS(app)

# Admin credentials
ADMIN_CREDENTIALS = {
    'username': 'admin',
    'password': 'nyheter2025'
}

@app.route('/api/auth', methods=['POST'])
def authenticate():
    """API endpoint för autentisering"""
    data = request.get_json()
    username = data.get('username')
    password = data.get('password')
    
    if username == ADMIN_CREDENTIALS['username'] and password == ADMIN_CREDENTIALS['password']:
        session['authenticated'] = True
        return jsonify({'success': True, 'message': 'Inloggning lyckades'})
    else:
        return jsonify({'success': False, 'message': 'Fel användarnamn eller lösenord'}), 401

@app.route('/api/logout', methods=['POST'])
def logout():
    """API endpoint för utloggning"""
    session.pop('authenticated', None)
    return jsonify({'success': True, 'message': 'Utloggad'})

@app.route('/api/procurement/dashboard')
def procurement_dashboard():
    """API endpoint för dashboard-data"""
    if not session.get('authenticated'):
        return jsonify({'error': 'Ej autentiserad'}), 401
    
    try:
        monitor = get_monitor()
        dashboard_data = monitor.get_dashboard_data()
        
        # Lägg till statistik
        stats = {
            'total_procurements': len(dashboard_data['procurements']),
            'total_anomalies': len(dashboard_data['anomalies']),
            'municipalities_monitored': len(dashboard_data['municipalities']),
            'high_risk_companies': len([a for a in dashboard_data['anomalies'] if a['score'] > 7])
        }
        
        dashboard_data['stats'] = stats
        
        return jsonify(dashboard_data)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/procurement/update', methods=['POST'])
def run_procurement_update():
    """API endpoint för att köra datauppdatering"""
    if not session.get('authenticated'):
        return jsonify({'error': 'Ej autentiserad'}), 401
    
    try:
        monitor = get_monitor()
        
        # Kör uppdatering i bakgrunden
        def update_worker():
            monitor.daily_update()
        
        thread = threading.Thread(target=update_worker)
        thread.daemon = True
        thread.start()
        
        return jsonify({'success': True, 'message': 'Datauppdatering startad'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/procurement/analyze', methods=['POST'])
def run_procurement_analysis():
    """API endpoint för att köra analys"""
    if not session.get('authenticated'):
        return jsonify({'error': 'Ej autentiserad'}), 401
    
    try:
        monitor = get_monitor()
        
        # Kör analys i bakgrunden
        def analysis_worker():
            return monitor.weekly_analysis()
        
        thread = threading.Thread(target=analysis_worker)
        thread.daemon = True
        thread.start()
        
        return jsonify({'success': True, 'message': 'Analys startad'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/procurement/full-cycle', methods=['POST'])
def run_full_cycle():
    """API endpoint för fullständig cykel"""
    if not session.get('authenticated'):
        return jsonify({'error': 'Ej autentiserad'}), 401
    
    try:
        monitor = get_monitor()
        
        def full_cycle_worker():
            return monitor.run_full_cycle()
        
        thread = threading.Thread(target=full_cycle_worker)
        thread.daemon = True
        thread.start()
        
        return jsonify({'success': True, 'message': 'Fullständig cykel startad'})
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/procurement/procurements')
def get_procurements():
    """API endpoint för att hämta upphandlingar"""
    if not session.get('authenticated'):
        return jsonify({'error': 'Ej autentiserad'}), 401
    
    try:
        monitor = get_monitor()
        limit = request.args.get('limit', 100, type=int)
        procurements = monitor.db_manager.get_all_procurements(limit)
        return jsonify(procurements)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/api/procurement/anomalies')
def get_anomalies():
    """API endpoint för att hämta anomalier"""
    if not session.get('authenticated'):
        return jsonify({'error': 'Ej autentiserad'}), 401
    
    try:
        monitor = get_monitor()
        days = request.args.get('days', 30, type=int)
        anomalies = monitor.db_manager.get_recent_anomalies(days)
        return jsonify(anomalies)
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/health')
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'timestamp': datetime.now().isoformat(),
        'service': 'Procurement Monitor API'
    })

if __name__ == '__main__':
    # Initiera monitor vid start
    try:
        monitor = get_monitor()
        print("Procurement Monitor API startar...")
        print("Databas initialiserad")
    except Exception as e:
        print(f"Fel vid initiering: {e}")
    
    app.run(host='0.0.0.0', port=5000, debug=True)
