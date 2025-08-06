# 短信验证码服务配置指南

## 概述

本项目支持真实的短信验证码功能，使用阿里云短信服务。如果未配置阿里云服务，系统会自动回退到模拟验证码模式。

## 当前状态

### 模拟模式（默认）
- 验证码显示在页面上
- 无需配置任何服务
- 适合开发和测试

### 真实短信模式
- 需要配置阿里云短信服务
- 验证码发送到真实手机号
- 适合生产环境

## 配置真实短信服务

### 1. 注册阿里云账号
1. 访问 [阿里云官网](https://www.aliyun.com/)
2. 注册并登录账号
3. 开通短信服务

### 2. 获取AccessKey
1. 登录阿里云控制台
2. 进入"AccessKey管理"
3. 创建AccessKey ID和AccessKey Secret
4. 保存好这些信息

### 3. 配置短信签名和模板
1. 进入短信服务控制台
2. 申请短信签名（如：消防博物馆）
3. 申请短信模板（如：您的验证码是${code}，5分钟内有效）
4. 记录签名名称和模板代码

### 4. 配置环境变量

#### 方法1：创建.env文件
```bash
# 复制示例文件
cp env.example .env

# 编辑.env文件，填入你的配置
ALIYUN_ACCESS_KEY_ID=你的AccessKeyID
ALIYUN_ACCESS_KEY_SECRET=你的AccessKeySecret
SMS_SIGN_NAME=你的短信签名
SMS_TEMPLATE_CODE=你的模板代码
```

#### 方法2：直接在代码中配置
编辑 `src/services/sms.ts` 文件：
```typescript
const SMS_CONFIG = {
  accessKeyId: '你的AccessKeyID',
  accessKeySecret: '你的AccessKeySecret',
  signName: '你的短信签名',
  templateCode: '你的模板代码',
  endpoint: 'https://dysmsapi.aliyuncs.com'
};
```

### 5. 启动后端服务

#### 安装依赖
```bash
# 安装后端依赖
npm install express cors axios

# 或者使用提供的package.json
cp package-server.json package.json
npm install
```

#### 启动服务
```bash
# 开发模式
npm run dev

# 生产模式
npm start
```

服务将在 `http://localhost:3001` 启动

### 6. 配置前端API地址

编辑 `src/services/sms.ts` 文件，确保API地址正确：
```typescript
const response = await fetch('http://localhost:3001/api/send-sms', {
  // ... 配置
});
```

## 测试验证码功能

### 1. 启动服务
```bash
# 启动后端服务
npm start

# 启动前端服务
npm run dev
```

### 2. 测试流程
1. 访问登录页面
2. 点击"找回密码"
3. 输入已注册的手机号
4. 点击"获取验证码"
5. 查看控制台或手机收到的验证码
6. 输入验证码完成密码重置

## 安全注意事项

### 1. 环境变量安全
- 不要将AccessKey提交到代码仓库
- 使用.env文件管理敏感信息
- 在生产环境中使用环境变量

### 2. 短信发送限制
- 设置发送频率限制
- 验证码有效期设置
- 防止恶意攻击

### 3. 验证码存储
- 验证码应存储在后端数据库
- 设置合理的过期时间
- 使用后立即清除

## 故障排除

### 1. 验证码发送失败
- 检查AccessKey配置
- 确认短信签名和模板已审核通过
- 查看阿里云控制台错误信息

### 2. 前端无法连接后端
- 确认后端服务已启动
- 检查CORS配置
- 验证API地址正确

### 3. 模拟模式不工作
- 检查浏览器控制台错误
- 确认localStorage可用
- 验证代码逻辑正确

## 部署到生产环境

### 1. 服务器配置
- 部署后端服务到服务器
- 配置域名和HTTPS
- 设置环境变量

### 2. 前端配置
- 更新API地址为生产环境地址
- 配置环境变量
- 测试短信功能

### 3. 监控和日志
- 设置短信发送监控
- 记录错误日志
- 监控API调用频率

## 支持的服务商

目前支持以下短信服务商：
- 阿里云短信服务（推荐）
- 腾讯云短信服务（可扩展）
- 云片短信服务（可扩展）

如需支持其他服务商，请修改 `server.js` 中的发送逻辑。 