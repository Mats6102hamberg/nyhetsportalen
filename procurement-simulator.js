// Simulerad upphandlingsdata för demo
class ProcurementSimulator {
    constructor() {
        this.municipalities = ["Stockholm", "Göteborg", "Malmö", "Uppsala", "Linköping"];
        this.companies = [
            "TechSolution AB", "BuildCorp Sweden", "ConsultPro Nordic",
            "DataSystem Solutions", "Infrastructure Sweden AB",
            "SmartCity Technologies", "Public Services Nordic",
            "DigitalFirst Sweden", "Construction Elite AB",
            "IT-Konsult Stockholm"
        ];
        this.categories = [
            "IT-tjänster", "Byggentreprenad", "Konsulttjänster",
            "Systemutveckling", "Infrastruktur", "Underhåll"
        ];
        
        this.procurements = [];
        this.anomalies = [];
        
        this.generateSampleData();
    }

    generateSampleData() {
        // Generera 50 upphandlingar
        for (let i = 0; i < 50; i++) {
            const procurement = {
                id: `proc_${i}_${Date.now()}`,
                title: this.generateTitle(),
                municipality: this.getRandomElement(this.municipalities),
                value: this.generateValue(),
                date: this.generateDate(),
                winner_company: this.getRandomElement(this.companies),
                winner_org_nr: this.generateOrgNr(),
                category: this.getRandomElement(this.categories),
                source: Math.random() > 0.5 ? "TED" : "Visma"
            };
            this.procurements.push(procurement);
        }

        // Generera anomalier baserat på data
        this.generateAnomalies();
    }

    generateTitle() {
        const prefixes = [
            "Upphandling av", "Ramavtal för", "Inköp av",
            "Leverans av", "Utveckling av", "Underhåll av"
        ];
        const subjects = [
            "IT-system", "mjukvarulösningar", "konsulttjänster",
            "byggnadsarbeten", "infrastruktur", "digitala tjänster",
            "underhållstjänster", "teknisk support", "systemintegration"
        ];
        
        return `${this.getRandomElement(prefixes)} ${this.getRandomElement(subjects)}`;
    }

    generateValue() {
        // Generera värden mellan 50,000 och 10,000,000 kr
        return Math.floor(Math.random() * 9950000) + 50000;
    }

    generateDate() {
        const daysAgo = Math.floor(Math.random() * 365);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString();
    }

