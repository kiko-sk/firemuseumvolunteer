const fetch = require('node-fetch');

const apis = [
  'http://10.0.5.56:8000/api/signup-list',
  'http://10.0.5.56:8000/api/points',
  'http://10.0.5.56:8000/api/gifts',
  'http://10.0.5.56:8000/api/volunteer-style',
  'http://10.0.5.56:8000/api/exchange',
  'http://10.0.5.56:8000/api/exchange-records',
  'http://10.0.5.56:8000/api/signup',
  'http://10.0.5.56:8000/api/leave',
  // 如有更多接口可继续补充
];

(async () => {
  for (const url of apis) {
    try {
      const res = await fetch(url);
      console.log(`${url} -> ${res.status}`);
    } catch (e) {
      console.log(`${url} -> ERROR: ${e.message}`);
    }
  }
})(); 