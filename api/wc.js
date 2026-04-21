/**
 * Secure WooCommerce Proxy for Vercel
 * This file lives in /api/wc.js and runs as a serverless function.
 * It appends sensitive API keys on the server side, keeping them hidden from the browser.
 */

export default async function handler(req, res) {
  // 1. Extract endpoint and other parameters
  // We expect calls like: /api/wc?path=products&category=15
  const { path: wcPath, ...params } = req.query;

  if (!wcPath) {
    return res.status(400).json({ error: 'Missing path parameter' });
  }

  // 2. Get credentials from environment variables
  // In production, these must be set in the Vercel Dashboard (WITHOUT VITE_ prefix)
  // Fallback to VITE_ version if the secure ones aren't set yet (for transition)
  const WC_URL = (process.env.WC_URL || process.env.VITE_WC_URL || '').replace(/\/$/, '');
  const KEY = process.env.WC_CONSUMER_KEY || process.env.VITE_WC_CONSUMER_KEY;
  const SECRET = process.env.WC_CONSUMER_SECRET || process.env.VITE_WC_CONSUMER_SECRET;

  if (!WC_URL || !KEY || !SECRET) {
    console.error('SERVER ERROR: WooCommerce credentials missing in environment variables.');
    return res.status(500).json({ error: 'Server configuration error' });
  }

  // 3. Construct the official WooCommerce URL
  const qp = new URLSearchParams({
    consumer_key: KEY,
    consumer_secret: SECRET,
    ...params
  });

  const finalUrl = `${WC_URL}/wp-json/wc/v3/${wcPath}?${qp.toString()}`;

  try {
    // 4. Forward the request to WooCommerce
    const response = await fetch(finalUrl, {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        // Forward authorization header if login is handled via JWT
        ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {})
      },
      // Proxy the body for POST/PUT requests
      ...(req.method !== 'GET' && req.method !== 'HEAD' ? { body: JSON.stringify(req.body) } : {})
    });

    const data = await response.json();
    
    // 5. Return the result to the browser
    return res.status(response.status).json(data);
  } catch (error) {
    console.error(`PROXY ERROR (${wcPath}):`, error);
    return res.status(500).json({ error: 'Failed to communicate with WooCommerce' });
  }
}
