// Data update API för Vercel
// Simulerar datauppdatering

export default function handler(req, res) {
    // CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method === 'POST') {
        // Simulera datauppdatering
        const result = {
            status: 'success',
            message: 'Data uppdaterad från svenska källor',
            contracts_found: Math.floor(Math.random() * 25) + 15, // 15-40 nya kontrakt
            contracts_stored: Math.floor(Math.random() * 20) + 10, // 10-30 lagrade
            timestamp: new Date().toISOString(),
            backend_type: 'vercel_javascript',
            data_sources: [
                'TED EU Database (fallback)',
                'Svenska kommuner (simulerat)',
                'Offentliga upphandlingar (demo)'
            ]
        };
        
        return res.json(result);
    }
    
    return res.status(405).json({ error: 'Method not allowed' });
}
