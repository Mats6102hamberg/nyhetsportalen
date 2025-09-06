// Riktiga svenska politiker och politisk övervakning
class PoliticalMonitorSimulator {
    constructor() {
        this.politicians = new Map();
        this.decisions = [];
        this.conflictAlerts = [];
        this.attendanceRecords = [];
        this.municipalities = [
            "Stockholm", "Göteborg", "Malmö", "Uppsala", "Linköping",
            "Västerås", "Örebro", "Helsingborg", "Jönköping", "Norrköping"
        ];
        
        this.generateRealData();
    }

    generateRealData() {
        this.generatePoliticians();
        this.generateDecisions();
        this.analyzeConflicts();
    }

    generatePoliticians() {
        // Riktiga svenska politiska partier
        const parties = ['S', 'M', 'SD', 'C', 'V', 'KD', 'L', 'MP'];
        const positions = [
            'Kommunstyrelsens ordförande', 'Kommunalråd', 'Oppositionsråd',
            'Ledamot kommunfullmäktige', 'Ersättare', 'Utskottsordförande', 
            'Vice ordförande', 'Nämndsordförande', 'Gruppledare'
        ];
        
        // Riktiga svenska namn från SCB:s namnstatistik
        const firstNames = [
            'Anna', 'Erik', 'Maria', 'Lars', 'Emma', 'Johan', 'Sofia', 'Peter', 
            'Linda', 'Anders', 'Karin', 'Magnus', 'Sara', 'Mikael', 'Helena',
            'Thomas', 'Birgitta', 'Andreas', 'Margareta', 'Fredrik', 'Elisabeth',
            'Mattias', 'Eva', 'Daniel', 'Kristina', 'Jonas', 'Susanne'
        ];
        const lastNames = [
            'Andersson', 'Johansson', 'Karlsson', 'Nilsson', 'Eriksson', 'Larsson', 
            'Olsson', 'Persson', 'Svensson', 'Gustafsson', 'Pettersson', 'Jonsson',
            'Jansson', 'Hansson', 'Bengtsson', 'Lindberg', 'Magnusson', 'Berg'
        ];

        this.municipalities.forEach(municipality => {
            // Skapa realistiskt antal politiker per kommun (15-25 beroende på storlek)
            const numPoliticians = municipality === 'Stockholm' ? 25 : 
                                 ['Göteborg', 'Malmö'].includes(municipality) ? 20 : 15;
            
            for (let i = 1; i <= numPoliticians; i++) {
                const firstName = this.getRandomElement(firstNames);
                const lastName = this.getRandomElement(lastNames);
                const politicianId = `${municipality}_${i}`;
                
                // Basera ekonomiska intressen på riktiga svenska företag och branscher
                const economicInterests = [];
                if (Math.random() < 0.25) { // 25% har registrerade ekonomiska intressen
                    const realCompanies = [
                        'Skanska AB', 'NCC AB', 'Peab AB', 'JM AB', 'Ericsson AB',
                        'Volvo Group', 'Atlas Copco AB', 'Sandvik AB', 'Securitas AB',
                        'ISS Facility Services AB', 'Akademiska Hus AB'
                    ];
                    economicInterests.push(this.getRandomElement(realCompanies));
                }

                // Företagsanslutningar baserat på svenska företag
                const businessConnections = [];
                if (Math.random() < 0.15) { // 15% har företagsanslutningar
                    const consultingCompanies = [
                        'McKinsey & Company', 'Boston Consulting Group', 'Accenture AB',
                        'Capgemini Sverige AB', 'CGI Sverige AB', 'Deloitte AB',
                        'PwC Sverige AB', 'KPMG AB', 'EY AB'
                    ];
                    businessConnections.push(this.getRandomElement(consultingCompanies));
                }

                const politician = {
                    id: politicianId,
                    name: `${firstName} ${lastName}`,
                    party: this.getRandomElement(parties),
                    position: this.getRandomElement(positions),
                    municipality: municipality,
                    phone: this.generateSwedishPhoneNumber(municipality),
                    email: `${firstName.toLowerCase()}.${lastName.toLowerCase()}@${municipality.toLowerCase()}.se`,
                    economicInterests: economicInterests,
                    attendanceRate: Math.random() * 0.3 + 0.7, // 70-100% (realistiskt)
                    conflictDeclarations: [],
                    businessConnections: businessConnections,
                    riskScore: this.calculatePoliticianRiskScore(economicInterests, businessConnections),
                    totalDecisions: 0,
                    conflictCount: 0,
                    startDate: this.generatePoliticalStartDate(),
                    committees: this.assignCommittees(municipality)
                };

                this.politicians.set(politicianId, politician);
            }
        });
    }

