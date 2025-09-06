#!/usr/bin/env python3
"""
Kommunal Upphandlingsövervakare - MVP
Automatisk övervakning av svenska kommunala upphandlingar

VARNING: Detta är endast en prototyp för utbildningssyfte.
Verklig användning kräver juridisk granskning och GDPR-compliance.
"""

import sqlite3
import requests
import pandas as pd
import numpy as np
import logging
import json
import time
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Tuple
from dataclasses import dataclass, asdict
from pathlib import Path
import hashlib

# Konfigurera logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('procurement_monitor.log'),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger(__name__)

@dataclass
class Procurement:
    """Datastruktur för en upphandling"""
    id: str
    title: str
    municipality: str
    value: float
    date: datetime
    winner_company: str
    winner_org_nr: str
    category: str
    source: str

@dataclass
class Company:
    """Datastruktur för ett företag"""
    org_nr: str
    name: str
    owners: List[str]  # Lista med personnummer/org.nr för ägare
    board_members: List[str]
    registration_date: datetime

@dataclass
class AnomalyAlert:
    """Datastruktur för en anomali"""
    company_name: str
    company_org_nr: str
    municipality: str
    anomaly_type: str
    score: float
    details: str
    evidence: List[str]

class DatabaseManager:
    """Hanterar databasoperationer"""
    
    def __init__(self, db_path: str = "procurement_monitor.db"):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Initialiserar databas med nödvändiga tabeller"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        # Upphandlingar
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS procurements (
                id TEXT PRIMARY KEY,
                title TEXT,
                municipality TEXT,
                value REAL,
                date TEXT,
                winner_company TEXT,
                winner_org_nr TEXT,
                category TEXT,
                source TEXT,
                created_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Företag
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS companies (
                org_nr TEXT PRIMARY KEY,
                name TEXT,
                owners TEXT,  -- JSON array
                board_members TEXT,  -- JSON array
                registration_date TEXT,
                last_updated TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        # Anomalier
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS anomalies (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                company_name TEXT,
                company_org_nr TEXT,
                municipality TEXT,
                anomaly_type TEXT,
                score REAL,
                details TEXT,
                evidence TEXT,  -- JSON array
                detected_at TEXT DEFAULT CURRENT_TIMESTAMP
            )
        ''')
        
        conn.commit()
        conn.close()
        logger.info("Databas initialiserad")

    def store_procurement(self, procurement: Procurement):
        """Lagrar upphandling i databas"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT OR REPLACE INTO procurements 
            (id, title, municipality, value, date, winner_company, winner_org_nr, category, source)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ''', (
            procurement.id, procurement.title, procurement.municipality,
            procurement.value, procurement.date.isoformat(),
            procurement.winner_company, procurement.winner_org_nr,
            procurement.category, procurement.source
        ))
        
        conn.commit()
        conn.close()

    def get_procurements_by_municipality(self, municipality: str, days: int = 365) -> pd.DataFrame:
        """Hämtar upphandlingar för en kommun"""
        conn = sqlite3.connect(self.db_path)
        
        since_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        query = '''
            SELECT * FROM procurements 
            WHERE municipality = ? AND date >= ?
            ORDER BY date DESC
        '''
        
        df = pd.read_sql_query(query, conn, params=(municipality, since_date))
        conn.close()
        
        return df

    def get_all_procurements(self, limit: int = 100) -> List[dict]:
        """Hämtar alla upphandlingar för web API"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            SELECT * FROM procurements 
            ORDER BY date DESC 
            LIMIT ?
        ''', (limit,))
        
        columns = [description[0] for description in cursor.description]
        rows = cursor.fetchall()
        
        procurements = []
        for row in rows:
            proc_dict = dict(zip(columns, row))
            procurements.append(proc_dict)
        
        conn.close()
        return procurements

    def store_anomaly(self, anomaly: AnomalyAlert):
        """Lagrar anomali i databas"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        cursor.execute('''
            INSERT INTO anomalies 
            (company_name, company_org_nr, municipality, anomaly_type, score, details, evidence)
            VALUES (?, ?, ?, ?, ?, ?, ?)
        ''', (
            anomaly.company_name, anomaly.company_org_nr, anomaly.municipality,
            anomaly.anomaly_type, anomaly.score, anomaly.details,
            json.dumps(anomaly.evidence)
        ))
        
        conn.commit()
        conn.close()

    def get_recent_anomalies(self, days: int = 7) -> List[dict]:
        """Hämtar senaste anomalier"""
        conn = sqlite3.connect(self.db_path)
        cursor = conn.cursor()
        
        since_date = (datetime.now() - timedelta(days=days)).isoformat()
        
        cursor.execute('''
            SELECT * FROM anomalies 
            WHERE detected_at >= ?
            ORDER BY score DESC, detected_at DESC
        ''', (since_date,))
        
        columns = [description[0] for description in cursor.description]
        rows = cursor.fetchall()
        
        anomalies = []
        for row in rows:
            anomaly_dict = dict(zip(columns, row))
            anomaly_dict['evidence'] = json.loads(anomaly_dict['evidence'])
            anomalies.append(anomaly_dict)
        
        conn.close()
        return anomalies

class DataCollector:
    """Samlar data från olika källor"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        })

    def collect_ted_data(self, municipality: str = None) -> List[Procurement]:
        """
        Samlar data från TED-databasen (placeholder implementation)
        I verkligheten skulle detta kräva specifik API eller scraping
        """
        logger.info("Samlar TED-data...")
        
        # PLACEHOLDER: Simulerad data för demonstration
        sample_procurements = []
        
        for i in range(10):
            procurement = Procurement(
                id=f"ted_{i}_{int(datetime.now().timestamp())}",
                title=f"IT-upphandling {i} - Systemutveckling",
                municipality=municipality or "Stockholm",
                value=np.random.uniform(100000, 5000000),
                date=datetime.now() - timedelta(days=np.random.randint(1, 365)),
                winner_company=f"TechFirma {i} AB",
                winner_org_nr=f"55{i:08d}",
                category="IT-tjänster",
                source="TED"
            )
            sample_procurements.append(procurement)
            self.db_manager.store_procurement(procurement)
        
        logger.info(f"Samlade {len(sample_procurements)} upphandlingar från TED")
        return sample_procurements

    def collect_visma_data(self, municipality: str = None) -> List[Procurement]:
        """
        Samlar data från Visma Commerce (placeholder implementation)
        """
        logger.info("Samlar Visma Commerce-data...")
        
        sample_procurements = []
        
        for i in range(15):
            procurement = Procurement(
                id=f"visma_{i}_{int(datetime.now().timestamp())}",
                title=f"Byggprojekt {i} - Kommunal anläggning",
                municipality=municipality or "Göteborg",
                value=np.random.uniform(50000, 2000000),
                date=datetime.now() - timedelta(days=np.random.randint(1, 365)),
                winner_company=f"ByggBolag {i} AB",
                winner_org_nr=f"66{i:08d}",
                category="Byggentreprenad",
                source="Visma"
            )
            sample_procurements.append(procurement)
            self.db_manager.store_procurement(procurement)
        
        logger.info(f"Samlade {len(sample_procurements)} upphandlingar från Visma")
        return sample_procurements

class BolagsverketAPI:
    """Hanterar kommunikation med Bolagsverket API"""
    
    def __init__(self):
        self.api_key = "YOUR_BOLAGSVERKET_API_KEY"
        self.base_url = "https://api.bolagsverket.se/v1"
    
    def get_company_info(self, org_nr: str) -> Optional[Company]:
        """Hämtar företagsinformation från Bolagsverket"""
        logger.info(f"Hämtar info för org.nr: {org_nr}")
        
        time.sleep(0.1)  # Simulera API-fördröjning
        
        company = Company(
            org_nr=org_nr,
            name=f"Företag {org_nr[-3:]} AB",
            owners=[f"19{np.random.randint(50,99):02d}{np.random.randint(10,99):02d}{np.random.randint(1000,9999):04d}"],
            board_members=[f"19{np.random.randint(50,99):02d}{np.random.randint(10,99):02d}{np.random.randint(1000,9999):04d}"],
            registration_date=datetime.now() - timedelta(days=np.random.randint(365, 3650))
        )
        
        return company

class AnomalyDetector:
    """Upptäcker anomalier i upphandlingsdata"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager
    
    def detect_win_frequency_anomalies(self, municipality: str) -> List[AnomalyAlert]:
        """Upptäcker företag som vinner ovanligt ofta"""
        logger.info(f"Analyserar vinstfrekvens för {municipality}")
        
        df = self.db_manager.get_procurements_by_municipality(municipality)
        
        if df.empty:
            return []
        
        win_counts = df['winner_company'].value_counts()
        mean_wins = win_counts.mean()
        std_wins = win_counts.std()
        
        anomalies = []
        
        for company, wins in win_counts.items():
            if wins > mean_wins + 2 * std_wins:  # 2 standardavvikelser
                score = min(10, (wins - mean_wins) / std_wins)
                
                alert = AnomalyAlert(
                    company_name=company,
                    company_org_nr=df[df['winner_company'] == company]['winner_org_nr'].iloc[0],
                    municipality=municipality,
                    anomaly_type="Hög vinstfrekvens",
                    score=score,
                    details=f"Företaget har vunnit {wins} upphandlingar (medel: {mean_wins:.1f})",
                    evidence=[f"Antal vinster: {wins}", f"Standardavvikelser över medel: {(wins - mean_wins) / std_wins:.2f}"]
                )
                anomalies.append(alert)
                self.db_manager.store_anomaly(alert)
        
        logger.info(f"Upptäckte {len(anomalies)} vinstfrekvens-anomalier")
        return anomalies
    
    def detect_value_anomalies(self, municipality: str) -> List[AnomalyAlert]:
        """Upptäcker ovanligt höga upphandlingsvärden"""
        logger.info(f"Analyserar värdeanomalier för {municipality}")
        
        df = self.db_manager.get_procurements_by_municipality(municipality)
        
        if df.empty:
            return []
        
        anomalies = []
        
        for category in df['category'].unique():
            category_df = df[df['category'] == category]
            
            if len(category_df) < 5:
                continue
                
            mean_value = category_df['value'].mean()
            std_value = category_df['value'].std()
            
            for _, row in category_df.iterrows():
                if row['value'] > mean_value + 2 * std_value:
                    score = min(8, (row['value'] - mean_value) / std_value - 1)
                    
                    alert = AnomalyAlert(
                        company_name=row['winner_company'],
                        company_org_nr=row['winner_org_nr'],
                        municipality=municipality,
                        anomaly_type="Ovanligt högt värde",
                        score=score,
                        details=f"Upphandling värderad till {row['value']:,.0f} kr (medel för kategori: {mean_value:,.0f} kr)",
                        evidence=[f"Upphandling: {row['title']}", f"Värde: {row['value']:,.0f} kr"]
                    )
                    anomalies.append(alert)
                    self.db_manager.store_anomaly(alert)
        
        logger.info(f"Upptäckte {len(anomalies)} värdeanormalier")
        return anomalies

class ReportGenerator:
    """Genererar rapporter baserat på upptäckta anomalier"""
    
    def __init__(self, db_manager: DatabaseManager):
        self.db_manager = db_manager
    
    def generate_weekly_report(self, municipalities: List[str]) -> str:
        """Genererar veckorapport med upptäckta anomalier"""
        logger.info("Genererar veckorapport")
        
        report_date = datetime.now().strftime("%Y-%m-%d")
        report = f"# Veckorapport Upphandlingsövervakning - {report_date}\n\n"
        
        detector = AnomalyDetector(self.db_manager)
        all_anomalies = []
        
        for municipality in municipalities:
            report += f"## {municipality}\n\n"
            
            freq_anomalies = detector.detect_win_frequency_anomalies(municipality)
            value_anomalies = detector.detect_value_anomalies(municipality)
            
            municipality_anomalies = freq_anomalies + value_anomalies
            all_anomalies.extend(municipality_anomalies)
            
            if municipality_anomalies:
                for anomaly in municipality_anomalies:
                    report += f"**{anomaly.company_name}** (Riskpoäng: {anomaly.score:.1f})\n"
                    report += f"- Typ: {anomaly.anomaly_type}\n"
                    report += f"- Detaljer: {anomaly.details}\n\n"
            else:
                report += "Inga anomalier upptäckta denna vecka.\n\n"
        
        top_anomalies = sorted(all_anomalies, key=lambda x: x.score, reverse=True)[:10]
        
        if top_anomalies:
            report += "## Top 10 Mest Misstänkta\n\n"
            for i, anomaly in enumerate(top_anomalies, 1):
                report += f"{i}. **{anomaly.company_name}** ({anomaly.municipality})\n"
                report += f"   - Poäng: {anomaly.score:.1f}\n"
                report += f"   - Typ: {anomaly.anomaly_type}\n\n"
        
        report_file = f"rapport_{report_date}.md"
        with open(report_file, 'w', encoding='utf-8') as f:
            f.write(report)
        
        logger.info(f"Rapport sparad som {report_file}")
        return report

class ProcurementMonitor:
    """Huvudklass som orchestrerar hela systemet"""
    
    def __init__(self):
        self.db_manager = DatabaseManager()
        self.data_collector = DataCollector(self.db_manager)
        self.bolagsverket_api = BolagsverketAPI()
        self.report_generator = ReportGenerator(self.db_manager)
        
        self.municipalities = ["Stockholm", "Göteborg", "Malmö", "Uppsala", "Linköping"]
        
    def daily_update(self):
        """Utför daglig uppdatering av data"""
        logger.info("Startar daglig uppdatering")
        
        for municipality in self.municipalities:
            try:
                self.data_collector.collect_ted_data(municipality)
                self.data_collector.collect_visma_data(municipality)
                time.sleep(1)
                
            except Exception as e:
                logger.error(f"Fel vid insamling för {municipality}: {e}")
        
        logger.info("Daglig uppdatering klar")
    
    def weekly_analysis(self):
        """Utför veckoanalys och genererar rapport"""
        logger.info("Startar veckoanalys")
        
        try:
            report = self.report_generator.generate_weekly_report(self.municipalities)
            return report
            
        except Exception as e:
            logger.error(f"Fel vid veckoanalys: {e}")
            return None
    
    def run_full_cycle(self):
        """Kör en fullständig cykel av datainsamling och analys"""
        logger.info("Startar fullständig cykel")
        self.daily_update()
        time.sleep(2)
        report = self.weekly_analysis()
        logger.info("Fullständig cykel klar")
        return report

    def get_dashboard_data(self):
        """Hämtar data för dashboard"""
        recent_procurements = self.db_manager.get_all_procurements(50)
        recent_anomalies = self.db_manager.get_recent_anomalies(30)
        
        return {
            'procurements': recent_procurements,
            'anomalies': recent_anomalies,
            'municipalities': self.municipalities
        }

# Global monitor instance
monitor = None

def get_monitor():
    """Singleton för monitor instance"""
    global monitor
    if monitor is None:
        monitor = ProcurementMonitor()
    return monitor

def main():
    """Huvudfunktion för standalone körning"""
    print("Kommunal Upphandlingsövervakare - MVP")
    print("=" * 40)
    print("VARNING: Detta är endast en prototyp för demonstration!")
    print("Verklig användning kräver juridisk granskning och GDPR-compliance.")
    print()
    
    monitor = ProcurementMonitor()
    
    try:
        report = monitor.run_full_cycle()
        print("VECKORAPPORT GENERERAD:")
        print("=" * 50)
        print(report[:1000] + "..." if report and len(report) > 1000 else report)
        
    except KeyboardInterrupt:
        logger.info("Programmet avbröts av användaren")
    except Exception as e:
        logger.error(f"Oväntat fel: {e}")
    
    print("\nProgrammet avslutat.")

if __name__ == "__main__":
    main()
