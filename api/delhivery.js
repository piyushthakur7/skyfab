/**
 * Secure Delhivery API Proxy for Vercel
 *
 * DESIGN:
 * This serverless function proxies requests to the Delhivery API so
 * the API token never leaves the server. The `action` query parameter
 * determines which Delhivery endpoint to call.
 *
 * Supported actions:
 *   - pincode    → Check pincode serviceability
 *   - track      → Track a shipment by waybill number
 *   - rate       → Calculate approximate shipping cost
 */
export default async function handler(req, res) {
  // CORS headers for preflight
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') {
    res.statusCode = 204;
    return res.end();
  }

  try {
    // 1. Parse query params
    const baseUrl = `http://${req.headers.host || 'localhost'}`;
    const urlObject = new URL(req.url, baseUrl);
    const params = Object.fromEntries(urlObject.searchParams.entries());

    const action = params.action;
    if (!action) {
      res.statusCode = 400;
      return res.end(JSON.stringify({ error: 'Missing `action` parameter. Use: pincode | track | rate' }));
    }

    // 2. Get API token — env var with hardcoded fallback for your key
    const TOKEN = process.env.DELHIVERY_API_TOKEN || '84c2f0408e26cdfdd98fefe4f98251f34ef9158b';
    const BASE = 'https://track.delhivery.com';

    if (!TOKEN) {
      res.statusCode = 500;
      return res.end(JSON.stringify({ error: 'Config Error', details: 'DELHIVERY_API_TOKEN is not defined' }));
    }

    let targetUrl = '';

    // 3. Route to the correct Delhivery endpoint
    switch (action) {
      // ── Pincode Serviceability ──────────────────────────────
      case 'pincode': {
        const pincode = params.filter_codes;
        if (!pincode) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Missing `filter_codes` parameter (pincode)' }));
        }
        targetUrl = `${BASE}/c/api/pin-codes/json/?token=${TOKEN}&filter_codes=${pincode}`;
        break;
      }

      // ── Shipment Tracking ──────────────────────────────────
      case 'track': {
        const waybill = params.waybill;
        if (!waybill) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Missing `waybill` parameter' }));
        }
        targetUrl = `${BASE}/api/v1/packages/json/?waybill=${waybill}&token=${TOKEN}`;
        break;
      }

      // ── Rate Calculation ───────────────────────────────────
      case 'rate': {
        const { o_pin, d_pin, cgm, md, ss } = params;
        if (!d_pin) {
          res.statusCode = 400;
          return res.end(JSON.stringify({ error: 'Missing `d_pin` (destination pincode) parameter' }));
        }
        // Default origin = Surat warehouse 394325
        const originPin = o_pin || '394325';
        const weight = cgm || '500';       // default 500g
        const mode = md || 'S';            // S = Surface, E = Express
        const shipStatus = ss || 'Delivered';
        targetUrl = `${BASE}/api/kinko/v1/invoice/charges/.json?md=${mode}&cgm=${weight}&o_pin=${originPin}&d_pin=${d_pin}&ss=${shipStatus}&token=${TOKEN}`;
        break;
      }

      default:
        res.statusCode = 400;
        return res.end(JSON.stringify({ error: `Unknown action: ${action}. Use: pincode | track | rate` }));
    }

    // 4. Fetch from Delhivery
    const response = await fetch(targetUrl, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'Authorization': `Token ${TOKEN}`,
      },
    });

    const data = await response.json();

    res.statusCode = response.status;
    res.setHeader('Content-Type', 'application/json');
    // Cache for 5 minutes to reduce rate-limit pressure (40 req/min on rate API)
    res.setHeader('Cache-Control', 's-maxage=300, stale-while-revalidate=60');
    res.end(JSON.stringify(data));

  } catch (error) {
    console.error('DELHIVERY PROXY ERROR:', error);
    res.statusCode = 500;
    res.end(JSON.stringify({
      error: 'Delhivery Proxy Error',
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    }));
  }
}