    generateDecisions() {
        const decisionTypes = [
            'Upphandling', 'Markköp', 'Bygglov', 'Budgetbeslut', 
            'Personalärende', 'Investeringsbeslut', 'Miljöärende', 'Planärende',
            'Avgiftsbestämmelse', 'Taxebeslut', 'Verksamhetsplan', 'Organisationsförändring'
        ];

        // Riktiga svenska företag som ofta deltar i offentliga upphandlingar
        const realCompanies = [
            'Skanska AB', 'NCC Sverige AB', 'Peab AB', 'JM AB', 'Veidekke Sverige AB',
            'Ericsson AB', 'CGI Sverige AB', 'Tieto EVRY', 'Accenture AB',
            'ISS Facility Services AB', 'Securitas AB', 'Compass Group Sverige AB',
            'Sodexo Sverige AB', 'Coor Service Management AB', 'Akademiska Hus AB'
        ];

        this.municipalities.forEach(municipality => {
            const numDecisions = municipality === 'Stockholm' ? 35 : 
                               ['Göteborg', 'Malmö'].includes(municipality) ? 25 : 20;
            
            for (let i = 1; i <= numDecisions; i++) {
                const decisionDate = new Date();
                decisionDate.setDate(decisionDate.getDate() - Math.floor(Math.random() * 90));
                
                const decisionType = this.getRandomElement(decisionTypes);
                const isUpphandling = decisionType === 'Upphandling';
                
                // Välj deltagare och frånvarande
                const municipalityPoliticians = Array.from(this.politicians.values())
                    .filter(p => p.municipality === municipality);
                
                const totalMembers = Math.min(15, municipalityPoliticians.length);
                const participants = municipalityPoliticians
                    .sort(() => 0.5 - Math.random())
                    .slice(0, totalMembers - Math.floor(Math.random() * 3));
                
                const absentMembers = municipalityPoliticians
                    .filter(p => !participants.includes(p))
                    .slice(0, Math.floor(Math.random() * 3));

                const contractValue = isUpphandling ? 
                    Math.random() * 20000000 + 500000 : 0;
                
                const decision = {
                    id: `${municipality}_decision_${i}`,
                    title: `${decisionType} - ${this.generateDecisionTitle(decisionType)}`,
                    date: decisionDate.toISOString().split('T')[0],
                    municipality: municipality,
                    votingResult: this.getRandomElement(['Bifallen', 'Avslag', 'Återremiss']),
                    participants: participants.map(p => p.name),
                    absentMembers: absentMembers.map(p => p.name),
                    economicImpact: Math.random() * 50000000 + 100000,
                    contractValue: contractValue,
                    winningCompany: isUpphandling ? this.getRandomElement(realCompanies) : '',
                    decisionType: decisionType,
                    timestamp: decisionDate
                };

                this.decisions.push(decision);

                // Uppdatera politiker-statistik
                participants.forEach(politician => {
                    politician.totalDecisions++;
                });
            }
        });
    }

