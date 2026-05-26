import fs from 'fs';

async function run() {
  const res = await fetch('https://seagreen-boar-119602.hostingersite.com/wp-json/wp/v2/media?parent=57');
  const data = await res.json();
  fs.writeFileSync('test-media.json', JSON.stringify(data, null, 2), 'utf-8');
}
run();
