/**
 * Secure WooCommerce Proxy for Vercel
 * This file lives in /api/wc.js and runs as a serverless function.
 */

export default async function handler(req, res) {
  try {
    // 1. Get parameters from query string
    const { path: wcPath, ...params } = req.query;

    if (!wcPath) {
      return res.status(400).json({ error: 'Missing path parameter' });
    }

    // 2. Get credentials from environment variables
    const WC_URL = (process.env.WC_URL || process.env.VITE_WC_URL || '').replace(/\/$/, '');
    
    // Check if keys are provided in the query (for testing) OR in the environment
    const KEY = params.consumer_key || process.env.WC_CONSUMER_KEY || process.env.VITE_WC_CONSUMER_KEY;
    const SECRET = params.consumer_secret || process.env.WC_CONSUMER_SECRET || process.env.VITE_WC_CONSUMER_SECRET;

    if (!WC_URL) {
      return res.status(500).json({ error: 'Configuration Error', details: 'WC_URL is not defined in Vercel' });
    }
    if (!KEY || !SECRET) {
      return res.status(401).json({ error: 'Authentication Error', details: 'Consumer Key/Secret not found in environment' });
    }

    // 3. Construct clean destination URL
    const isWpOnly = req.url.includes('/api/wp');
    const apiBase = isWpOnly ? '/wp-json' : '/wp-json/wc/v3';
    
    const qp = new URLSearchParams(params);
    qp.set('consumer_key', KEY);
    qp.set('consumer_secret', SECRET);

    const finalUrl = `${WC_URL}${apiBase}/${wcPath}?${qp.toString()}`;

    // 4. Fetch from WooCommerce
    const response = await fetch(finalUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {})
      },
      ...(req.method !== 'GET' && req.method !== 'HEAD' ? { body: JSON.stringify(req.body) } : {})
    });

    const data = await response.json();
    return res.status(response.status).json(data);
  } catch (error) {
    console.error('PROXY CRASH:', error);
    return res.status(500).json({ error: 'Proxy Server Error', details: error.message });
  }
}