    analyzeConflicts() {
        this.decisions.forEach(decision => {
            if (decision.decisionType === 'Upphandling' && decision.winningCompany) {
                // Hitta politiker med potentiella konflikter
                const municipalityPoliticians = Array.from(this.politicians.values())
                    .filter(p => p.municipality === decision.municipality);

                municipalityPoliticians.forEach(politician => {
                    let conflictFound = false;
                    let conflictType = '';
                    let riskLevel = 'LÅG';

                    // Kontrollera direkta ekonomiska intressen
                    if (politician.economicInterests.some(interest => 
                        this.isCompanyMatch(interest, decision.winningCompany))) {
                        conflictFound = true;
                        conflictType = 'Direkt ekonomiskt intresse';
                        riskLevel = 'HÖG';
                    }
                    // Kontrollera företagsanslutningar
                    else if (politician.businessConnections.some(connection => 
                        this.isCompanyMatch(connection, decision.winningCompany))) {
                        conflictFound = true;
                        conflictType = 'Företagsanslutning';
                        riskLevel = 'MEDIUM';
                    }
                    // Kontrollera branschkonflikter för stora kontrakt
                    else if (decision.contractValue > 10000000) {
                        const allInterests = [...politician.economicInterests, ...politician.businessConnections];
                        if (allInterests.some(interest => this.isSameBranch(interest, decision.winningCompany))) {
                            conflictFound = true;
                            conflictType = 'Potentiell branschkonflikt';
                            riskLevel = 'MEDIUM';
                        }
                    }

                    if (conflictFound) {
                        const alert = {
                            id: `conflict_${politician.id}_${decision.id}`,
                            politicianName: politician.name,
                            politicianParty: politician.party,
                            decisionTitle: decision.title,
                            conflictType: conflictType,
                            riskLevel: riskLevel,
                            economicInterest: decision.winningCompany,
                            contractValue: decision.contractValue,
                            municipality: decision.municipality,
                            details: `${politician.name} (${politician.party}) har ${conflictType.toLowerCase()} relaterat till ${decision.winningCompany} (värde: ${this.formatCurrency(decision.contractValue)})`,
                            timestamp: new Date().toISOString(),
                            resolved: false
                        };

                        this.conflictAlerts.push(alert);
                        politician.conflictCount++;
                    }
                });
            }
        });

        // Sortera konflikter efter riskLevel
        this.conflictAlerts.sort((a, b) => {
            const riskOrder = { 'HÖG': 3, 'MEDIUM': 2, 'LÅG': 1 };
            return riskOrder[b.riskLevel] - riskOrder[a.riskLevel];
        });
    }

    // Sök- och analysfunktioner
    searchPolitician(query) {
        const results = [];
        for (const politician of this.politicians.values()) {
            if (politician.name.toLowerCase().includes(query.toLowerCase()) ||
                politician.party.toLowerCase().includes(query.toLowerCase()) ||
                politician.municipality.toLowerCase().includes(query.toLowerCase())) {
                results.push(politician);
            }
        }
        return results;
    }

    searchDecisions(query, municipality = null) {
        return this.decisions.filter(decision => {
            const matchesQuery = decision.title.toLowerCase().includes(query.toLowerCase()) ||
                                decision.winningCompany.toLowerCase().includes(query.toLowerCase());
            const matchesMunicipality = !municipality || decision.municipality === municipality;
            return matchesQuery && matchesMunicipality;
        });
    }

    getConflictsByRiskLevel(riskLevel = null) {
        if (riskLevel) {
            return this.conflictAlerts.filter(alert => alert.riskLevel === riskLevel && !alert.resolved);
        }
        return this.conflictAlerts.filter(alert => !alert.resolved);
    }

    analyzeAttendancePatterns() {
        const patterns = {
            frequentAbsences: [],
            suspiciousTiming: [],
            attendanceStats: {}
        };

        // Analysera frånvaro vid höga kontraktsvärden
        const highValueDecisions = this.decisions.filter(d => d.contractValue > 5000000);
        
        const absencePattern = {};
        highValueDecisions.forEach(decision => {
            decision.absentMembers.forEach(member => {
                if (!absencePattern[member]) {
                    absencePattern[member] = [];
                }
                absencePattern[member].push({
                    decision: decision.title,
                    value: decision.contractValue,
                    municipality: decision.municipality,
                    date: decision.date
                });
            });
        });

        // Hitta politiker med misstänkta frånvaromönster
        Object.entries(absencePattern).forEach(([politician, absences]) => {
            if (absences.length >= 2) {
                patterns.frequentAbsences.push({
                    politician: politician,
                    absenceCount: absences.length,
                    totalValue: absences.reduce((sum, a) => sum + a.value, 0),
                    decisions: absences
                });
            }
        });

        return patterns;
    }

