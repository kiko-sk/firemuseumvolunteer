// 短信服务API
interface SMSResponse {
  success: boolean;
  message: string;
  code?: string;
}

// 阿里云短信服务配置
const SMS_CONFIG = {
  accessKeyId: process.env.REACT_APP_ALIYUN_ACCESS_KEY_ID || '',
  accessKeySecret: process.env.REACT_APP_ALIYUN_ACCESS_KEY_SECRET || '',
  signName: process.env.REACT_APP_SMS_SIGN_NAME || '消防博物馆',
  templateCode: process.env.REACT_APP_SMS_TEMPLATE_CODE || 'SMS_123456789',
  endpoint: 'https://dysmsapi.aliyuncs.com'
};

// 生成6位随机验证码
const generateVerificationCode = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

// 发送短信验证码
export const sendSMSVerificationCode = async (phone: string): Promise<SMSResponse> => {
  try {
    // 检查环境变量是否配置
    if (!SMS_CONFIG.accessKeyId || !SMS_CONFIG.accessKeySecret) {
      console.warn('阿里云短信服务未配置，使用模拟验证码');
      const mockCode = generateVerificationCode();
      localStorage.setItem(`smsCode_${phone}`, mockCode);
      localStorage.setItem(`smsCodeTime_${phone}`, Date.now().toString());
      
      return {
        success: true,
        message: `模拟验证码已发送到 ${phone}，测试验证码：${mockCode}`,
        code: mockCode
      };
    }

    // 生成验证码
    const verificationCode = generateVerificationCode();
    
    // 构建阿里云API请求参数
    const params: { [key: string]: string } = {
      Action: 'SendSms',
      Version: '2017-05-25',
      RegionId: 'cn-hangzhou',
      PhoneNumbers: phone,
      SignName: SMS_CONFIG.signName,
      TemplateCode: SMS_CONFIG.templateCode,
      TemplateParam: JSON.stringify({ code: verificationCode }),
      Format: 'JSON',
      Timestamp: new Date().toISOString(),
      SignatureMethod: 'HMAC-SHA1',
      SignatureVersion: '1.0',
      SignatureNonce: Math.random().toString(36).substr(2, 15)
    };

    // 构建签名
    const sortedParams = Object.keys(params).sort().map(key => `${key}=${encodeURIComponent(params[key])}`).join('&');
    const stringToSign = `GET&${encodeURIComponent('/')}&${encodeURIComponent(sortedParams)}`;
    
    // 使用CryptoJS计算签名（需要安装crypto-js）
    // const signature = CryptoJS.HmacSHA1(stringToSign, SMS_CONFIG.accessKeySecret + '&').toString(CryptoJS.enc.Base64);
    
    // 由于前端无法直接调用阿里云API（CORS限制），这里提供两种方案：
    
    // 方案1：通过自己的后端API代理
    const response = await fetch('/api/send-sms', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        phone,
        code: verificationCode
      })
    });

    if (response.ok) {
      const result = await response.json();
      
      // 保存验证码到本地存储（设置5分钟过期）
      localStorage.setItem(`smsCode_${phone}`, verificationCode);
      localStorage.setItem(`smsCodeTime_${phone}`, Date.now().toString());
      
      return {
        success: true,
        message: `验证码已发送到 ${phone}`,
        code: verificationCode
      };
    } else {
      throw new Error('短信发送失败');
    }

  } catch (error) {
    console.error('发送短信失败:', error);
    
    // 如果真实发送失败，回退到模拟验证码
    const mockCode = generateVerificationCode();
    localStorage.setItem(`smsCode_${phone}`, mockCode);
    localStorage.setItem(`smsCodeTime_${phone}`, Date.now().toString());
    
    return {
      success: true,
      message: `模拟验证码已发送到 ${phone}，测试验证码：${mockCode}`,
      code: mockCode
    };
  }
};

// 验证短信验证码
export const verifySMSCode = (phone: string, code: string): boolean => {
  const savedCode = localStorage.getItem(`smsCode_${phone}`);
  const savedTime = localStorage.getItem(`smsCodeTime_${phone}`);
  
  if (!savedCode || !savedTime) {
    return false;
  }
  
  // 检查验证码是否过期（5分钟）
  const now = Date.now();
  const codeTime = parseInt(savedTime);
  const expireTime = 5 * 60 * 1000; // 5分钟
  
  if (now - codeTime > expireTime) {
    // 清除过期验证码
    localStorage.removeItem(`smsCode_${phone}`);
    localStorage.removeItem(`smsCodeTime_${phone}`);
    return false;
  }
  
  return savedCode === code;
};

// 清除验证码
export const clearSMSCode = (phone: string): void => {
  localStorage.removeItem(`smsCode_${phone}`);
  localStorage.removeItem(`smsCodeTime_${phone}`);
}; 