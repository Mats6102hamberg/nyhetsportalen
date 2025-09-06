// Produktions-API integration för Nyhetsportalen
// Ersätter simulatorer med riktiga API-anrop

class ProductionAPI {
    constructor() {
        // KONFIGURERA DIN BACKEND-URL HÄR
        // ================================
        // Vercel API:er fungerar automatiskt på samma domän
        this.baseURL = window.location.hostname === 'localhost' 
            ? 'http://localhost:3000'  // För lokal utveckling med Vercel dev
            : '';  // Använd samma domän för Vercel API:er
        
        this.cache = new Map();
        this.cacheTimeout = 5 * 60 * 1000; // 5 minuter
        
        console.log(`🚀 Production API initierad - Vercel Backend: ${this.baseURL || 'samma domän'}`);
    }

    async request(endpoint, options = {}) {
        const url = `${this.baseURL}${endpoint}`;
        
        try {
            const response = await fetch(url, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`API request failed for ${endpoint}:`, error);
            throw error;
        }
    }

    getCachedData(key) {
        const cached = this.cache.get(key);
        if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
            return cached.data;
        }
        return null;
    }

    setCachedData(key, data) {
        this.cache.set(key, {
            data,
            timestamp: Date.now()
        });
    }
}

class RealProcurementAPI extends ProductionAPI {
    async getLatestProcurements(limit = 50) {
        const cacheKey = `procurements_${limit}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const data = await this.request(`/api/procurements?limit=${limit}`);
            this.setCachedData(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Failed to fetch procurements:', error);
            return [];
        }
    }

    async getLatestAnomalies(limit = 20) {
        const cacheKey = `anomalies_${limit}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const data = await this.request('/api/anomalies');
            const limitedData = data.slice(0, limit);
            this.setCachedData(cacheKey, limitedData);
            return limitedData;
        } catch (error) {
            console.error('Failed to fetch anomalies:', error);
            return [];
        }
    }

    async updateData(daysBack = 7) {
        try {
            const result = await this.request('/api/update-data', {
                method: 'POST',
                body: JSON.stringify({ days_back: daysBack })
            });
            
            // Rensa cache efter uppdatering
            this.cache.clear();
            
            return {
                success: true,
                message: `${result.contracts_stored} nya kontrakt hämtade`,
                ...result
            };
        } catch (error) {
            console.error('Failed to update data:', error);
            return {
                success: false,
                message: 'Datauppdatering misslyckades'
            };
        }
    }

    async runAnalysis() {
        try {
            // Trigga anomalianalys
            const response = await fetch(`${this.baseURL}/api/run-analysis`, {
                method: 'POST'
            });
            
            if (response.ok) {
                this.cache.clear(); // Rensa cache
                return {
                    success: true,
                    message: 'Anomalianalys slutförd'
                };
            } else {
                throw new Error('Analysis failed');
            }
        } catch (error) {
            console.error('Failed to run analysis:', error);
            return {
                success: false,
                message: 'Analys misslyckades'
            };
        }
    }

    async getDashboardData() {
        try {
            const [procurements, anomalies] = await Promise.all([
                this.getLatestProcurements(20),
                this.getLatestAnomalies(10)
            ]);

            return {
                procurements,
                anomalies,
                stats: {
                    total_procurements: procurements.length,
                    total_anomalies: anomalies.length
                }
            };
        } catch (error) {
            console.error('Failed to get dashboard data:', error);
            return {
                procurements: [],
                anomalies: [],
                stats: {
                    total_procurements: 0,
                    total_anomalies: 0
                }
            };
        }
    }
}

class RealCompanyAPI extends ProductionAPI {
    async searchCompany(query) {
        if (!query.trim()) return [];

        try {
            const data = await this.request(`/api/companies/search?q=${encodeURIComponent(query)}`);
            return data;
        } catch (error) {
            console.error('Company search failed:', error);
            return [];
        }
    }

