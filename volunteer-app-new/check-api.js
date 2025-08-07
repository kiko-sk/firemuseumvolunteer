const fetch = require('node-fetch');

// 开发环境API
const devApis = [
  'http://10.0.5.56:8000/api/signup-list',
  'http://10.0.5.56:8000/api/points',
  'http://10.0.5.56:8000/api/gifts',
  'http://10.0.5.56:8000/api/volunteer-style',
  'http://10.0.5.56:8000/api/exchange',
  'http://10.0.5.56:8000/api/exchange-records',
  'http://10.0.5.56:8000/api/signup',
  'http://10.0.5.56:8000/api/leave',
];

// 生产环境API
const prodApis = [
  'https://api.fmvsh.cn/api/signup-list',
  'https://api.fmvsh.cn/api/points',
  'https://api.fmvsh.cn/api/gifts',
  'https://api.fmvsh.cn/api/volunteer-style',
  'https://api.fmvsh.cn/api/exchange',
  'https://api.fmvsh.cn/api/exchange-records',
  'https://api.fmvsh.cn/api/signup',
  'https://api.fmvsh.cn/api/leave',
];

// 选择要测试的API列表
const apis = process.env.NODE_ENV === 'production' ? prodApis : devApis;

(async () => {
  console.log(`测试 ${process.env.NODE_ENV || 'development'} 环境API...`);
  for (const url of apis) {
    try {
      const res = await fetch(url);
      console.log(`${url} -> ${res.status}`);
    } catch (e) {
      console.log(`${url} -> ERROR: ${e.message}`);
    }
  }
})(); 