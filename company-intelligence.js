// Företagsintelligens & Ägaranalys Simulator
class CompanyIntelligenceSimulator {
    constructor() {
        this.companies = new Map();
        this.people = new Map();
        this.contracts = [];
        this.legalEvents = [];
        
        this.generateSampleData();
    }

    generateSampleData() {
        // Generera personer (ägare, styrelseledamöter, VD:ar)
        this.generatePeople();
        
        // Generera företag med kopplingar
        this.generateCompanies();
        
        // Generera kontrakt
        this.generateContracts();
        
        // Generera juridiska händelser
        this.generateLegalEvents();
    }

    generatePeople() {
        const firstNames = ["Anna", "Erik", "Maria", "Lars", "Emma", "Johan", "Sofia", "Peter", "Linda", "Anders"];
        const lastNames = ["Andersson", "Johansson", "Karlsson", "Nilsson", "Eriksson", "Larsson", "Olsson", "Persson", "Svensson", "Gustafsson"];
        
        for (let i = 0; i < 50; i++) {
            const firstName = this.getRandomElement(firstNames);
            const lastName = this.getRandomElement(lastNames);
            const personId = this.generatePersonId();
            
            this.people.set(personId, {
                id: personId,
                name: `${firstName} ${lastName}`,
                roles: [],
                companies: [],
                addresses: [this.generateAddress()],
                riskScore: Math.random() * 10
            });
        }
    }

    generateCompanies() {
        const companyTypes = ["AB", "HB", "KB", "Enskild firma"];
        const businessAreas = ["IT-konsult", "Byggentreprenad", "Ekonomikonsult", "Systemutveckling", "Fastighetsförvaltning", "Transport", "Städtjänster"];
        
        for (let i = 0; i < 30; i++) {
            const orgNr = this.generateOrgNr();
            const businessArea = this.getRandomElement(businessAreas);
            const companyType = this.getRandomElement(companyTypes);
            
            const company = {
                orgNr: orgNr,
                name: `${businessArea} ${this.generateCompanyName()} ${companyType}`,
                businessArea: businessArea,
                registrationDate: this.generateDate(3650), // Upp till 10 år tillbaka
                address: this.generateAddress(),
                revenue: this.generateRevenue(),
                employees: Math.floor(Math.random() * 100) + 1,
                owners: [],
                boardMembers: [],
                ceo: null,
                subsidiaries: [],
                parentCompany: null,
                economicHealth: this.generateEconomicHealth(),
                contracts: [],
                riskScore: 0
            };
            
            // Lägg till ägare
            this.addOwnersToCompany(company);
            
            // Lägg till styrelseledamöter
            this.addBoardMembersToCompany(company);
            
            // Lägg till VD
            this.addCEOToCompany(company);
            
            // Beräkna riskpoäng
            company.riskScore = this.calculateCompanyRiskScore(company);
            
            this.companies.set(orgNr, company);
        }
        
        // Skapa koncernstrukturer
        this.createCorporateStructures();
    }

    addOwnersToCompany(company) {
        const numOwners = Math.floor(Math.random() * 3) + 1; // 1-3 ägare
        const availablePeople = Array.from(this.people.keys());
        
        for (let i = 0; i < numOwners; i++) {
            const personId = this.getRandomElement(availablePeople);
            const ownership = Math.random() * (100 / numOwners);
            
            company.owners.push({
                personId: personId,
                ownership: ownership,
                role: "Ägare"
            });
            
            // Uppdatera personens kopplingar
            const person = this.people.get(personId);
            person.companies.push({
                orgNr: company.orgNr,
                role: "Ägare",
                ownership: ownership
            });
            person.roles.push(`Ägare i ${company.name}`);
        }
    }

    addBoardMembersToCompany(company) {
        const numMembers = Math.floor(Math.random() * 4) + 2; // 2-5 styrelseledamöter
        const availablePeople = Array.from(this.people.keys());
        
        for (let i = 0; i < numMembers; i++) {
            const personId = this.getRandomElement(availablePeople);
            const role = i === 0 ? "Styrelseordförande" : "Styrelseledamot";
            
            if (!company.boardMembers.find(m => m.personId === personId)) {
                company.boardMembers.push({
                    personId: personId,
                    role: role,
                    appointedDate: this.generateDate(1095) // Senaste 3 åren
                });
                
                // Uppdatera personens kopplingar
                const person = this.people.get(personId);
                person.companies.push({
                    orgNr: company.orgNr,
                    role: role
                });
                person.roles.push(`${role} i ${company.name}`);
            }
        }
    }

