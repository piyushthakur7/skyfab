/**
 * Secure WooCommerce Proxy for Vercel
 * This file lives in /api/wc.js and runs as a serverless function.
 */

export default async function handler(req, res) {
  // 1. Get parameters
  // The frontend sends the target WooCommerce endpoint in the 'path' query parameter
  const { path: wcPath, ...params } = req.query;

  if (!wcPath) {
    console.error('PROXY ERROR: Missing path parameter');
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  // 2. Get credentials from environment variables
  const WC_URL = (process.env.WC_URL || process.env.VITE_WC_URL || '').replace(/\/$/, '');
  const KEY = process.env.WC_CONSUMER_KEY || process.env.VITE_WC_CONSUMER_KEY;
  const SECRET = process.env.WC_CONSUMER_SECRET || process.env.VITE_WC_CONSUMER_SECRET;

  // Debug check (hidden from client)
  if (!WC_URL || !KEY || !SECRET) {
    const missing = [];
    if (!WC_URL) missing.push('WC_URL');
    if (!KEY) missing.push('WC_CONSUMER_KEY');
    if (!SECRET) missing.push('WC_CONSUMER_SECRET');
    console.error('SERVER ERROR: Missing env vars:', missing.join(', '));
    return res.status(500).json({ 
      error: 'Server configuration error', 
      details: 'API credentials not found in Vercel environment' 
    });
  }

  // 3. Determine if this is a WC or WP endpoint
  // wcPath starting with 'jwt-auth' etc. means it's a WP endpoint, not WC
  const isWpOnly = req.url.includes('/api/wp');
  const apiBase = isWpOnly ? '/wp-json' : '/wp-json/wc/v3';

  // 4. Construct the official URL
  const qp = new URLSearchParams({
    ...params,
    consumer_key: KEY,
    consumer_secret: SECRET
  });

  const finalUrl = `${WC_URL}${apiBase}/${wcPath}?${qp.toString()}`;

  try {
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
    console.error(`PROXY ERROR (${wcPath}):`, error);
    return res.status(500).json({ error: 'Failed to communicate with WooCommerce' });
  }
}
