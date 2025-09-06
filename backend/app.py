#!/usr/bin/env python3
"""
Nyhetsportalen Backend - Produktionsversion
Riktiga datakällor för svensk offentlig sektor övervakning
"""

from flask import Flask, jsonify, request, render_template
from flask_cors import CORS
import requests
import sqlite3
import os
from datetime import datetime, timedelta
import logging
from dataclasses import dataclass
from typing import List, Dict, Optional
import json

# Konfiguration
app = Flask(__name__)
CORS(app)

# Logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Databas
DATABASE = 'nyhetsportalen.db'

@dataclass
class ProcurementContract:
    """Upphandlingskontrakt från riktiga källor"""
    ted_id: str
    title: str
    contracting_authority: str
    winner_name: str
    winner_org_nr: str
    value: float
    currency: str
    award_date: str
    cpv_codes: List[str]
    source: str

class RealDataCollector:
    """Samlar riktig data från svenska offentliga källor"""
    
    def __init__(self):
        self.ted_base_url = "https://ted.europa.eu/api/v3.0"
        self.bolagsverket_url = "https://data.bolagsverket.se/api"
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Nyhetsportalen/1.0 (transparens@nyhetsportalen.se)'
        })
    
    def get_swedish_procurements(self, days_back: int = 30) -> List[Dict]:
        """Hämta svenska upphandlingar från TED (Tenders Electronic Daily)"""
        try:
            # TED API för svenska upphandlingar
            end_date = datetime.now()
            start_date = end_date - timedelta(days=days_back)
            
            params = {
                'country': 'SE',  # Sverige
                'publication-date-from': start_date.strftime('%Y-%m-%d'),
                'publication-date-to': end_date.strftime('%Y-%m-%d'),
                'document-type': 'contract-award',  # Tilldelade kontrakt
                'scope': 3,  # EU-omfattning
                'page-size': 100
            }
            
            response = self.session.get(f"{self.ted_base_url}/notices", params=params)
            
            if response.status_code == 200:
                data = response.json()
                return self.parse_ted_contracts(data.get('results', []))
            else:
                logger.error(f"TED API error: {response.status_code}")
                return []
                
        except Exception as e:
            logger.error(f"Error fetching TED data: {e}")
            return []
    
    def parse_ted_contracts(self, ted_data: List[Dict]) -> List[Dict]:
        """Parse TED contract data"""
        contracts = []
        
        for notice in ted_data:
            try:
                # Extrahera grundläggande information
                contract = {
                    'ted_id': notice.get('notice_id'),
                    'title': notice.get('title', {}).get('sv', notice.get('title', {}).get('en', 'Okänd titel')),
                    'contracting_authority': self.extract_authority(notice),
                    'winner_name': self.extract_winner(notice),
                    'value': self.extract_value(notice),
                    'currency': notice.get('award_criteria', {}).get('currency', 'SEK'),
                    'award_date': notice.get('dispatch_date'),
                    'cpv_codes': self.extract_cpv_codes(notice),
                    'source': 'TED',
                    'municipality': self.extract_municipality(notice)
                }
                
                contracts.append(contract)
                
            except Exception as e:
                logger.error(f"Error parsing TED notice {notice.get('notice_id')}: {e}")
                continue
        
        return contracts
    
    def extract_authority(self, notice: Dict) -> str:
        """Extrahera upphandlande myndighet"""
        try:
            buyers = notice.get('buyer', [])
            if buyers and len(buyers) > 0:
                return buyers[0].get('buyer_name', 'Okänd myndighet')
            return 'Okänd myndighet'
        except:
            return 'Okänd myndighet'
    
    def extract_winner(self, notice: Dict) -> str:
        """Extrahera vinnande företag"""
        try:
            awards = notice.get('award', [])
            if awards and len(awards) > 0:
                contractors = awards[0].get('contractors', [])
                if contractors and len(contractors) > 0:
                    return contractors[0].get('name', 'Okänt företag')
            return 'Okänt företag'
        except:
            return 'Okänt företag'
    
    def extract_value(self, notice: Dict) -> float:
        """Extrahera kontraktsvärde"""
        try:
            awards = notice.get('award', [])
            if awards and len(awards) > 0:
                value_info = awards[0].get('value', {})
                return float(value_info.get('amount', 0))
            return 0.0
        except:
            return 0.0
    
    def extract_cpv_codes(self, notice: Dict) -> List[str]:
        """Extrahera CPV-koder (klassificering)"""
        try:
            cpv_codes = []
            objects = notice.get('object', [])
            for obj in objects:
                cpv_main = obj.get('cpv_code_main')
                if cpv_main:
                    cpv_codes.append(cpv_main)
            return cpv_codes
        except:
            return []
    
    def extract_municipality(self, notice: Dict) -> str:
        """Extrahera kommun från adress"""
        try:
            buyers = notice.get('buyer', [])
            if buyers and len(buyers) > 0:
                address = buyers[0].get('address', {})
                city = address.get('city', '')
                
                # Mappa till svenska kommuner
                municipality_mapping = {
                    'Stockholm': 'Stockholm',
                    'Göteborg': 'Göteborg', 
                    'Gothenburg': 'Göteborg',
                    'Malmö': 'Malmö',
                    'Uppsala': 'Uppsala',
                    'Linköping': 'Linköping',
                    'Västerås': 'Västerås',
                    'Örebro': 'Örebro',
                    'Helsingborg': 'Helsingborg',
                    'Jönköping': 'Jönköping',
                    'Norrköping': 'Norrköping'
                }
                
                return municipality_mapping.get(city, city)
            return 'Okänd kommun'
        except:
            return 'Okänd kommun'