    addCEOToCompany(company) {
        const availablePeople = Array.from(this.people.keys());
        const personId = this.getRandomElement(availablePeople);
        
        company.ceo = {
            personId: personId,
            appointedDate: this.generateDate(1825) // Senaste 5 åren
        };
        
        // Uppdatera personens kopplingar
        const person = this.people.get(personId);
        person.companies.push({
            orgNr: company.orgNr,
            role: "VD"
        });
        person.roles.push(`VD för ${company.name}`);
    }

    createCorporateStructures() {
        const companies = Array.from(this.companies.values());
        
        // Skapa några koncernstrukturer
        for (let i = 0; i < 5; i++) {
            const parentCompany = this.getRandomElement(companies);
            const numSubsidiaries = Math.floor(Math.random() * 3) + 1;
            
            for (let j = 0; j < numSubsidiaries; j++) {
                const subsidiary = this.getRandomElement(companies);
                if (subsidiary.orgNr !== parentCompany.orgNr && !subsidiary.parentCompany) {
                    subsidiary.parentCompany = parentCompany.orgNr;
                    parentCompany.subsidiaries.push(subsidiary.orgNr);
                }
            }
        }
    }

    generateContracts() {
        const municipalities = ["Stockholm", "Göteborg", "Malmö", "Uppsala", "Linköping"];
        const contractTypes = ["IT-tjänster", "Byggentreprenad", "Konsulttjänster", "Underhåll", "Transport"];
        
        for (let i = 0; i < 100; i++) {
            const companies = Array.from(this.companies.keys());
            const contract = {
                id: `contract_${i}`,
                companyOrgNr: this.getRandomElement(companies),
                municipality: this.getRandomElement(municipalities),
                contractType: this.getRandomElement(contractTypes),
                value: this.generateContractValue(),
                startDate: this.generateDate(1095),
                endDate: null,
                title: this.generateContractTitle(),
                status: this.getRandomElement(["Aktiv", "Avslutad", "Uppsagd"])
            };
            
            // Lägg till kontraktet till företaget
            const company = this.companies.get(contract.companyOrgNr);
            if (company) {
                company.contracts.push(contract.id);
            }
            
            this.contracts.push(contract);
        }
    }

    generateLegalEvents() {
        const eventTypes = ["Konkurs", "Företagsrekonstruktion", "Betalningsanmärkning", "Skatteskuld", "Rättegång"];
        const companies = Array.from(this.companies.keys());
        
        for (let i = 0; i < 20; i++) {
            const event = {
                id: `event_${i}`,
                companyOrgNr: this.getRandomElement(companies),
                eventType: this.getRandomElement(eventTypes),
                date: this.generateDate(1825), // Senaste 5 åren
                description: this.generateLegalEventDescription(),
                severity: Math.floor(Math.random() * 5) + 1, // 1-5
                status: this.getRandomElement(["Aktiv", "Avslutad", "Under utredning"])
            };
            
            this.legalEvents.push(event);
        }
    }

    // API-metoder för företagsintelligens
    searchCompany(query) {
        const results = [];
        
        for (const [orgNr, company] of this.companies) {
            if (company.name.toLowerCase().includes(query.toLowerCase()) || 
                orgNr.includes(query)) {
                results.push(company);
            }
        }
        
        return results;
    }

    getCompanyDetails(orgNr) {
        const company = this.companies.get(orgNr);
        if (!company) return null;
        
        // Lägg till detaljerad information
        return {
            ...company,
            owners: company.owners.map(owner => ({
                ...owner,
                person: this.people.get(owner.personId)
            })),
            boardMembers: company.boardMembers.map(member => ({
                ...member,
                person: this.people.get(member.personId)
            })),
            ceo: company.ceo ? {
                ...company.ceo,
                person: this.people.get(company.ceo.personId)
            } : null,
            subsidiaries: company.subsidiaries.map(sub => this.companies.get(sub)),
            parentCompany: company.parentCompany ? this.companies.get(company.parentCompany) : null,
            contracts: this.contracts.filter(c => c.companyOrgNr === orgNr),
            legalEvents: this.legalEvents.filter(e => e.companyOrgNr === orgNr)
        };
    }

