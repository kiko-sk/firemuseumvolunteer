# 🚀 消防博物馆志愿者系统 - 正式上线指南

## 📋 项目概述

本项目包含三个主要组件：
- **后端服务** (gift-backend): Node.js + Express API
- **Web管理端** (web-admin): Ant Design Pro 管理后台
- **移动端App** (volunteer-app-new): React Native + Expo

## 🎯 上线目标

1. 后端API服务上线到云端
2. Web管理端部署到CDN
3. 移动端App发布到应用商店

---

## 🌐 第一步：后端服务上线 (Vercel)

### 1.1 准备工作
```bash
# 确保后端代码已提交到GitHub
cd gift-backend
git add .
git commit -m "Prepare for production deployment"
git push origin main
```

### 1.2 部署到Vercel
1. 访问 [Vercel](https://vercel.com) 并登录
2. 点击 "New Project"
3. 导入你的GitHub仓库
4. 选择 `gift-backend` 目录
5. 配置环境变量（如需要）：
   - `NODE_ENV=production`
6. 点击 "Deploy"

### 1.3 获取生产环境API地址
部署完成后，你会得到一个类似 `https://your-backend.vercel.app` 的地址。

---

## 💻 第二步：Web管理端上线 (Vercel)

### 2.1 更新API地址
在 `web-admin/src` 目录下找到API配置文件，将后端地址更新为生产环境地址。

### 2.2 构建和部署
```bash
cd web-admin
npm install
npm run build
```

### 2.3 部署到Vercel
1. 在Vercel中创建新项目
2. 选择 `web-admin` 目录
3. 构建命令：`npm run build`
4. 输出目录：`dist`
5. 点击 "Deploy"

---

## 📱 第三步：移动端App上线 (EAS)

### 3.1 安装EAS CLI
```bash
npm install -g @expo/eas-cli
```

### 3.2 登录Expo账户
```bash
eas login
```

### 3.3 配置项目
```bash
cd volunteer-app-new
eas build:configure
```

### 3.4 更新API地址
将App中的API地址更新为生产环境地址。

### 3.5 构建生产版本
```bash
# iOS版本
eas build --platform ios --profile production

# Android版本
eas build --platform android --profile production
```

### 3.6 提交到应用商店
```bash
# iOS App Store
eas submit --platform ios

# Google Play Store
eas submit --platform android
```

---

## 🔧 环境配置

### 生产环境变量
```bash
# 后端环境变量
NODE_ENV=production
PORT=8000

# 前端环境变量
REACT_APP_API_BASE_URL=https://api.fmvsh.cn
```

### 域名配置
已配置正式域名：
- **主域名**: `https://fmvsh.cn/`
- **后端API**: `https://api.fmvsh.cn`
- **Web管理端**: `https://admin.fmvsh.cn`

---

## 📊 监控和维护

### 1. 性能监控
- 使用Vercel Analytics监控Web端性能
- 使用Expo Analytics监控App使用情况

### 2. 错误监控
- 集成Sentry进行错误追踪
- 设置告警通知

### 3. 数据备份
- 定期备份JSON数据文件
- 考虑迁移到MongoDB Atlas

---

## 🚨 上线检查清单

### 后端检查
- [ ] API所有接口正常工作
- [ ] 跨域配置正确
- [ ] 错误处理完善
- [ ] 数据文件权限正确

### Web端检查
- [ ] 页面加载正常
- [ ] 所有功能可用
- [ ] 响应式设计正常
- [ ] API调用成功

### App端检查
- [ ] 应用启动正常
- [ ] 所有页面可访问
- [ ] 定位功能正常
- [ ] 推送通知配置

---

## 📞 技术支持

如遇到部署问题，请检查：
1. 网络连接是否正常
2. 环境变量是否正确配置
3. 依赖包是否完整安装
4. 构建日志是否有错误

---

## 🎉 上线完成

恭喜！你的消防博物馆志愿者系统已成功上线：

- **主域名**: https://fmvsh.cn/
- **后端API**: https://api.fmvsh.cn
- **Web管理端**: https://admin.fmvsh.cn
- **移动端App**: 应用商店搜索"消防博物馆志愿者"

记得定期更新和维护系统！ 