    generateOrgNr() {
        return `55${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
    }

    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    generateAnomalies() {
        // Hitta företag som vinner ofta
        const companyWins = {};
        this.procurements.forEach(proc => {
            companyWins[proc.winner_company] = (companyWins[proc.winner_company] || 0) + 1;
        });

        // Hitta anomalier - företag med många vinster
        Object.entries(companyWins).forEach(([company, wins]) => {
            if (wins >= 4) { // 4 eller fler vinster är misstänkt
                this.anomalies.push({
                    id: `anom_freq_${Date.now()}_${company}`,
                    company_name: company,
                    company_org_nr: this.generateOrgNr(),
                    municipality: this.getRandomElement(this.municipalities),
                    anomaly_type: "Hög vinstfrekvens",
                    score: Math.min(10, wins * 1.5),
                    details: `Företaget har vunnit ${wins} upphandlingar (ovanligt högt)`,
                    evidence: [`Antal vinster: ${wins}`, "Överstiger normalförväntan"],
                    detected_at: new Date().toISOString()
                });
            }
        });

        // Hitta värdeanomalier - ovanligt höga värden
        const avgValue = this.procurements.reduce((sum, p) => sum + p.value, 0) / this.procurements.length;
        
        this.procurements.forEach(proc => {
            if (proc.value > avgValue * 3) { // 3x högre än medel
                this.anomalies.push({
                    id: `anom_value_${Date.now()}_${proc.id}`,
                    company_name: proc.winner_company,
                    company_org_nr: proc.winner_org_nr,
                    municipality: proc.municipality,
                    anomaly_type: "Ovanligt högt värde",
                    score: Math.min(8, proc.value / avgValue),
                    details: `Upphandling värderad till ${this.formatValue(proc.value)} kr (medel: ${this.formatValue(avgValue)} kr)`,
                    evidence: [`Värde: ${this.formatValue(proc.value)} kr`, `${Math.round(proc.value / avgValue)}x över medel`],
                    detected_at: new Date().toISOString()
                });
            }
        });

        // Sortera anomalier efter score
        this.anomalies.sort((a, b) => b.score - a.score);
    }

    formatValue(value) {
        return new Intl.NumberFormat('sv-SE').format(Math.round(value));
    }

    // API-liknande metoder
    getProcurements(limit = 50) {
        return this.procurements.slice(0, limit);
    }

    getAnomalies(days = 30) {
        // Filtrera anomalier baserat på datum
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        
        return this.anomalies.filter(anomaly => 
            new Date(anomaly.detected_at) > cutoffDate
        );
    }

    getDashboardData() {
        const procurements = this.getProcurements();
        const anomalies = this.getAnomalies();
        
        return {
            procurements: procurements,
            anomalies: anomalies,
            municipalities: this.municipalities,
            stats: {
                total_procurements: procurements.length,
                total_anomalies: anomalies.length,
                municipalities_monitored: this.municipalities.length,
                high_risk_companies: anomalies.filter(a => a.score > 7).length
            }
        };
    }

    // Simulera datauppdatering
    updateData() {
        // Lägg till några nya upphandlingar
        for (let i = 0; i < 5; i++) {
            const procurement = {
                id: `proc_new_${i}_${Date.now()}`,
                title: this.generateTitle(),
                municipality: this.getRandomElement(this.municipalities),
                value: this.generateValue(),
                date: new Date().toISOString(),
                winner_company: this.getRandomElement(this.companies),
                winner_org_nr: this.generateOrgNr(),
                category: this.getRandomElement(this.categories),
                source: "Real-time"
            };
            this.procurements.unshift(procurement); // Lägg till i början
        }

        // Begränsa till senaste 100
        this.procurements = this.procurements.slice(0, 100);
        
        // Uppdatera anomalier
        this.anomalies = [];
        this.generateAnomalies();
    }

    // Simulera analys
    runAnalysis() {
        // Lägg till några nya anomalier baserat på ny data
        const newAnomaly = {
            id: `anom_analysis_${Date.now()}`,
            company_name: this.getRandomElement(this.companies),
            company_org_nr: this.generateOrgNr(),
            municipality: this.getRandomElement(this.municipalities),
            anomaly_type: "Misstänkt mönster",
            score: Math.random() * 5 + 5, // Score mellan 5-10
            details: "Upptäckt genom avancerad analys av bidragsmönster",
            evidence: ["Ovanligt beteende", "Kräver vidare granskning"],
            detected_at: new Date().toISOString()
        };
        
        this.anomalies.unshift(newAnomaly);
        this.anomalies = this.anomalies.slice(0, 20); // Behåll bara de senaste 20
    }
}

// Global instans
window.procurementSimulator = new ProcurementSimulator();

// Simulerade API-funktioner för admin-panelen
window.procurementAPI = {
    async updateData() {
        return new Promise((resolve) => {
            setTimeout(() => {
                window.procurementSimulator.updateData();
                resolve({ success: true, message: 'Datauppdatering klar' });
            }, 2000);
        });
    },

    async runAnalysis() {
        return new Promise((resolve) => {
            setTimeout(() => {
                window.procurementSimulator.runAnalysis();
                resolve({ success: true, message: 'Analys klar' });
            }, 3000);
        });
    },

    async runFullCycle() {
        return new Promise((resolve) => {
            setTimeout(() => {
                window.procurementSimulator.updateData();
                window.procurementSimulator.runAnalysis();
                resolve({ success: true, message: 'Fullständig cykel klar' });
            }, 5000);
        });
    },

    getDashboardData() {
        return window.procurementSimulator.getDashboardData();
    }
};
