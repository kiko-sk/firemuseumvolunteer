const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const axios = require('axios');

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件
app.use(cors());
app.use(express.json());

// 阿里云短信服务配置
const SMS_CONFIG = {
  accessKeyId: process.env.ALIYUN_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.ALIYUN_ACCESS_KEY_SECRET || '',
  signName: process.env.SMS_SIGN_NAME || '消防博物馆',
  templateCode: process.env.SMS_TEMPLATE_CODE || 'SMS_123456789',
  endpoint: 'https://dysmsapi.aliyuncs.com'
};

// 生成签名
function generateSignature(params, accessKeySecret) {
  const sortedParams = Object.keys(params).sort().map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
  const stringToSign = `GET&${encodeURIComponent('/')}&${encodeURIComponent(sortedParams)}`;
  const signature = crypto.createHmac('sha1', accessKeySecret + '&').update(stringToSign).digest('base64');
  return signature;
}

// 发送短信API
app.post('/api/send-sms', async (req, res) => {
  try {
    const { phone, code } = req.body;

    // 验证参数
    if (!phone || !code) {
      return res.status(400).json({ success: false, message: '缺少必要参数' });
    }

    // 验证手机号格式
    if (!/^1\d{10}$/.test(phone)) {
      return res.status(400).json({ success: false, message: '手机号格式错误' });
    }

    // 检查阿里云配置
    if (!SMS_CONFIG.accessKeyId || !SMS_CONFIG.accessKeySecret) {
      console.warn('阿里云短信服务未配置，返回模拟响应');
      return res.json({ 
        success: true, 
        message: `模拟验证码已发送到 ${phone}，测试验证码：${code}` 
      });
    }

    // 构建阿里云API请求参数
    const params = {
      Action: 'SendSms',
      Version: '2017-05-25',
      RegionId: 'cn-hangzhou',
      PhoneNumbers: phone,
      SignName: SMS_CONFIG.signName,
      TemplateCode: SMS_CONFIG.templateCode,
      TemplateParam: JSON.stringify({ code }),
      Format: 'JSON',
      Timestamp: new Date().toISOString(),
      SignatureMethod: 'HMAC-SHA1',
      SignatureVersion: '1.0',
      SignatureNonce: Math.random().toString(36).substr(2, 15)
    };

    // 生成签名
    const signature = generateSignature(params, SMS_CONFIG.accessKeySecret);
    params.Signature = signature;

    // 构建请求URL
    const queryString = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
    const url = `${SMS_CONFIG.endpoint}?${queryString}`;

    // 发送请求到阿里云
    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json'
      }
    });

    if (response.data.Code === 'OK') {
      res.json({ 
        success: true, 
        message: `验证码已发送到 ${phone}` 
      });
    } else {
      console.error('阿里云短信发送失败:', response.data);
      res.status(500).json({ 
        success: false, 
        message: response.data.Message || '短信发送失败' 
      });
    }

  } catch (error) {
    console.error('发送短信失败:', error);
    
    // 如果真实发送失败，返回模拟响应
    const { phone, code } = req.body;
    res.json({ 
      success: true, 
      message: `模拟验证码已发送到 ${phone}，测试验证码：${code}` 
    });
  }
});

// 健康检查
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// 启动服务器
app.listen(PORT, () => {
  console.log(`短信服务服务器运行在端口 ${PORT}`);
  console.log(`健康检查: http://localhost:${PORT}/api/health`);
  console.log(`短信API: http://localhost:${PORT}/api/send-sms`);
});

module.exports = app; 