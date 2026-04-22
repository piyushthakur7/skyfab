/**
 * Secure WooCommerce Proxy for Vercel (Definitive Version)
 * 
 * DESIGN:
 * This version uses ZERO dependencies and manual URL parsing.
 * It is designed to be 100% stable even in environments where 
 * standard Vercel helpers like 'req.query' are missing.
 */
export default async function handler(req, res) {
  try {
    // 1. Manually parse the incoming URL
    // In raw Node.js Vercel handlers, req.url is just the path + query string.
    // We must parse it ourselves to get the 'path' and other parameters.
    const baseUrl = `http://${req.headers.host || 'localhost'}`;
    const urlObject = new URL(req.url, baseUrl);
    const queryParams = Object.fromEntries(urlObject.searchParams.entries());

    // 2. Extract the target WooCommerce path
    const wcPath = queryParams.path;
    if (!wcPath) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Missing path parameter' }));
    }

    // 3. Get credentials from environment variables
    // In production, these must be set in the Vercel Dashboard (WITHOUT VITE_ prefix)
    const WC_URL = (process.env.WC_URL || process.env.VITE_WC_URL || '').replace(/\/$/, '');
    const KEY = process.env.WC_CONSUMER_KEY || process.env.VITE_WC_CONSUMER_KEY;
    const SECRET = process.env.WC_CONSUMER_SECRET || process.env.VITE_WC_CONSUMER_SECRET;

    // Safety checks
    if (!WC_URL) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ error: 'Config Error', details: 'WC_URL is not defined' }));
    }
    
    // Auth is required for WC endpoints
    const isWpOnly = req.url.includes('/api/wp');
    if (!isWpOnly && (!KEY || !SECRET)) {
      res.statusCode = 401;
      return res.end(JSON.stringify({ error: 'Auth Error', details: 'API keys not found in environment' }));
    }

    // 4. Construct the official destination URL
    // We remove the 'path' param from the original query before forwarding
    const forwardParams = new URLSearchParams(queryParams);
    forwardParams.delete('path'); // Don't send 'path' to WooCommerce
    if (KEY) forwardParams.set('consumer_key', KEY);
    if (SECRET) forwardParams.set('consumer_secret', SECRET);

    const apiBase = isWpOnly ? '/wp-json' : '/wp-json/wc/v3';
    const finalUrl = `${WC_URL}${apiBase}/${wcPath}?${forwardParams.toString()}`;

    // 5. Fetch from WooCommerce
    const response = await fetch(finalUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {})
      },
      ...(req.method !== 'GET' && req.method !== 'HEAD' ? { body: JSON.stringify(req.body) } : {})
    });

    // 6. Handle raw response
    const data = await response.json();
    
    res.statusCode = response.status;
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(data));

  } catch (error) {
    console.error('CRITICAL PROXY ERROR:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ 
      error: 'Proxy Crash', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined 
    }));
  }
}
