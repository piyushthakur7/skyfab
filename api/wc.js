const https = require('https');

/**
 * Secure WooCommerce Proxy for Vercel (Robust Version)
 * Uses standard Node.js https module for maximum compatibility across all runtimes.
 */
module.exports = async (req, res) => {
  try {
    // 1. Get parameters from query string
    const { path: wcPath, ...params } = req.query;

    if (!wcPath) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Missing path parameter' }));
    }

    // 2. Get credentials from environment variables
    const WC_URL = (process.env.WC_URL || process.env.VITE_WC_URL || '').replace(/\/$/, '');
    const KEY = params.consumer_key || process.env.WC_CONSUMER_KEY || process.env.VITE_WC_CONSUMER_KEY;
    const SECRET = params.consumer_secret || process.env.WC_CONSUMER_SECRET || process.env.VITE_WC_CONSUMER_SECRET;

    if (!WC_URL) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ error: 'Configuration Error', details: 'WC_URL is not defined in Vercel' }));
    }
    
    // Auth is required for WC endpoints, optional for some WP endpoints
    const isWpOnly = req.url.includes('/api/wp');
    if (!isWpOnly && (!KEY || !SECRET)) {
      res.statusCode = 401;
      return res.end(JSON.stringify({ error: 'Authentication Error', details: 'Consumer Key/Secret not found in environment' }));
    }

    // 3. Construct the official URL
    const apiBase = isWpOnly ? '/wp-json' : '/wp-json/wc/v3';
    const qp = new URLSearchParams(params);
    if (KEY) qp.set('consumer_key', KEY);
    if (SECRET) qp.set('consumer_secret', SECRET);

    const targetUrl = new URL(`${WC_URL}${apiBase}/${wcPath}?${qp.toString()}`);

    // 4. Perform the request using stable https module
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
        res.statusCode = proxyRes.statusCode;
        res.setHeader('Content-Type', 'application/json');
        res.end(data);
      });
    });

    proxyReq.on('error', (err) => {
      console.error('PROXY REQUEST ERROR:', err);
      res.statusCode = 500;
      res.end(JSON.stringify({ error: 'Failed to communicate with WooCommerce', details: err.message }));
    });

    // Write body if present
    if (req.body && Object.keys(req.body).length > 0) {
      proxyReq.write(JSON.stringify(req.body));
    }
    proxyReq.end();

  } catch (error) {
    console.error('PROXY CRASH:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({ error: 'Proxy Server Error', details: error.message }));
  }
};
