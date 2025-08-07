# 🚀 快速部署指南 - fmvsh.cn

## 📋 项目状态
- ✅ 域名配置已完成: `https://fmvsh.cn/`
- ✅ 代码已同步到最新版本
- ✅ 安全漏洞已修复
- ✅ 生产环境配置已就绪

## 🌐 立即部署步骤

### 第一步：后端API部署 (2分钟)

1. **访问 Vercel**
   - 打开 [Vercel](https://vercel.com)
   - 使用GitHub账号登录

2. **创建新项目**
   - 点击 "New Project"
   - 导入仓库: `kiko-sk/firemuseumvolunteer`
   - 选择 `gift-backend` 目录

3. **配置项目**
   - 项目名称: `fmvsh-api`
   - 构建命令: `npm install && npm start`
   - 输出目录: 留空
   - 环境变量: `NODE_ENV=production`

4. **部署**
   - 点击 "Deploy"
   - 等待部署完成
   - 复制生成的域名 (如: `fmvsh-api.vercel.app`)

### 第二步：Web管理端部署 (2分钟)

1. **再次创建项目**
   - 在Vercel中点击 "New Project"
   - 选择同一个仓库
   - 选择 `web-admin` 目录

2. **配置项目**
   - 项目名称: `fmvsh-admin`
   - 构建命令: `npm install && npm run build`
   - 输出目录: `dist`
   - 环境变量: `REACT_APP_API_BASE_URL=https://api.fmvsh.cn`

3. **部署**
   - 点击 "Deploy"
   - 等待构建完成
   - 复制生成的域名 (如: `fmvsh-admin.vercel.app`)

### 第三步：域名解析配置 (3分钟)

在阿里云控制台中配置域名解析：

1. **登录阿里云控制台**
   - 访问 [阿里云域名控制台](https://dc.console.aliyun.com/)
   - 找到域名 `fmvsh.cn`

2. **添加解析记录**

   **API服务记录:**
   ```
   记录类型: CNAME
   主机记录: api
   记录值: [后端域名].vercel.app
   TTL: 600
   ```

   **管理后台记录:**
   ```
   记录类型: CNAME
   主机记录: admin
   记录值: [管理端域名].vercel.app
   TTL: 600
   ```

   **主站记录:**
   ```
   记录类型: A
   主机记录: @
   记录值: [Vercel分配的IP地址]
   TTL: 600
   ```

### 第四步：移动端App构建 (3分钟)

1. **安装EAS CLI**
   ```bash
   npm install -g @expo/eas-cli
   ```

2. **登录Expo**
   ```bash
   eas login
   ```

3. **配置项目**
   ```bash
   cd volunteer-app-new
   eas build:configure
   ```

4. **构建生产版本**
   ```bash
   # 构建iOS版本
   eas build --platform ios --profile production
   
   # 构建Android版本
   eas build --platform android --profile production
   ```

## 🔗 最终访问地址

部署完成后，您将拥有以下地址：

- **主站**: https://fmvsh.cn
- **API服务**: https://api.fmvsh.cn
- **管理后台**: https://admin.fmvsh.cn
- **移动端App**: 通过Expo应用商店下载

## 🧪 测试验证

### 1. 测试API服务
```bash
curl https://api.fmvsh.cn/api/gifts
```

### 2. 测试管理后台
- 访问 https://admin.fmvsh.cn
- 测试登录功能
- 验证所有管理功能

### 3. 测试移动端App
- 下载并安装App
- 测试志愿者功能
- 验证API调用

## 🚨 重要提醒

### 1. DNS传播时间
- 域名解析可能需要5-30分钟生效
- 如果无法访问，请稍后重试

### 2. HTTPS证书
- 阿里云会自动提供SSL证书
- 确保所有访问都使用HTTPS

### 3. 环境变量
- 确保生产环境变量正确配置
- 不要将敏感信息提交到代码仓库

## 📞 技术支持

如果遇到问题：

1. **检查Vercel部署状态**
   - 登录Vercel控制台
   - 查看部署日志

2. **检查域名解析**
   - 使用 `nslookup api.fmvsh.cn` 测试
   - 确认解析记录正确

3. **检查API服务**
   - 测试API端点是否响应
   - 查看Vercel函数日志

## 🎉 部署完成

恭喜！您的消防博物馆志愿者系统已成功部署到生产环境：

- ✅ 后端API服务正常运行
- ✅ Web管理端可访问
- ✅ 域名解析配置完成
- ✅ 移动端App可构建

现在您可以开始使用完整的志愿者管理系统了！

---

**相关文档:**
- 详细部署指南: [DEPLOYMENT.md](./DEPLOYMENT.md)
- 域名配置说明: [DOMAIN_CONFIG.md](./DOMAIN_CONFIG.md)
- 项目文档: [README.md](./README.md)