    searchPerson(query) {
        const results = [];
        
        for (const [personId, person] of this.people) {
            if (person.name.toLowerCase().includes(query.toLowerCase()) || 
                personId.includes(query)) {
                results.push({
                    ...person,
                    companies: person.companies.map(comp => ({
                        ...comp,
                        company: this.companies.get(comp.orgNr)
                    }))
                });
            }
        }
        
        return results;
    }

    findNetworkConnections(companyOrgNr) {
        const company = this.companies.get(companyOrgNr);
        if (!company) return [];
        
        const connections = new Set();
        const people = new Set();
        
        // Samla alla personer kopplade till företaget
        company.owners.forEach(owner => people.add(owner.personId));
        company.boardMembers.forEach(member => people.add(member.personId));
        if (company.ceo) people.add(company.ceo.personId);
        
        // Hitta andra företag där samma personer är aktiva
        for (const personId of people) {
            const person = this.people.get(personId);
            person.companies.forEach(comp => {
                if (comp.orgNr !== companyOrgNr) {
                    connections.add(comp.orgNr);
                }
            });
        }
        
        return Array.from(connections).map(orgNr => ({
            company: this.companies.get(orgNr),
            connectionType: "Personkoppling",
            sharedPeople: this.getSharedPeople(companyOrgNr, orgNr)
        }));
    }

    getSharedPeople(orgNr1, orgNr2) {
        const company1People = this.getCompanyPeople(orgNr1);
        const company2People = this.getCompanyPeople(orgNr2);
        
        return company1People.filter(p1 => 
            company2People.some(p2 => p1.personId === p2.personId)
        );
    }

    getCompanyPeople(orgNr) {
        const company = this.companies.get(orgNr);
        if (!company) return [];
        
        const people = [];
        
        company.owners.forEach(owner => 
            people.push({ personId: owner.personId, role: 'Ägare' }));
        company.boardMembers.forEach(member => 
            people.push({ personId: member.personId, role: member.role }));
        if (company.ceo) 
            people.push({ personId: company.ceo.personId, role: 'VD' });
        
        return people;
    }

    analyzeCompetitorBidding(municipality) {
        // Hitta företag som ofta konkurrerar mot varandra
        const municipalityContracts = this.contracts.filter(c => c.municipality === municipality);
        const companies = new Set(municipalityContracts.map(c => c.companyOrgNr));
        
        const suspiciousPatterns = [];
        
        for (const orgNr of companies) {
            const connections = this.findNetworkConnections(orgNr);
            const competitorConnections = connections.filter(conn => 
                companies.has(conn.company.orgNr)
            );
            
            if (competitorConnections.length > 0) {
                suspiciousPatterns.push({
                    company: this.companies.get(orgNr),
                    suspiciousConnections: competitorConnections,
                    riskLevel: competitorConnections.length > 2 ? "Hög" : "Medium"
                });
            }
        }
        
        return suspiciousPatterns;
    }

    getRiskAnalysis() {
        const riskCompanies = Array.from(this.companies.values())
            .filter(company => company.riskScore > 6)
            .sort((a, b) => b.riskScore - a.riskScore);
        
        const highRiskPeople = Array.from(this.people.values())
            .filter(person => person.riskScore > 7)
            .sort((a, b) => b.riskScore - a.riskScore);
        
        return {
            highRiskCompanies: riskCompanies.slice(0, 10),
            highRiskPeople: highRiskPeople.slice(0, 10),
            totalAnalyzedCompanies: this.companies.size,
            totalAnalyzedPeople: this.people.size,
            riskStatistics: this.calculateRiskStatistics()
        };
    }

    calculateRiskStatistics() {
        const companies = Array.from(this.companies.values());
        const riskLevels = {
            low: companies.filter(c => c.riskScore <= 3).length,
            medium: companies.filter(c => c.riskScore > 3 && c.riskScore <= 6).length,
            high: companies.filter(c => c.riskScore > 6).length
        };
        
        return riskLevels;
    }

