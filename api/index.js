// Vercel API för Nyhetsportalen
// Ersätter Python backend med JavaScript för Vercel-kompatibilitet

export default function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    // API status endpoint
    if (req.method === 'GET') {
        return res.json({
            status: 'active',
            version: '1.0.0',
            description: 'Nyhetsportalen Backend - Vercel JavaScript Version',
            endpoints: [
                '/api/procurements',
                '/api/anomalies',
                '/api/update-data',
                '/api/anomaly-stats'
            ],
            backend_type: 'vercel_javascript',
            data_source: 'fallback_realistic'
        });
    }
    
    return res.status(404).json({ error: 'Endpoint not found' });
}
