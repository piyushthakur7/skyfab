process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const WC_URL = 'https://skyfab.co.in';
const KEY = 'ck_9e6aac429281cccdc1ef2c2c2f6ef78718a36450';
const SECRET = 'cs_3c077e931525dfd4173be842503d97917e1b909d';

async function testCategories() {
  try {
    // Test 1: Check if WP REST API is available
    console.log('=== TEST 1: WP REST API Root ===');
    const rootRes = await fetch(`${WC_URL}/wp-json/`, { headers: { 'Accept': 'application/json' } });
    console.log('Root Status:', rootRes.status);
    console.log('Root Content-Type:', rootRes.headers.get('content-type'));
    const rootText = await rootRes.text();
    const isJson = rootText.trim().startsWith('{') || rootText.trim().startsWith('[');
    console.log('Is JSON?', isJson);
    if (!isJson) {
      console.log('Response starts with:', rootText.substring(0, 200));
      console.log('\n>>> The WordPress REST API is returning HTML instead of JSON.');
      console.log('>>> This likely means the WP REST API is disabled, or the domain has a redirect/parking page.\n');
    }

    // Test 2: WC Categories
    console.log('\n=== TEST 2: WC Categories Endpoint ===');
    const catUrl = `${WC_URL}/wp-json/wc/v3/products/categories?consumer_key=${KEY}&consumer_secret=${SECRET}&per_page=100`;
    const catRes = await fetch(catUrl, { headers: { 'Accept': 'application/json' } });
    console.log('Status:', catRes.status);
    console.log('Content-Type:', catRes.headers.get('content-type'));
    const catText = await catRes.text();
    const catIsJson = catText.trim().startsWith('{') || catText.trim().startsWith('[');
    console.log('Is JSON?', catIsJson);

    if (catIsJson) {
      const data = JSON.parse(catText);
      console.log('\n>>> SUCCESS! Categories fetched:', data.length);
      const parents = data.filter(c => c.parent === 0);
      for (const p of parents) {
        const subs = data.filter(c => c.parent === p.id);
        console.log(`  ${p.name} (${p.count} products)${subs.length ? ` -> ${subs.map(s=>s.name).join(', ')}` : ''}`);
      }
    } else {
      console.log('Response (first 300 chars):', catText.substring(0, 300));
      console.log('\n>>> FAIL: Categories endpoint is NOT returning JSON.');
      console.log('>>> The WooCommerce REST API is not accessible on this domain.');
    }

  } catch (err) {
    console.error('Error:', err.message);
  }
}

testCategories();