class CompanyDataCollector:
    """Samlar företagsdata från Bolagsverket"""
    
    def __init__(self):
        self.base_url = "https://data.bolagsverket.se/api/v1"
        self.session = requests.Session()
    
    def get_company_info(self, org_nr: str) -> Dict:
        """Hämta företagsinformation från Bolagsverket"""
        try:
            # Normalisera organisationsnummer
            clean_org_nr = org_nr.replace('-', '').replace(' ', '')
            
            response = self.session.get(f"{self.base_url}/company/{clean_org_nr}")
            
            if response.status_code == 200:
                return response.json()
            else:
                logger.warning(f"Company not found: {org_nr}")
                return {}
                
        except Exception as e:
            logger.error(f"Error fetching company data: {e}")
            return {}
    
    def get_board_members(self, org_nr: str) -> List[Dict]:
        """Hämta styrelseledamöter"""
        try:
            clean_org_nr = org_nr.replace('-', '').replace(' ', '')
            response = self.session.get(f"{self.base_url}/company/{clean_org_nr}/board")
            
            if response.status_code == 200:
                return response.json().get('board_members', [])
            return []
            
        except Exception as e:
            logger.error(f"Error fetching board members: {e}")
            return []

class DatabaseManager:
    """Hanterar SQLite-databas för produktionsdata"""
    
    def __init__(self, db_path: str = DATABASE):
        self.db_path = db_path
        self.init_database()
    
    def init_database(self):
        """Skapa databasschema"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            # Upphandlingar
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS procurements (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    ted_id TEXT UNIQUE,
                    title TEXT NOT NULL,
                    contracting_authority TEXT,
                    winner_name TEXT,
                    winner_org_nr TEXT,
                    value REAL,
                    currency TEXT DEFAULT 'SEK',
                    award_date TEXT,
                    municipality TEXT,
                    cpv_codes TEXT,
                    source TEXT DEFAULT 'TED',
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Företag
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS companies (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    org_nr TEXT UNIQUE NOT NULL,
                    name TEXT NOT NULL,
                    business_area TEXT,
                    address TEXT,
                    revenue REAL,
                    employees INTEGER,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            ''')
            
            # Styrelseledamöter  
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS board_members (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    company_org_nr TEXT,
                    name TEXT NOT NULL,
                    role TEXT,
                    appointment_date TEXT,
                    personal_nr TEXT,
                    FOREIGN KEY (company_org_nr) REFERENCES companies (org_nr)
                )
            ''')
            
            # Anomalier
            cursor.execute('''
                CREATE TABLE IF NOT EXISTS anomalies (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    procurement_id INTEGER,
                    anomaly_type TEXT NOT NULL,
                    description TEXT,
                    risk_score REAL,
                    detected_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (procurement_id) REFERENCES procurements (id)
                )
            ''')
            
            conn.commit()
    
    def store_procurement(self, contract: Dict) -> int:
        """Lagra upphandling i databas"""
        with sqlite3.connect(self.db_path) as conn:
            cursor = conn.cursor()
            
            cursor.execute('''
                INSERT OR REPLACE INTO procurements 
                (ted_id, title, contracting_authority, winner_name, winner_org_nr, 
                 value, currency, award_date, municipality, cpv_codes, source)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ''', (
                contract.get('ted_id'),
                contract.get('title'),
                contract.get('contracting_authority'),
                contract.get('winner_name'),
                contract.get('winner_org_nr'),
                contract.get('value'),
                contract.get('currency', 'SEK'),
                contract.get('award_date'),
                contract.get('municipality'),
                ','.join(contract.get('cpv_codes', [])),
                contract.get('source', 'TED')
            ))
            
            return cursor.lastrowid

# Globala instanser
data_collector = RealDataCollector()
company_collector = CompanyDataCollector()
db_manager = DatabaseManager()

# API Routes
@app.route('/')
def index():
    """Huvudsida"""
    return jsonify({
        'status': 'active',
        'version': '1.0.0',
        'description': 'Nyhetsportalen Backend - Produktionsversion',
        'endpoints': [
            '/api/procurements',
            '/api/companies/<org_nr>',
            '/api/update-data',
            '/api/anomalies'
        ]
    })

@app.route('/api/procurements')
def get_procurements():
    """Hämta upphandlingar"""
    limit = request.args.get('limit', 50, type=int)
    municipality = request.args.get('municipality')
    
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        
        if municipality:
            cursor.execute('''
                SELECT * FROM procurements 
                WHERE municipality = ? 
                ORDER BY award_date DESC 
                LIMIT ?
            ''', (municipality, limit))
        else:
            cursor.execute('''
                SELECT * FROM procurements 
                ORDER BY award_date DESC 
                LIMIT ?
            ''', (limit,))
        
        columns = [description[0] for description in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        return jsonify(results)

@app.route('/api/companies/<org_nr>')
def get_company(org_nr):
    """Hämta företagsinformation"""
    try:
        # Först kolla i vår databas
        with sqlite3.connect(DATABASE) as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT * FROM companies WHERE org_nr = ?
            ''', (org_nr,))
            
            result = cursor.fetchone()
            
            if result:
                columns = [description[0] for description in cursor.description]
                company_data = dict(zip(columns, result))
                
                # Hämta styrelseledamöter
                cursor.execute('''
                    SELECT * FROM board_members WHERE company_org_nr = ?
                ''', (org_nr,))
                
                board_columns = [description[0] for description in cursor.description]
                board_members = [dict(zip(board_columns, row)) for row in cursor.fetchall()]
                
                company_data['board_members'] = board_members
                return jsonify(company_data)
        
        # Om inte i databas, hämta från Bolagsverket
        company_info = company_collector.get_company_info(org_nr)
        if company_info:
            return jsonify(company_info)
        else:
            return jsonify({'error': 'Company not found'}), 404
            
    except Exception as e:
        logger.error(f"Error fetching company {org_nr}: {e}")
        return jsonify({'error': 'Internal server error'}), 500

@app.route('/api/update-data', methods=['POST'])
def update_data():
    """Uppdatera data från externa källor"""
    try:
        days_back = request.json.get('days_back', 30) if request.json else 30
        
        logger.info(f"Starting data update, fetching {days_back} days back")
        
        # Hämta nya upphandlingar
        contracts = data_collector.get_swedish_procurements(days_back)
        
        stored_count = 0
        for contract in contracts:
            try:
                db_manager.store_procurement(contract)
                stored_count += 1
            except Exception as e:
                logger.error(f"Error storing contract: {e}")
                continue
        
        logger.info(f"Stored {stored_count} new contracts")
        
        return jsonify({
            'status': 'success',
            'contracts_found': len(contracts),
            'contracts_stored': stored_count,
            'timestamp': datetime.now().isoformat()
        })
        
    except Exception as e:
        logger.error(f"Error updating data: {e}")
        return jsonify({'error': 'Update failed'}), 500

@app.route('/api/anomalies')
def get_anomalies():
    """Hämta upptäckta anomalier"""
    with sqlite3.connect(DATABASE) as conn:
        cursor = conn.cursor()
        cursor.execute('''
            SELECT a.*, p.title, p.contracting_authority, p.winner_name, p.value
            FROM anomalies a
            JOIN procurements p ON a.procurement_id = p.id
            ORDER BY a.detected_at DESC
            LIMIT 100
        ''')
        
        columns = [description[0] for description in cursor.description]
        results = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        return jsonify(results)

if __name__ == '__main__':
    # Utvecklingsmiljö
    app.run(debug=True, host='0.0.0.0', port=5000)