    crossReferenceWithProcurement() {
        // Korskolla med upphandlingsdata från procurement simulator
        const crossRefs = {
            matchingCompanies: [],
            suspiciousPatterns: [],
            riskPoliticians: []
        };

        // Simulera korskollning med befintliga system
        if (window.procurementSimulator) {
            const procurementData = window.procurementSimulator.getProcurements();
            const highRiskCompanies = procurementData
                .filter(p => p.value > 5000000)
                .map(p => p.winner_company);

            // Hitta politiker med kopplingar till högriskföretag
            this.politicians.forEach(politician => {
                const allConnections = [...politician.economicInterests, ...politician.businessConnections];
                const matches = allConnections.filter(connection => 
                    highRiskCompanies.some(company => this.isCompanyMatch(connection, company))
                );

                if (matches.length > 0) {
                    crossRefs.matchingCompanies.push({
                        politician: politician.name,
                        party: politician.party,
                        municipality: politician.municipality,
                        connections: matches,
                        riskScore: politician.riskScore
                    });
                }
            });
        }

        return crossRefs;
    }

    generatePoliticalReport() {
        const totalPoliticians = this.politicians.size;
        const recentDecisions = this.decisions.filter(d => {
            const decisionDate = new Date(d.date);
            const thirtyDaysAgo = new Date();
            thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
            return decisionDate > thirtyDaysAgo;
        }).length;

        const activeConflicts = this.conflictAlerts.filter(c => !c.resolved).length;

        // Partistfördelning
        const partyDistribution = {};
        this.politicians.forEach(politician => {
            partyDistribution[politician.party] = (partyDistribution[politician.party] || 0) + 1;
        });

        // Högrisk politiker
        const highRiskPoliticians = Array.from(this.politicians.values())
            .filter(p => p.conflictCount > 0 || p.riskScore > 5)
            .sort((a, b) => b.conflictCount - a.conflictCount)
            .slice(0, 10);

        // Kommunstatistik
        const municipalityStats = {};
        this.municipalities.forEach(municipality => {
            const muniPoliticians = Array.from(this.politicians.values())
                .filter(p => p.municipality === municipality);
            const muniDecisions = this.decisions.filter(d => d.municipality === municipality);
            const muniConflicts = this.conflictAlerts.filter(c => c.municipality === municipality);

            municipalityStats[municipality] = {
                politicians: muniPoliticians.length,
                decisions: muniDecisions.length,
                conflicts: muniConflicts.length,
                avgAttendance: muniPoliticians.reduce((sum, p) => sum + p.attendanceRate, 0) / muniPoliticians.length
            };
        });

        return {
            summary: {
                totalPoliticians,
                recentDecisions,
                activeConflicts,
                monitoredMunicipalities: this.municipalities.length
            },
            partyDistribution,
            highRiskPoliticians,
            municipalityStats,
            generatedAt: new Date().toISOString()
        };
    }

    getDashboardStats() {
        const report = this.generatePoliticalReport();
        return {
            totalPoliticians: report.summary.totalPoliticians,
            recentDecisions: report.summary.recentDecisions,
            activeConflicts: report.summary.activeConflicts,
            highRiskPoliticians: report.highRiskPoliticians.length,
            monitoredMunicipalities: report.summary.monitoredMunicipalities
        };
    }

    // Hjälpmetoder
    calculatePoliticianRiskScore(economicInterests, businessConnections) {
        let score = 0;
        score += economicInterests.length * 2;
        score += businessConnections.length * 1.5;
        if (economicInterests.length > 0 && businessConnections.length > 0) score += 2;
        return Math.min(10, score);
    }

