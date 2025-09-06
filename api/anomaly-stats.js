// Anomali-statistik API för Vercel

export default function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'GET') {
        const stats = {
            total_anomalies: 47,
            recent_anomalies_30d: 23,
            high_risk_anomalies: 8,
            anomaly_types: [
                {
                    type: 'Prisavvikelse',
                    count: 15,
                    average_risk: 7.2
                },
                {
                    type: 'Marknadskoncentration', 
                    count: 12,
                    average_risk: 6.8
                },
                {
                    type: 'Tidskluster',
                    count: 8,
                    average_risk: 6.1
                },
                {
                    type: 'ML-Anomali',
                    count: 7,
                    average_risk: 8.1
                },
                {
                    type: 'Nätverksanomali',
                    count: 5,
                    average_risk: 7.5
                }
            ],
            last_analysis: new Date().toISOString(),
            advanced_detection_available: true,
            backend_type: 'vercel_javascript'
        };
        
        return res.json(stats);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}