    // Hjälpmetoder
    calculateCompanyRiskScore(company) {
        let score = 0;
        
        // Ekonomisk hälsa
        if (company.economicHealth < 3) score += 3;
        else if (company.economicHealth < 5) score += 1;
        
        // Antal kontrakt vs storlek
        const contractRatio = company.contracts.length / (company.employees || 1);
        if (contractRatio > 2) score += 2;
        
        // Koncernkopplingar
        if (company.subsidiaries.length > 3) score += 1;
        if (company.parentCompany) score += 0.5;
        
        return Math.min(10, score);
    }

    generatePersonId() {
        const year = Math.floor(Math.random() * 50) + 50; // 1950-1999
        const month = Math.floor(Math.random() * 12) + 1;
        const day = Math.floor(Math.random() * 28) + 1;
        const serial = Math.floor(Math.random() * 999) + 1;
        
        return `19${year.toString().padStart(2, '0')}${month.toString().padStart(2, '0')}${day.toString().padStart(2, '0')}-${serial.toString().padStart(3, '0')}${Math.floor(Math.random() * 10)}`;
    }

    generateOrgNr() {
        return `55${Math.floor(Math.random() * 100000000).toString().padStart(8, '0')}`;
    }

    generateDate(maxDaysAgo) {
        const daysAgo = Math.floor(Math.random() * maxDaysAgo);
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);
        return date.toISOString().split('T')[0];
    }

    generateAddress() {
        const streets = ["Storgatan", "Kyrkogatan", "Skolvägen", "Industrigatan", "Företagsgatan"];
        const cities = ["Stockholm", "Göteborg", "Malmö", "Uppsala", "Linköping", "Västerås", "Örebro"];
        
        return {
            street: `${this.getRandomElement(streets)} ${Math.floor(Math.random() * 100) + 1}`,
            city: this.getRandomElement(cities),
            postalCode: `${Math.floor(Math.random() * 900) + 100} ${Math.floor(Math.random() * 90) + 10}`
        };
    }

    generateRevenue() {
        return Math.floor(Math.random() * 50000000) + 100000; // 100k - 50M SEK
    }

    generateEconomicHealth() {
        return Math.floor(Math.random() * 10) + 1; // 1-10 skala
    }

    generateCompanyName() {
        const names = ["Nord", "Syd", "Väst", "Öst", "Pro", "Expert", "Elite", "Prime", "Smart", "Dynamic"];
        return this.getRandomElement(names);
    }

    generateContractValue() {
        return Math.floor(Math.random() * 10000000) + 50000; // 50k - 10M SEK
    }

    generateContractTitle() {
        const titles = [
            "Systemutveckling och drift",
            "Byggentreprenad kommunhus",
            "IT-konsulttjänster",
            "Underhåll kommunala fastigheter",
            "Transport och logistik"
        ];
        return this.getRandomElement(titles);
    }

    generateLegalEventDescription() {
        const descriptions = [
            "Ansökan om företagsrekonstruktion inlämnad",
            "Betalningsanmärkning registrerad",
            "Rättegång avseende kontraktsbrott",
            "Skatteskuld hos Kronofogden",
            "Konkursansökan inlämnad till tingsrätt"
        ];
        return this.getRandomElement(descriptions);
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
window.companyIntelligence = new CompanyIntelligenceSimulator();

// API för admin-panelen
window.companyIntelligenceAPI = {
    searchCompany(query) {
        return window.companyIntelligence.searchCompany(query);
    },
    
    getCompanyDetails(orgNr) {
        return window.companyIntelligence.getCompanyDetails(orgNr);
    },
    
    searchPerson(query) {
        return window.companyIntelligence.searchPerson(query);
    },
    
    findNetworkConnections(orgNr) {
        return window.companyIntelligence.findNetworkConnections(orgNr);
    },
    
    analyzeCompetitorBidding(municipality) {
        return window.companyIntelligence.analyzeCompetitorBidding(municipality);
    },
    
    getRiskAnalysis() {
        return window.companyIntelligence.getRiskAnalysis();
    },
    
    getDashboardStats() {
        const riskAnalysis = this.getRiskAnalysis();
        return {
            totalCompanies: window.companyIntelligence.companies.size,
            totalPeople: window.companyIntelligence.people.size,
            highRiskCompanies: riskAnalysis.highRiskCompanies.length,
            totalContracts: window.companyIntelligence.contracts.length,
            legalEvents: window.companyIntelligence.legalEvents.length
        };
    }
};
