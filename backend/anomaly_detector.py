#!/usr/bin/env python3
"""
Anomalidetektering för verkliga upphandlingar
Använder maskininlärning och statistisk analys
"""

import sqlite3
import pandas as pd
import numpy as np
from datetime import datetime, timedelta
from typing import List, Dict, Tuple
import logging
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import warnings
warnings.filterwarnings('ignore')

logger = logging.getLogger(__name__)

class RealAnomalyDetector:
    """Riktig anomalidetektering för svenska upphandlingar"""
    
    def __init__(self, db_path: str = 'nyhetsportalen.db'):
        self.db_path = db_path
        self.scaler = StandardScaler()
        self.isolation_forest = IsolationForest(contamination=0.1, random_state=42)
        
        # Svenska företag som ofta vinner upphandlingar (för jämförelse)
        self.major_contractors = {
            'Skanska AB', 'NCC AB', 'Peab AB', 'JM AB', 'Veidekke Sverige AB',
            'ISS Facility Services AB', 'Securitas AB', 'Compass Group Sverige AB',
            'Sodexo Sverige AB', 'Coor Service Management AB', 'Ericsson AB',
            'CGI Sverige AB', 'Tieto EVRY', 'Accenture AB', 'Capgemini Sverige AB'
        }
    
    def detect_price_anomalies(self) -> List[Dict]:
        """Upptäck prisanomalier i upphandlingar"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                df = pd.read_sql_query('''
                    SELECT id, title, contracting_authority, winner_name, 
                           value, currency, award_date, municipality, cpv_codes
                    FROM procurements 
                    WHERE value > 0 
                    AND award_date >= date('now', '-1 year')
                ''', conn)
            
            if df.empty:
                return []
            
            anomalies = []
            
            # Gruppera per CPV-kod (kategori)
            df['cpv_main'] = df['cpv_codes'].str.split(',').str[0]
            
            for cpv_code in df['cpv_main'].unique():
                if pd.isna(cpv_code):
                    continue
                
                cpv_df = df[df['cpv_main'] == cpv_code].copy()
                if len(cpv_df) < 5:  # Behöver minst 5 kontrakt för analys
                    continue
                
                # Statistisk analys
                mean_value = cpv_df['value'].mean()
                std_value = cpv_df['value'].std()
                
                # Hitta outliers (> 3 standardavvikelser)
                outliers = cpv_df[
                    (cpv_df['value'] > mean_value + 3 * std_value) |
                    (cpv_df['value'] < mean_value - 3 * std_value)
                ]
                
                for _, row in outliers.iterrows():
                    anomaly_type = "Prisavvikelse"
                    risk_score = min(10, abs(row['value'] - mean_value) / std_value)
                    
                    description = f"Kontraktsvärde {row['value']:,.0f} SEK avviker från medel {mean_value:,.0f} SEK"
                    
                    anomalies.append({
                        'procurement_id': row['id'],
                        'anomaly_type': anomaly_type,
                        'description': description,
                        'risk_score': risk_score,
                        'details': {
                            'contract_value': row['value'],
                            'category_mean': mean_value,
                            'standard_deviations': abs(row['value'] - mean_value) / std_value,
                            'cpv_code': cpv_code
                        }
                    })
            
            return anomalies
            
        except Exception as e:
            logger.error(f"Error detecting price anomalies: {e}")
            return []
    
    def detect_winner_concentration(self) -> List[Dict]:
        """Upptäck onormal koncentration av vinnare"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                df = pd.read_sql_query('''
                    SELECT id, title, contracting_authority, winner_name, 
                           value, municipality, award_date
                    FROM procurements 
                    WHERE award_date >= date('now', '-1 year')
                ''', conn)
            
            if df.empty:
                return []
            
            anomalies = []
            
            # Analysera per kommun
            for municipality in df['municipality'].unique():
                muni_df = df[df['municipality'] == municipality].copy()
                
                if len(muni_df) < 10:  # Behöver minst 10 kontrakt
                    continue
                
                # Beräkna marknadskoncentration
                winner_counts = muni_df['winner_name'].value_counts()
                total_contracts = len(muni_df)
                
                # Herfindahl-Hirschman Index (HHI)
                hhi = sum((count / total_contracts) ** 2 for count in winner_counts) * 10000
                
                # HHI > 2500 indikerar hög koncentration
                if hhi > 2500:
                    top_winner = winner_counts.index[0]
                    win_rate = winner_counts.iloc[0] / total_contracts
                    
                    # Kolla om det är ett känt stort företag (mindre misstänkt)
                    if top_winner not in self.major_contractors and win_rate > 0.4:
                        # Hämta kontrakt från denna vinnare
                        winner_contracts = muni_df[muni_df['winner_name'] == top_winner]
                        
                        for _, contract in winner_contracts.iterrows():
                            anomalies.append({
                                'procurement_id': contract['id'],
                                'anomaly_type': 'Marknadskoncentration',
                                'description': f"{top_winner} vinner {win_rate:.1%} av kontrakt i {municipality}",
                                'risk_score': min(10, (win_rate - 0.3) * 20),  # Risk ökar över 30%
                                'details': {
                                    'winner_name': top_winner,
                                    'win_rate': win_rate,
                                    'hhi_score': hhi,
                                    'total_contracts': total_contracts,
                                    'municipality': municipality
                                }
                            })
            
            return anomalies
            
        except Exception as e:
            logger.error(f"Error detecting winner concentration: {e}")
            return []
    
    def detect_timing_anomalies(self) -> List[Dict]:
        """Upptäck misstänkta tidsmönster"""
        try:
            with sqlite3.connect(self.db_path) as conn:
                df = pd.read_sql_query('''
                    SELECT id, title, contracting_authority, winner_name, 
                           value, award_date, municipality
                    FROM procurements 
                    WHERE award_date >= date('now', '-1 year')
                ''', conn)
            
            if df.empty:
                return []
            
            df['award_date'] = pd.to_datetime(df['award_date'])
            df['month'] = df['award_date'].dt.month
            df['day_of_week'] = df['award_date'].dt.dayofweek
            
            anomalies = []
            
            # Kolla efter kluster av kontrakt samma dag
            date_counts = df['award_date'].dt.date.value_counts()
            suspicious_dates = date_counts[date_counts > 5]  # Fler än 5 kontrakt samma dag
            
            for date, count in suspicious_dates.items():
                contracts_on_date = df[df['award_date'].dt.date == date]
                
                # Extra misstänkt om samma vinnare eller myndighet
                winner_concentration = contracts_on_date['winner_name'].value_counts()
                authority_concentration = contracts_on_date['contracting_authority'].value_counts()
                
                if winner_concentration.iloc[0] > 2 or authority_concentration.iloc[0] > 3:
                    for _, contract in contracts_on_date.iterrows():
                        anomalies.append({
                            'procurement_id': contract['id'],
                            'anomaly_type': 'Tidskluster',
                            'description': f"{count} kontrakt tilldelade samma dag ({date})",
                            'risk_score': min(10, count * 1.5),
                            'details': {
                                'award_date': str(date),
                                'contracts_same_day': count,
                                'same_winner_count': winner_concentration.get(contract['winner_name'], 0),
                                'same_authority_count': authority_concentration.get(contract['contracting_authority'], 0)
                            }
                        })
            
            return anomalies
            
        except Exception as e:
            logger.error(f"Error detecting timing anomalies: {e}")
            return []
    
    def detect_small_company_bias(self) -> List[Dict]:
        """Upptäck onormal favorisering av små företag"""
        try:
            anomalies = []
            
            with sqlite3.connect(self.db_path) as conn:
                # Hämta företagsinformation för att bedöma storlek
                df = pd.read_sql_query('''
                    SELECT p.id, p.title, p.contracting_authority, p.winner_name, 
                           p.value, p.municipality, c.employees, c.revenue
                    FROM procurements p
                    LEFT JOIN companies c ON p.winner_org_nr = c.org_nr
                    WHERE p.award_date >= date('now', '-1 year')
                    AND p.value > 1000000  -- Endast stora kontrakt
                ''', conn)
                
                # Definiera "små företag" som < 50 anställda eller < 10M SEK omsättning
                small_companies = df[
                    ((df['employees'] < 50) & (df['employees'] > 0)) |
                    ((df['revenue'] < 10000000) & (df['revenue'] > 0))
                ]
                
                # Gruppera per upphandlande myndighet
                for authority in df['contracting_authority'].unique():
                    authority_df = df[df['contracting_authority'] == authority]
                    authority_small = small_companies[small_companies['contracting_authority'] == authority]
                    
                    if len(authority_df) < 5:
                        continue
                    
                    small_ratio = len(authority_small) / len(authority_df)
                    
                    # Misstänkt om > 60% går till små företag för stora kontrakt
                    if small_ratio > 0.6:
                        for _, contract in authority_small.iterrows():
                            anomalies.append({
                                'procurement_id': contract['id'],
                                'anomaly_type': 'Småföretagsbias',
                                'description': f"Stort kontrakt till litet företag: {contract['winner_name']}",
                                'risk_score': min(10, small_ratio * 12),
                                'details': {
                                    'contract_value': contract['value'],
                                    'company_employees': contract['employees'],
                                    'company_revenue': contract['revenue'],
                                    'authority_small_ratio': small_ratio,
                                    'contracting_authority': contract['contracting_authority']
                                }
                            })
            
            return anomalies
            
        except Exception as e:
            logger.error(f"Error detecting small company bias: {e}")
            return []
    
    def run_full_analysis(self) -> Dict:
        """Kör fullständig anomalianalys"""
        logger.info("Starting comprehensive anomaly detection")
        
        all_anomalies = []
        
        # Kör alla anomalidetekteringar
        all_anomalies.extend(self.detect_price_anomalies())
        all_anomalies.extend(self.detect_winner_concentration()) 
        all_anomalies.extend(self.detect_timing_anomalies())
        all_anomalies.extend(self.detect_small_company_bias())
        
        # Lagra i databas
        stored_count = 0
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            for anomaly in all_anomalies:
                try:
                    cursor.execute('''
                        INSERT OR REPLACE INTO anomalies 
                        (procurement_id, anomaly_type, description, risk_score)
                        VALUES (?, ?, ?, ?)
                    ''', (
                        anomaly['procurement_id'],
                        anomaly['anomaly_type'],
                        anomaly['description'],
                        anomaly['risk_score']
                    ))
                    stored_count += 1
                except Exception as e:
                    logger.error(f"Error storing anomaly: {e}")
                    continue
            
            conn.commit()
        
        # Sammanfattning
        summary = {
            'total_anomalies': len(all_anomalies),
            'stored_anomalies': stored_count,
            'by_type': {},
            'high_risk_count': len([a for a in all_anomalies if a['risk_score'] > 7]),
            'timestamp': datetime.now().isoformat()
        }
        
        # Gruppera per typ
        for anomaly in all_anomalies:
            anomaly_type = anomaly['anomaly_type']
            if anomaly_type not in summary['by_type']:
                summary['by_type'][anomaly_type] = 0
            summary['by_type'][anomaly_type] += 1
        
        logger.info(f"Anomaly detection complete: {len(all_anomalies)} anomalies found")
        
        return summary

def main():
    """Kör anomalidetektering som standalone"""
    logging.basicConfig(level=logging.INFO)
    
    detector = RealAnomalyDetector()
    result = detector.run_full_analysis()
    
    print(f"Anomalidetektering klar:")
    print(f"- Totalt: {result['total_anomalies']} anomalier")
    print(f"- Högrisk: {result['high_risk_count']} anomalier")
    print(f"- Per typ: {result['by_type']}")

if __name__ == "__main__":
    main()
