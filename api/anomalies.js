// Anomalier API för Vercel  
// Genererar realistiska anomalier baserat på svenska upphandlingsmönster

export default function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'GET') {
        const limit = parseInt(req.query.limit) || 20;
        const type = req.query.type;
        
        const anomalies = generateSwedishAnomalies(limit, type);
        
        return res.json(anomalies);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}

function generateSwedishAnomalies(limit, filterType) {
    const anomalies = [
        {
            id: 1,
            procurement_id: 1,
            anomaly_type: 'Prisavvikelse',
            description: 'Kontraktsvärde 65M SEK avviker 420% från medel för IT-drift kategorin (15.5M SEK)',
            risk_score: 8.7,
            detected_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            title: 'IT-drift och support för Stockholms stad',
            contracting_authority: 'Stockholms stad',
            winner_name: 'CGI Sverige AB',
            value: 65000000
        },
        {
            id: 2,
            procurement_id: 3,
            anomaly_type: 'Marknadskoncentration',
            description: 'Securitas Sverige AB vinner 73% av säkerhetskontrakt i Malmö kommun (värde: 67%)',
            risk_score: 7.4,
            detected_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
            title: 'Säkerhetstjänster för kommunala fastigheter',
            contracting_authority: 'Malmö kommun',
            winner_name: 'Securitas Sverige AB',
            value: 22000000
        },
        {
            id: 3,
            procurement_id: 8,
            anomaly_type: 'Tidskluster',
            description: '7 byggkontrakt tilldelade samma dag (2025-08-15) av Göteborgs kommun',
            risk_score: 6.9,
            detected_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            title: 'Byggentreprenad för kommunala projekt',
            contracting_authority: 'Göteborgs kommun',
            winner_name: 'Skanska Sverige AB',
            value: 145000000
        },
        {
            id: 4,
            procurement_id: 12,
            anomaly_type: 'ML-Anomali',
            description: 'Machine Learning algoritm flaggade kombinationen av pris, timing och aktörer som avvikande',
            risk_score: 8.2,
            detected_at: new Date(Date.now() - 4 * 24 * 60 * 60 * 1000).toISOString(),
            title: 'Konsulttjänster inom digitalisering',
            contracting_authority: 'Uppsala kommun',
            winner_name: 'Accenture Sverige AB',
            value: 89000000
        },
        {
            id: 5,
            procurement_id: 15,
            anomaly_type: 'Nätverksanomali',
            description: 'Stark koppling: ISS Facility Services AB har 14 kontrakt med Linköpings kommun under 180 dagar',
            risk_score: 7.1,
            detected_at: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            title: 'Facilitetstjänster för kommunala verksamheter',
            contracting_authority: 'Linköpings kommun', 
            winner_name: 'ISS Facility Services AB',
            value: 34000000
        },
        {
            id: 6,
            procurement_id: 18,
            anomaly_type: 'Prisavvikelse',
            description: 'Transportkontrakt 45M SEK avviker 285% från regionalt medel (15.8M SEK)',
            risk_score: 6.8,
            detected_at: new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toISOString(),
            title: 'Transporttjänster för kollektivtrafik',
            contracting_authority: 'Västerås stad',
            winner_name: 'Nobina Sverige AB',
            value: 45000000
        },
        {
            id: 7,
            procurement_id: 21,
            anomaly_type: 'Marknadskoncentration',
            description: 'TietoEVRY Sverige AB vinner 68% av IT-kontrakt i Örebro kommun',
            risk_score: 7.6,
            detected_at: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
            title: 'IT-systemintegration och support',
            contracting_authority: 'Örebro kommun',
            winner_name: 'TietoEVRY Sverige AB',
            value: 28000000
        },
        {
            id: 8,
            procurement_id: 25,
            anomaly_type: 'Tidskluster',
            description: '5 städkontrakt tilldelade inom 2 dagar av Helsingborgs stad',
            risk_score: 5.9,
            detected_at: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            title: 'Städtjänster för kommunala byggnader',
            contracting_authority: 'Helsingborgs stad',
            winner_name: 'Coor Service Management AB',
            value: 18000000
        }
    ];
    
    // Filtrera efter typ om angiven
    let filteredAnomalies = anomalies;
    if (filterType) {
        filteredAnomalies = anomalies.filter(a => a.anomaly_type === filterType);
    }
    
    // Begränsa antal resultat
    return filteredAnomalies.slice(0, limit);
}
