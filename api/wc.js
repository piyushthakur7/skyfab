import https from 'https';

/**
 * Secure WooCommerce Proxy for Vercel
 * ESM Version (Compatible with your package.json type: module)
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
    const KEY = params.consumer_key || process.env.WC_CONSUMER_KEY || process.env.VITE_WC_CONSUMER_KEY;
    const SECRET = params.consumer_secret || process.env.WC_CONSUMER_SECRET || process.env.VITE_WC_CONSUMER_SECRET;

    if (!WC_URL) {
      return res.status(500).json({ error: 'Configuration Error', details: 'WC_URL not found' });
    }
    
    // Auth is required for WC endpoints
    const isWpOnly = req.url.includes('/api/wp');
    if (!isWpOnly && (!KEY || !SECRET)) {
      return res.status(401).json({ error: 'Authentication Error', details: 'Keys not found' });
    }

    // 3. Construct the official URL
    const apiBase = isWpOnly ? '/wp-json' : '/wp-json/wc/v3';
    const qp = new URLSearchParams(params);
    if (KEY) qp.set('consumer_key', KEY);
    if (SECRET) qp.set('consumer_secret', SECRET);

    const targetUrl = new URL(`${WC_URL}${apiBase}/${wcPath}?${qp.toString()}`);

    // 4. Perform the request using promise-wrapped https
    return new Promise((resolve, reject) => {
      const options = {
        method: req.method,
        headers: {
          'Content-Type': 'application/json',
          ...(req.headers.authorization ? { 'Authorization': req.headers.authorization } : {})
        }
      };

      const proxyReq = https.request(targetUrl, options, (proxyRes) => {
        let data = '';
        proxyRes.on('data', (chunk) => { data += chunk; });
        proxyRes.on('end', () => {
          res.status(proxyRes.statusCode);
          res.setHeader('Content-Type', 'application/json');
          res.end(data);
          resolve();
        });
      });

      proxyReq.on('error', (err) => {
        console.error('PROXY REQUEST ERROR:', err);
        res.status(500).json({ error: 'Upstream Error', details: err.message });
        resolve(); // Still resolve to let Vercel finish
      });

      if (req.body && Object.keys(req.body).length > 0) {
        proxyReq.write(JSON.stringify(req.body));
      }
      proxyReq.end();
    });

  } catch (error) {
    console.error('PROXY CRITICAL CRASH:', error);
    return res.status(500).json({ error: 'Proxy Crash', details: error.message });
  }
}