    async getCompanyDetails(orgNr) {
        const cacheKey = `company_${orgNr}`;
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const data = await this.request(`/api/companies/${orgNr}`);
            this.setCachedData(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Failed to get company details:', error);
            return null;
        }
    }

    async getRiskAnalysis() {
        const cacheKey = 'risk_analysis';
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const data = await this.request('/api/companies/risk-analysis');
            this.setCachedData(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Risk analysis failed:', error);
            return {
                highRiskCompanies: [],
                riskFactors: []
            };
        }
    }

    async getStats() {
        try {
            const data = await this.request('/api/companies/stats');
            return data;
        } catch (error) {
            console.error('Failed to get company stats:', error);
            return {
                totalCompanies: 0,
                highRiskCompanies: 0
            };
        }
    }

    getDashboardStats() {
        return this.getStats();
    }
}

class RealPoliticalAPI extends ProductionAPI {
    async searchPoliticians(query) {
        if (!query.trim()) return [];

        try {
            const data = await this.request(`/api/politicians/search?q=${encodeURIComponent(query)}`);
            return data;
        } catch (error) {
            console.error('Politician search failed:', error);
            return [];
        }
    }

    async searchDecisions(query) {
        if (!query.trim()) return [];

        try {
            const data = await this.request(`/api/decisions/search?q=${encodeURIComponent(query)}`);
            return data;
        } catch (error) {
            console.error('Decision search failed:', error);
            return [];
        }
    }

    async detectConflicts() {
        const cacheKey = 'political_conflicts';
        const cached = this.getCachedData(cacheKey);
        if (cached) return cached;

        try {
            const data = await this.request('/api/politicians/conflicts');
            this.setCachedData(cacheKey, data);
            return data;
        } catch (error) {
            console.error('Conflict detection failed:', error);
            return [];
        }
    }

    async analyzeAttendance() {
        try {
            const data = await this.request('/api/politicians/attendance');
            return data;
        } catch (error) {
            console.error('Attendance analysis failed:', error);
            return [];
        }
    }

    async crossReference() {
        try {
            const data = await this.request('/api/politicians/cross-reference');
            return data;
        } catch (error) {
            console.error('Cross-reference failed:', error);
            return [];
        }
    }

    async getStats() {
        try {
            const data = await this.request('/api/politicians/stats');
            return data;
        } catch (error) {
            console.error('Failed to get political stats:', error);
            return {
                totalPoliticians: 0,
                totalConflicts: 0,
                totalDecisions: 0,
                highRiskPoliticians: 0
            };
        }
    }
}

// Ersätt simulatorer med produktions-API:er
window.procurementAPI = new RealProcurementAPI();
window.companyIntelligenceAPI = new RealCompanyAPI();
window.politicalAPI = new RealPoliticalAPI();

// API-status indikator
class APIStatusIndicator {
    constructor() {
        this.addStatusIndicator();
        this.checkAPIStatus();
        setInterval(() => this.checkAPIStatus(), 30000); // Kolla var 30:e sekund
    }

    addStatusIndicator() {
        const indicator = document.createElement('div');
        indicator.id = 'api-status';
        indicator.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            padding: 8px 12px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 9999;
            transition: all 0.3s ease;
        `;
        document.body.appendChild(indicator);
    }

    async checkAPIStatus() {
        const indicator = document.getElementById('api-status');
        if (!indicator) return;

        try {
            const api = new ProductionAPI();
            await api.request('/');
            
            indicator.textContent = '🟢 API Online';
            indicator.style.backgroundColor = '#10b981';
            indicator.style.color = 'white';
        } catch (error) {
            indicator.textContent = '🔴 API Offline';
            indicator.style.backgroundColor = '#ef4444';
            indicator.style.color = 'white';
        }
    }
}

// Starta API-status indikator när sidan laddas
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        new APIStatusIndicator();
    });
} else {
    new APIStatusIndicator();
}

console.log('🚀 Produktions-API laddad - Riktiga datakällor aktiva');
