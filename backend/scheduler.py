#!/usr/bin/env python3
"""
Automatisk datauppdatering för Nyhetsportalen
Schemalagd insamling från riktiga svenska datakällor
"""

import schedule
import time
import logging
import requests
from datetime import datetime
import os
from dotenv import load_dotenv

# Ladda miljövariabler
load_dotenv()

# Konfiguration
API_BASE_URL = os.getenv('API_BASE_URL', 'http://localhost:5000')
UPDATE_INTERVAL_HOURS = int(os.getenv('UPDATE_INTERVAL_HOURS', 6))
AUTO_UPDATE_ENABLED = os.getenv('AUTO_UPDATE_ENABLED', 'True').lower() == 'true'

# Logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/scheduler.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

def update_procurement_data():
    """Uppdatera upphandlingsdata"""
    try:
        logger.info("Starting scheduled procurement data update")
        
        response = requests.post(f"{API_BASE_URL}/api/update-data", 
                               json={'days_back': 7})
        
        if response.status_code == 200:
            result = response.json()
            logger.info(f"Update successful: {result['contracts_stored']} new contracts")
            
            # Skicka notifiering om många nya kontrakt
            if result['contracts_stored'] > 10:
                send_alert(f"Många nya upphandlingar: {result['contracts_stored']} kontrakt")
                
        else:
            logger.error(f"Update failed: {response.status_code}")
            
    except Exception as e:
        logger.error(f"Error during update: {e}")

def analyze_new_anomalies():
    """Analysera nya anomalier"""
    try:
        logger.info("Analyzing for new anomalies")
        
        response = requests.get(f"{API_BASE_URL}/api/anomalies")
        
        if response.status_code == 200:
            anomalies = response.json()
            
            # Kolla efter nya högrisk-anomalier
            high_risk = [a for a in anomalies if a.get('risk_score', 0) > 7]
            
            if high_risk:
                logger.warning(f"Found {len(high_risk)} high-risk anomalies")
                send_alert(f"⚠️ {len(high_risk)} högrisk anomalier upptäckta!")
                
    except Exception as e:
        logger.error(f"Error analyzing anomalies: {e}")

def send_alert(message: str):
    """Skicka varning via Slack/Discord"""
    try:
        slack_webhook = os.getenv('SLACK_WEBHOOK_URL')
        if slack_webhook:
            requests.post(slack_webhook, 
                         json={'text': f"🚨 Nyhetsportalen Alert: {message}"})
        
        discord_webhook = os.getenv('DISCORD_WEBHOOK_URL')
        if discord_webhook:
            requests.post(discord_webhook,
                         json={'content': f"🚨 Nyhetsportalen Alert: {message}"})
            
        logger.info(f"Alert sent: {message}")
        
    except Exception as e:
        logger.error(f"Error sending alert: {e}")

def health_check():
    """Kontrollera att API:et fungerar"""
    try:
        response = requests.get(f"{API_BASE_URL}/")
        if response.status_code != 200:
            send_alert("❌ API är nere!")
            logger.error("API health check failed")
        else:
            logger.info("API health check passed")
            
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        send_alert("❌ Kan inte nå API!")

def main():
    """Huvudfunktion för schemaläggning"""
    logger.info("Starting Nyhetsportalen scheduler")
    
    if not AUTO_UPDATE_ENABLED:
        logger.info("Auto-update disabled, exiting")
        return
    
    # Schemalägg uppdateringar
    schedule.every(UPDATE_INTERVAL_HOURS).hours.do(update_procurement_data)
    schedule.every(1).hours.do(analyze_new_anomalies)
    schedule.every(15).minutes.do(health_check)
    
    # Manuell första uppdatering
    logger.info("Running initial data update")
    update_procurement_data()
    analyze_new_anomalies()
    
    logger.info(f"Scheduler started. Updates every {UPDATE_INTERVAL_HOURS} hours")
    
    # Huvudloop
    while True:
        try:
            schedule.run_pending()
            time.sleep(60)  # Kolla varje minut
            
        except KeyboardInterrupt:
            logger.info("Scheduler stopped by user")
            break
        except Exception as e:
            logger.error(f"Scheduler error: {e}")
            time.sleep(300)  # Vänta 5 minuter vid fel

if __name__ == "__main__":
    main()
