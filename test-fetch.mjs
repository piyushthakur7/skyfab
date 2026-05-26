import fs from 'fs';

async function run() {
  const res = await fetch('https://seagreen-boar-119602.hostingersite.com/wp-json/wc/v3/products?consumer_key=ck_5f78a8d77f8c1fbb9707c9a448c7220b7af232f6&consumer_secret=cs_93f9b910b29336bfa3312f2b0fba72a185cdf57c&per_page=1');
  const data = await res.json();
  fs.writeFileSync('test-product.json', JSON.stringify(data, null, 2), 'utf-8');
}
run();
