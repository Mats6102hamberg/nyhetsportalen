// Upphandlingar API för Vercel
// Returnerar realistisk svensk upphandlingsdata

export default function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'GET') {
        const limit = parseInt(req.query.limit) || 50;
        const municipality = req.query.municipality;
        
        // Generera realistiska svenska upphandlingar
        const procurements = generateSwedishProcurements(limit, municipality);
        
        return res.json(procurements);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}

function generateSwedishProcurements(limit, municipality) {
    const authorities = [
        "Stockholms stad", "Göteborgs kommun", "Malmö kommun",
        "Uppsala kommun", "Linköpings kommun", "Västerås stad",
        "Örebro kommun", "Helsingborgs stad", "Jönköpings kommun",
        "Norrköpings kommun", "Lunds kommun", "Umeå kommun"
    ];
    
    const companies = [
        { name: "Skanska Sverige AB", org_nr: "556016-0680" },
        { name: "CGI Sverige AB", org_nr: "556034-5000" },
        { name: "Securitas Sverige AB", org_nr: "556138-3073" },
        { name: "ISS Facility Services AB", org_nr: "556159-2011" },
        { name: "Accenture Sverige AB", org_nr: "556264-2988" },
        { name: "TietoEVRY Sverige AB", org_nr: "556019-8863" },
        { name: "Ericsson AB", org_nr: "556016-0680" },
        { name: "Volvo Group Sverige AB", org_nr: "556012-5790" }
    ];
    
    const contractTypes = [
        { title: "IT-drift och support", base_value: 15000000, cpv: ["72000000"] },
        { title: "Byggentreprenad", base_value: 50000000, cpv: ["45000000"] },
        { title: "Säkerhetstjänster", base_value: 8000000, cpv: ["79710000"] },
        { title: "Facilitetstjänster", base_value: 12000000, cpv: ["90900000"] },
        { title: "Konsulttjänster", base_value: 25000000, cpv: ["73000000"] },
        { title: "Städtjänster", base_value: 6000000, cpv: ["90910000"] },
        { title: "Transporttjänster", base_value: 18000000, cpv: ["60000000"] }
    ];
    
    const procurements = [];
    
    for (let i = 0; i < Math.min(limit, 100); i++) {
        const contractType = contractTypes[Math.floor(Math.random() * contractTypes.length)];
        const authority = municipality || authorities[Math.floor(Math.random() * authorities.length)];
        const company = companies[Math.floor(Math.random() * companies.length)];
        
        // Realistisk prisvariation
        const variation = 0.7 + Math.random() * 1.1; // 70% - 180%
        const value = Math.round(contractType.base_value * variation);
        
        // Datum senaste 90 dagarna
        const daysAgo = Math.floor(Math.random() * 90);
        const awardDate = new Date();
        awardDate.setDate(awardDate.getDate() - daysAgo);
        
        const procurement = {
            id: i + 1,
            ted_id: `2025-SE-${String(i + 1000).padStart(6, '0')}`,
            title: `${contractType.title} för ${authority}`,
            contracting_authority: authority,
            winner_name: company.name,
            winner_org_nr: company.org_nr,
            value: value,
            currency: 'SEK',
            award_date: awardDate.toISOString().split('T')[0],
            municipality: authority.replace(' kommun', '').replace(' stad', ''),
            cpv_codes: contractType.cpv.join(','),
            source: 'VERCEL_GENERATED',
            created_at: new Date().toISOString()
        };
        
        procurements.push(procurement);
    }
    
    // Sortera efter datum (nyast först)
    procurements.sort((a, b) => new Date(b.award_date) - new Date(a.award_date));
    
    return procurements;
}
