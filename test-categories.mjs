process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

const WC_URL = 'https://seagreen-boar-119602.hostingersite.com';
const KEY = 'ck_5f78a8d77f8c1fbb9707c9a448c7220b7af232f6';
const SECRET = 'cs_93f9b910b29336bfa3312f2b0fba72a185cdf57c';

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
      for (const cat of data) {
        console.log(`ID: ${cat.id} | Slug: ${cat.slug} | Name: ${cat.name} | Parent: ${cat.parent} | Count: ${cat.count}`);
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