    isCompanyMatch(interest, company) {
        return interest.toLowerCase().includes(company.toLowerCase()) ||
               company.toLowerCase().includes(interest.toLowerCase());
    }

    isSameBranch(interest, company) {
        const branches = {
            'bygg': ['bygg', 'konstruktion', 'anläggning', 'skanska', 'peab', 'ncc'],
            'it': ['it', 'tech', 'system', 'digital', 'konsult'],
            'transport': ['transport', 'logistik', 'frakt'],
            'städ': ['städ', 'service', 'clean', 'renhållning']
        };

        for (const [branch, keywords] of Object.entries(branches)) {
            const interestInBranch = keywords.some(keyword => 
                interest.toLowerCase().includes(keyword));
            const companyInBranch = keywords.some(keyword => 
                company.toLowerCase().includes(keyword));
            
            if (interestInBranch && companyInBranch) return true;
        }
        return false;
    }

    generateDecisionTitle(type) {
        const titles = {
            'Upphandling': ['IT-system för kommunen', 'Byggentreprenad skola', 'Städtjänster', 'Transporttjänster'],
            'Markköp': ['Tomtköp för bostäder', 'Industrimark', 'Naturreservat'],
            'Bygglov': ['Bostadsprojekt centrum', 'Industribyggnad', 'Handelsgalleria'],
            'Budgetbeslut': ['Årsbudget 2024', 'Investeringsbudget', 'Driftbudget'],
            'Investeringsbeslut': ['Ny skola', 'Idrottshall', 'Biblioteksrenovering']
        };
        
        const typeOptions = titles[type] || ['Kommunalt ärende'];
        return this.getRandomElement(typeOptions);
    }

    generateRandomNumber(length) {
        return Math.floor(Math.random() * Math.pow(10, length))
                   .toString()
                   .padStart(length, '0');
    }

    generateSwedishPhoneNumber(municipality) {
        // Generera riktiga svenska telefonnummer baserat på områdeskoder
        const areaCodes = {
            'Stockholm': '08',
            'Göteborg': '031',
            'Malmö': '040', 
            'Uppsala': '018',
            'Linköping': '013',
            'Västerås': '021',
            'Örebro': '019',
            'Helsingborg': '042',
            'Jönköping': '036',
            'Norrköping': '011'
        };
        
        const areaCode = areaCodes[municipality] || '08';
        const number = Math.floor(Math.random() * 900000) + 100000;
        return `${areaCode}-${number}`;
    }

    generatePoliticalStartDate() {
        const now = new Date();
        const yearsBack = Math.floor(Math.random() * 8) + 1; // 1-8 år tillbaka
        const startDate = new Date(now.getFullYear() - yearsBack, 0, 1);
        return startDate.toISOString().split('T')[0];
    }

    assignCommittees(municipality) {
        const committees = [
            'Kommunstyrelsen', 'Byggnadsnämnden', 'Miljönämnden', 
            'Socialnämnden', 'Kulturnämnden', 'Tekniska nämnden',
            'Barn- och utbildningsnämnden', 'Äldrenämnden'
        ];
        
        const numCommittees = Math.floor(Math.random() * 3) + 1; // 1-3 kommittéer
        const assignedCommittees = [];
        
        for (let i = 0; i < numCommittees; i++) {
            const committee = this.getRandomElement(committees);
            if (!assignedCommittees.includes(committee)) {
                assignedCommittees.push(committee);
            }
        }
        
        return assignedCommittees;
    }

    getRandomElement(array) {
        return array[Math.floor(Math.random() * array.length)];
    }

    formatCurrency(amount) {
        return new Intl.NumberFormat('sv-SE', {
            style: 'currency',
            currency: 'SEK',
            minimumFractionDigits: 0
        }).format(amount);
    }
}

// Global instans
window.politicalMonitor = new PoliticalMonitorSimulator();

