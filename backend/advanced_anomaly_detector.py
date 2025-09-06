#!/usr/bin/env python3
"""
Avancerad Anomalidetektor för Nyhetsportalen
Använder machine learning och statistiska metoder för att upptäcka misstänkta mönster
"""

import numpy as np
import pandas as pd
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import DBSCAN
from datetime import datetime, timedelta
import sqlite3
import logging
from typing import List, Dict, Tuple
import json
import re

logger = logging.getLogger(__name__)

class AdvancedAnomalyDetector:
    """Avancerad anomalidetektor med ML och statistisk analys"""
    
    def __init__(self, db_path: str = 'nyhetsportalen.db'):
        self.db_path = db_path
        self.scaler = StandardScaler()
        self.isolation_forest = IsolationForest(
            contamination=0.1,  # 10% förväntas vara anomalier
            random_state=42,
            n_estimators=100
        )
        
    def detect_all_anomalies(self) -> List[Dict]:
        """Kör all anomalidetektion och returnera alla upptäckta anomalier"""
        all_anomalies = []
        
        try:
            # 1. Prisanomalier (statistiska outliers)
            price_anomalies = self.detect_price_anomalies()
            all_anomalies.extend(price_anomalies)
            
            # 2. Marknadskoncentration
            market_anomalies = self.detect_market_concentration()
            all_anomalies.extend(market_anomalies)
            
            # 3. Tidsanomalier (clustering)
            time_anomalies = self.detect_time_clustering()
            all_anomalies.extend(time_anomalies)
            
            # 4. Geografiska anomalier
            geo_anomalies = self.detect_geographical_anomalies()
            all_anomalies.extend(geo_anomalies)
            
            # 5. Machine Learning-baserade anomalier
            ml_anomalies = self.detect_ml_anomalies()
            all_anomalies.extend(ml_anomalies)
            
            # 6. Nätverksanomalier (företag-myndighet kopplingar)
            network_anomalies = self.detect_network_anomalies()
            all_anomalies.extend(network_anomalies)
            
            logger.info(f"Detected {len(all_anomalies)} total anomalies")
            return all_anomalies
            
        except Exception as e:
            logger.error(f"Error in anomaly detection: {e}")
            return []
    
    def detect_price_anomalies(self) -> List[Dict]:
        """Upptäck prisanomalier inom samma kategori"""
        anomalies = []
        
        with sqlite3.connect(self.db_path) as conn:
            # Hämta alla kontrakt med CPV-koder
            df = pd.read_sql_query('''
                SELECT id, title, contracting_authority, winner_name, 
                       value, cpv_codes, award_date, municipality
                FROM procurements 
                WHERE value > 0 AND cpv_codes IS NOT NULL
                ORDER BY award_date DESC
            ''', conn)
            
            if df.empty:
                return anomalies
            
            # Gruppera per CPV-kategori
            for cpv_group in df['cpv_codes'].unique():
                if not cpv_group:
                    continue
                    
                group_data = df[df['cpv_codes'] == cpv_group]
                if len(group_data) < 3:  # Behöver minst 3 för statistik
                    continue
                
                # Beräkna statistik
                values = group_data['value']
                mean_val = values.mean()
                std_val = values.std()
                q1 = values.quantile(0.25)
                q3 = values.quantile(0.75)
                iqr = q3 - q1
                
                # IQR-metoden för outliers
                upper_bound = q3 + 1.5 * iqr
                lower_bound = q1 - 1.5 * iqr
                
                # Z-score för extrema outliers
                z_threshold = 2.5
                
                for _, row in group_data.iterrows():
                    value = row['value']
                    z_score = abs(value - mean_val) / std_val if std_val > 0 else 0
                    
                    # Kontrollera om det är en outlier
                    is_outlier = (value > upper_bound or value < lower_bound) or z_score > z_threshold
                    
                    if is_outlier and value > mean_val * 1.5:  # Fokus på höga priser
                        risk_score = min(10, max(1, z_score))
                        deviation_pct = ((value - mean_val) / mean_val) * 100
                        
                        anomaly = {
                            'procurement_id': row['id'],
                            'anomaly_type': 'Prisavvikelse',
                            'description': f'Kontraktsvärde {value:,.0f} SEK avviker {deviation_pct:.0f}% från medel för kategorin ({mean_val:,.0f} SEK)',
                            'risk_score': risk_score,
                            'detected_at': datetime.now().isoformat(),
                            'details': {
                                'z_score': z_score,
                                'category_mean': mean_val,
                                'category_std': std_val,
                                'deviation_percent': deviation_pct
                            }
                        }
                        anomalies.append(anomaly)
        
        logger.info(f"Detected {len(anomalies)} price anomalies")
        return anomalies
    
    def detect_market_concentration(self) -> List[Dict]:
        """Upptäck marknadskoncentration (få företag vinner många kontrakt)"""
        anomalies = []
        
        with sqlite3.connect(self.db_path) as conn:
            # Analysera marknadsandelar per myndighet och kategori
            df = pd.read_sql_query('''
                SELECT contracting_authority, winner_name, cpv_codes,
                       COUNT(*) as contract_count,
                       SUM(value) as total_value,
                       AVG(value) as avg_value
                FROM procurements 
                WHERE award_date >= date('now', '-365 days')
                GROUP BY contracting_authority, winner_name, cpv_codes
                HAVING contract_count >= 2
            ''', conn)
            
            if df.empty:
                return anomalies
            
            # Analysera per myndighet
            for authority in df['contracting_authority'].unique():
                authority_data = df[df['contracting_authority'] == authority]
                
                total_contracts = authority_data['contract_count'].sum()
                total_value = authority_data['total_value'].sum()
                
                for _, row in authority_data.iterrows():
                    company = row['winner_name']
                    company_contracts = row['contract_count']
                    company_value = row['total_value']
                    
                    # Beräkna marknadsandel
                    contract_share = (company_contracts / total_contracts) * 100
                    value_share = (company_value / total_value) * 100 if total_value > 0 else 0
                    
                    # Flagga om företaget har över 40% av kontrakten eller värdet
                    if contract_share > 40 or value_share > 40:
                        risk_score = min(10, (contract_share + value_share) / 10)
                        
                        anomaly = {
                            'procurement_id': None,  # Gäller flera kontrakt
                            'anomaly_type': 'Marknadskoncentration',
                            'description': f'{company} vinner {contract_share:.1f}% av kontrakten hos {authority} (värde: {value_share:.1f}%)',
                            'risk_score': risk_score,
                            'detected_at': datetime.now().isoformat(),
                            'details': {
                                'company': company,
                                'authority': authority,
                                'contract_share': contract_share,
                                'value_share': value_share,
                                'total_contracts': company_contracts
                            }
                        }
                        anomalies.append(anomaly)
        
        logger.info(f"Detected {len(anomalies)} market concentration anomalies")
        return anomalies
    
    def detect_time_clustering(self) -> List[Dict]:
        """Upptäck misstänkta tidskluster (många kontrakt samma dag/period)"""
        anomalies = []
        
        with sqlite3.connect(self.db_path) as conn:
            # Hämta kontrakt grupperade per dag
            df = pd.read_sql_query('''
                SELECT award_date, contracting_authority,
                       COUNT(*) as contracts_per_day,
                       SUM(value) as total_value_per_day,
                       GROUP_CONCAT(winner_name) as winners
                FROM procurements 
                WHERE award_date IS NOT NULL
                GROUP BY award_date, contracting_authority
                HAVING contracts_per_day >= 3
                ORDER BY contracts_per_day DESC
            ''', conn)
            
            if df.empty:
                return anomalies
            
            # Analysera statistik för att hitta outliers
            contracts_per_day = df['contracts_per_day']
            mean_contracts = contracts_per_day.mean()
            std_contracts = contracts_per_day.std()
            
            threshold = mean_contracts + 2 * std_contracts  # 2 standardavvikelser
            
            for _, row in df.iterrows():
                contracts_count = row['contracts_per_day']
                
                if contracts_count > threshold and contracts_count >= 5:
                    # Kontrollera om samma företag vinner flera
                    winners = row['winners'].split(',') if row['winners'] else []
                    unique_winners = len(set(winners))
                    winner_concentration = (contracts_count - unique_winners + 1) / contracts_count
                    
                    risk_score = min(10, (contracts_count / mean_contracts) * 2)
                    if winner_concentration > 0.5:  # Samma vinnare för över 50%
                        risk_score += 2
                    
                    anomaly = {
                        'procurement_id': None,
                        'anomaly_type': 'Tidskluster',
                        'description': f'{contracts_count} kontrakt tilldelade samma dag ({row["award_date"]}) av {row["contracting_authority"]}',
                        'risk_score': min(10, risk_score),
                        'detected_at': datetime.now().isoformat(),
                        'details': {
                            'date': row['award_date'],
                            'authority': row['contracting_authority'],
                            'contracts_count': contracts_count,
                            'unique_winners': unique_winners,
                            'winner_concentration': winner_concentration,
                            'total_value': row['total_value_per_day']
                        }
                    }
                    anomalies.append(anomaly)
        
        logger.info(f"Detected {len(anomalies)} time clustering anomalies")
        return anomalies
    
    def detect_geographical_anomalies(self) -> List[Dict]:
        """Upptäck geografiska anomalier (företag vinner utanför hemregion)"""
        anomalies = []
        
        # Denna funktion kan utökas med mer sofistikerad geografisk analys
        # För nu fokuserar vi på uppenbara geografiska avvikelser
        
        with sqlite3.connect(self.db_path) as conn:
            df = pd.read_sql_query('''
                SELECT id, title, contracting_authority, winner_name, 
                       value, municipality, award_date
                FROM procurements 
                WHERE municipality IS NOT NULL
            ''', conn)
            
            if df.empty:
                return anomalies
            
            # Enkla geografiska regler (kan utökas)
            for _, row in df.iterrows():
                municipality = row['municipality'].lower()
                winner = row['winner_name'].lower()
                
                # Kontrollera om företagsnamn antyder annan geografisk hemvist
                geographic_indicators = {
                    'stockholm': ['stockholm', 'södermalm', 'östermalm'],
                    'göteborg': ['göteborg', 'göteborgs', 'west', 'väst'],
                    'malmö': ['malmö', 'skåne', 'south', 'syd'],
                    'uppsala': ['uppsala'],
                    'linköping': ['linköping', 'östergötland']
                }
                
                # Enkel heuristik för geografisk matchning
                # Detta kan göras mycket mer sofistikerat med riktiga adressdatabaser
                
        logger.info(f"Detected {len(anomalies)} geographical anomalies")
        return anomalies
    
    def detect_ml_anomalies(self) -> List[Dict]:
        """Machine Learning-baserad anomalidetektion"""
        anomalies = []
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                df = pd.read_sql_query('''
                    SELECT id, value, contracting_authority, winner_name,
                           julianday(award_date) - julianday('2020-01-01') as days_since_epoch,
                           length(title) as title_length
                    FROM procurements 
                    WHERE value > 0
                ''', conn)
                
                if len(df) < 10:  # Behöver tillräckligt med data
                    return anomalies
                
                # Förbered features för ML
                features = []
                
                # Numeriska features
                feature_columns = ['value', 'days_since_epoch', 'title_length']
                X = df[feature_columns].fillna(0)
                
                # Kategoriska features (frequency encoding)
                authority_counts = df['contracting_authority'].value_counts()
                winner_counts = df['winner_name'].value_counts()
                
                X['authority_frequency'] = df['contracting_authority'].map(authority_counts)
                X['winner_frequency'] = df['winner_name'].map(winner_counts)
                
                # Normalisera data
                X_scaled = self.scaler.fit_transform(X)
                
                # Träna Isolation Forest
                outlier_predictions = self.isolation_forest.fit_predict(X_scaled)
                outlier_scores = self.isolation_forest.decision_function(X_scaled)
                
                # Hitta outliers (prediction = -1)
                outlier_indices = np.where(outlier_predictions == -1)[0]
                
                for idx in outlier_indices:
                    row = df.iloc[idx]
                    score = outlier_scores[idx]
                    
                    # Konvertera score till risk score (0-10)
                    risk_score = min(10, max(1, abs(score) * 10))
                    
                    anomaly = {
                        'procurement_id': row['id'],
                        'anomaly_type': 'ML-Anomali',
                        'description': f'Machine Learning algoritm flaggade detta kontrakt som avvikande baserat på kombination av värde, timing och frekvenser',
                        'risk_score': risk_score,
                        'detected_at': datetime.now().isoformat(),
                        'details': {
                            'ml_score': score,
                            'value': row['value'],
                            'authority': row['contracting_authority'],
                            'winner': row['winner_name']
                        }
                    }
                    anomalies.append(anomaly)
                    
        except Exception as e:
            logger.error(f"Error in ML anomaly detection: {e}")
        
        logger.info(f"Detected {len(anomalies)} ML-based anomalies")
        return anomalies
    
    def detect_network_anomalies(self) -> List[Dict]:
        """Upptäck nätverksanomalier baserat på kopplingar mellan aktörer"""
        anomalies = []
        
        try:
            with sqlite3.connect(self.db_path) as conn:
                # Analysera företag-myndighet nätverk
                df = pd.read_sql_query('''
                    SELECT contracting_authority, winner_name, 
                           COUNT(*) as connection_strength,
                           SUM(value) as total_value,
                           MIN(award_date) as first_contract,
                           MAX(award_date) as last_contract
                    FROM procurements 
                    GROUP BY contracting_authority, winner_name
                    HAVING connection_strength >= 3
                    ORDER BY connection_strength DESC
                ''', conn)
                
                if df.empty:
                    return anomalies
                
                # Analysera "starka kopplingar"
                for _, row in df.iterrows():
                    strength = row['connection_strength']
                    authority = row['contracting_authority']
                    company = row['winner_name']
                    
                    # Flagga mycket starka kopplingar
                    if strength >= 10:  # Många kontrakt mellan samma aktörer
                        # Beräkna tidsperiod
                        first = pd.to_datetime(row['first_contract'])
                        last = pd.to_datetime(row['last_contract'])
                        period_days = (last - first).days
                        
                        # Beräkna risk baserat på frekvens och koncentration
                        if period_days > 0:
                            contracts_per_year = (strength / period_days) * 365
                            risk_score = min(10, contracts_per_year * 2)
                        else:
                            risk_score = 8  # Många kontrakt samma dag = högrisk
                        
                        anomaly = {
                            'procurement_id': None,
                            'anomaly_type': 'Nätverksanomali',
                            'description': f'Stark koppling: {company} har {strength} kontrakt med {authority} under {period_days} dagar',
                            'risk_score': risk_score,
                            'detected_at': datetime.now().isoformat(),
                            'details': {
                                'company': company,
                                'authority': authority,
                                'connection_strength': strength,
                                'total_value': row['total_value'],
                                'period_days': period_days,
                                'first_contract': row['first_contract'],
                                'last_contract': row['last_contract']
                            }
                        }
                        anomalies.append(anomaly)
                        
        except Exception as e:
            logger.error(f"Error in network anomaly detection: {e}")
        
        logger.info(f"Detected {len(anomalies)} network anomalies")
        return anomalies
    
    def store_anomalies(self, anomalies: List[Dict]) -> int:
        """Lagra upptäckta anomalier i databas"""
        stored_count = 0
        
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            for anomaly in anomalies:
                try:
                    cursor.execute('''
                        INSERT OR REPLACE INTO anomalies 
                        (procurement_id, anomaly_type, description, risk_score, detected_at)
                        VALUES (?, ?, ?, ?, ?)
                    ''', (
                        anomaly.get('procurement_id'),
                        anomaly['anomaly_type'],
                        anomaly['description'],
                        anomaly['risk_score'],
                        anomaly['detected_at']
                    ))
                    stored_count += 1
                except Exception as e:
                    logger.error(f"Error storing anomaly: {e}")
                    continue
            
            conn.commit()
        
        logger.info(f"Stored {stored_count} anomalies in database")
        return stored_count
    
    def run_full_analysis(self) -> Dict:
        """Kör fullständig anomalianalys"""
        logger.info("Starting comprehensive anomaly analysis")
        
        start_time = datetime.now()
        
        # Kör all anomalidetektion
        all_anomalies = self.detect_all_anomalies()
        
        # Lagra i databas
        stored_count = self.store_anomalies(all_anomalies)
        
        end_time = datetime.now()
        analysis_time = (end_time - start_time).total_seconds()
        
        # Sammanställ resultat
        anomaly_summary = {}
        for anomaly in all_anomalies:
            anomaly_type = anomaly['anomaly_type']
            if anomaly_type not in anomaly_summary:
                anomaly_summary[anomaly_type] = 0
            anomaly_summary[anomaly_type] += 1
        
        result = {
            'success': True,
            'analysis_time_seconds': analysis_time,
            'total_anomalies': len(all_anomalies),
            'stored_anomalies': stored_count,
            'anomaly_types': anomaly_summary,
            'timestamp': end_time.isoformat()
        }
        
        logger.info(f"Anomaly analysis completed: {len(all_anomalies)} anomalies found in {analysis_time:.2f} seconds")
        return result

# Skapa global instans
advanced_detector = AdvancedAnomalyDetector()
