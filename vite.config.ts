import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, loadEnv} from 'vite';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(),
      tailwindcss(),
      {
        name: 'delhivery-api-proxy',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            if (req.url && req.url.startsWith('/api/delhivery')) {
              try {
                const urlObject = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
                const params = Object.fromEntries(urlObject.searchParams.entries());
                const action = params.action;

                const TOKEN = env.DELHIVERY_API_TOKEN || '84c2f0408e26cdfdd98fefe4f98251f34ef9158b';
                const BASE = 'https://track.delhivery.com';

                let targetUrl = '';
                if (action === 'pincode') {
                  targetUrl = `${BASE}/c/api/pin-codes/json/?token=${TOKEN}&filter_codes=${params.filter_codes}`;
                } else if (action === 'track') {
                  targetUrl = `${BASE}/api/v1/packages/json/?waybill=${params.waybill}&token=${TOKEN}`;
                } else if (action === 'rate') {
                  const originPin = params.o_pin || '394325';
                  const weight = params.cgm || '500';
                  const mode = params.md || 'S';
                  targetUrl = `${BASE}/api/kinko/v1/invoice/charges/.json?md=${mode}&cgm=${weight}&o_pin=${originPin}&d_pin=${params.d_pin}&ss=Delivered&token=${TOKEN}`;
                } else {
                  res.statusCode = 400;
                  res.setHeader('Content-Type', 'application/json');
                  res.end(JSON.stringify({ error: 'Missing or invalid action parameter' }));
                  return;
                }

                const response = await fetch(targetUrl, {
                  headers: {
                    'Authorization': `Token ${TOKEN}`,
                    'Accept': 'application/json'
                  }
                });
                const data = await response.json();

                res.statusCode = response.status;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify(data));
              } catch (err: any) {
                res.statusCode = 500;
                res.setHeader('Content-Type', 'application/json');
                res.end(JSON.stringify({ error: 'Local Delhivery Proxy Error', details: err.message }));
              }
            } else {
              next();
            }
          });
        }
      }
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/wp-json': {
          target: env.VITE_WC_URL || 'https://your-wordpress-site.com',
          changeOrigin: true,
          secure: false,
        }
      }
    },
  };
});