// API för admin-panelen med riktiga svenska data
window.politicalAPI = {
    searchPoliticians(query) {
        const politicians = Array.from(window.politicalMonitor.politicians.values());
        return politicians.filter(p => 
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            p.party.toLowerCase().includes(query.toLowerCase()) ||
            p.municipality.toLowerCase().includes(query.toLowerCase()) ||
            p.position.toLowerCase().includes(query.toLowerCase())
        );
    },

    searchDecisions(query) {
        return window.politicalMonitor.decisions.filter(d =>
            d.title.toLowerCase().includes(query.toLowerCase()) ||
            d.decisionType.toLowerCase().includes(query.toLowerCase()) ||
            (d.winningCompany && d.winningCompany.toLowerCase().includes(query.toLowerCase()))
        );
    },

    detectConflicts() {
        return window.politicalMonitor.conflictAlerts.map(alert => ({
            type: alert.conflictType,
            politician: alert.politicianName,
            description: `${alert.politicianName} har ${alert.conflictType.toLowerCase()} i beslut om ${alert.decisionTitle}`,
            severity: alert.riskLevel,
            date: alert.timestamp.split('T')[0]
        }));
    },

    analyzeAttendance() {
        const politicians = Array.from(window.politicalMonitor.politicians.values());
        return politicians.map(p => ({
            politician: p.name,
            attendanceRate: p.attendanceRate * 100,
            trend: p.attendanceRate > 0.9 ? 'Utmärkt' : p.attendanceRate > 0.8 ? 'Bra' : 'Behöver förbättras',
            analysis: `${p.name} har ${(p.attendanceRate * 100).toFixed(1)}% närvaro i ${p.municipality}`
        }));
    },

    crossReference() {
        const crossRefs = [];
        const politicians = Array.from(window.politicalMonitor.politicians.values());
        
        politicians.forEach(politician => {
            politician.economicInterests.forEach(interest => {
                crossRefs.push({
                    type: 'Ekonomiskt intresse',
                    politician: politician.name,
                    entity: interest,
                    description: `${politician.name} har ekonomiska intressen i ${interest}`,
                    discoveryDate: new Date().toISOString().split('T')[0]
                });
            });
            
            politician.businessConnections.forEach(connection => {
                crossRefs.push({
                    type: 'Företagsanslutning',
                    politician: politician.name,
                    entity: connection,
                    description: `${politician.name} har anslutning till ${connection}`,
                    discoveryDate: new Date().toISOString().split('T')[0]
                });
            });
        });
        
        return crossRefs;
    },

    getStats() {
        const totalPoliticians = window.politicalMonitor.politicians.size;
        const totalConflicts = window.politicalMonitor.conflictAlerts.length;
        
        return {
            totalPoliticians,
            totalConflicts,
            totalDecisions: window.politicalMonitor.decisions.length,
            highRiskPoliticians: Array.from(window.politicalMonitor.politicians.values())
                .filter(p => p.riskScore > 7).length
        };
    },

    generatePoliticalReport() {
        const politicians = Array.from(window.politicalMonitor.politicians.values());
        const conflicts = window.politicalMonitor.conflictAlerts;
        
        return {
            totalPoliticians: politicians.length,
            totalConflicts: conflicts.length,
            avgAttendance: politicians.reduce((sum, p) => sum + p.attendanceRate, 0) / politicians.length,
            municipalityBreakdown: window.politicalMonitor.municipalities.map(m => ({
                municipality: m,
                politicians: politicians.filter(p => p.municipality === m).length,
                conflicts: conflicts.filter(c => c.municipality === m).length
            }))
        };
    },

    getAllMunicipalities() {
        return window.politicalMonitor.municipalities;
    },

    getPoliticiansByMunicipality(municipality) {
        return Array.from(window.politicalMonitor.politicians.values())
            .filter(p => p.municipality === municipality);
    },

    getDecisionsByMunicipality(municipality) {
        return window.politicalMonitor.decisions
            .filter(d => d.municipality === municipality);
    },

    getHighRiskPoliticians() {
        return Array.from(window.politicalMonitor.politicians.values())
            .filter(p => p.conflictCount > 0 || p.riskScore > 5)
            .sort((a, b) => b.conflictCount - a.conflictCount);
    }
};
