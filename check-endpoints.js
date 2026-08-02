// ==================== server/check-endpoints.js ====================
const http = require('http');
const https = require('https');

function checkUrl(urlStr) {
  return new Promise((resolve) => {
    const proto = urlStr.startsWith('https') ? https : http;
    proto.get(urlStr, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        resolve({ status: res.statusCode, body: data.slice(0, 300) });
      });
    }).on('error', (err) => {
      resolve({ error: err.message });
    });
  });
}

async function runChecks() {
  console.log('Checking remote prod server:');
  const prodRes = await checkUrl('https://server.nightbusjourney.com/api/locations/search?query=Jabalpur');
  console.log('  PROD RESULT:', prodRes);

  console.log('Checking local server:');
  const localRes = await checkUrl('http://localhost:5000/api/locations/search?query=Jabalpur');
  console.log('  LOCAL RESULT:', localRes);
}

runChecks();
