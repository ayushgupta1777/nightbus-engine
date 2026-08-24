// ==================== server/check-prod-queries.js ====================
const https = require('https');

function checkUrl(urlStr) {
  return new Promise((resolve) => {
    https.get(urlStr, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, count: json.locations ? json.locations.length : 0, first3: (json.locations || []).slice(0, 3).map(l => l.name) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data.slice(0, 100) });
        }
      });
    }).on('error', (err) => {
      resolve({ error: err.message });
    });
  });
}

async function checkProdQueries() {
  const words = ['Jabalpur', 'katni', 'Katni', 'satna', 'Satna', 'delhi', 'Delhi', 'kat', 'jab', 'bus'];
  for (const w of words) {
    const res = await checkUrl(`https://server.nightbusjourney.com/api/locations/search?query=${encodeURIComponent(w)}`);
    console.log(`[PROD SEARCH] "${w}":`, res);
  }
}

checkProdQueries();
