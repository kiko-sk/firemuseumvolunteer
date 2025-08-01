# Fire Museum Volunteer App

消防博物馆志愿者管理系统

## 项目结构

```
2-firemuseumvolunteer/
├── gift-backend/          # 后端服务 (Node.js + Express)
├── web-admin/            # Web管理端 (Ant Design Pro)
├── volunteer-app-new/     # 移动端应用 (React Native + Expo)
└── README.md
```

## 技术栈

### 后端
- Node.js
- Express
- MongoDB (可选)

### Web管理端
- Ant Design Pro
- UmiJS
- TypeScript

### 移动端
- React Native
- Expo
- React Navigation
- AsyncStorage

## 快速开始

### 1. 启动后端服务
```bash
cd gift-backend
npm install
npm start
```

### 2. 启动Web管理端
```bash
cd web-admin
npm install
npm run dev
```

### 3. 启动移动端应用
```bash
cd volunteer-app-new
npm install
npx expo start
```

### 4. 测试应用
- Web端: 访问 http://localhost:8000
- 移动端: 使用 Expo Go 应用扫描二维码

## 功能特性

- 志愿者注册/登录
- 活动管理
- 签到功能
- 礼品兑换
- 个人中心
- 消息通知

## 部署指南

详细部署说明请参考：
- [快速部署指南](QUICK_DEPLOY.md)
- [完整部署文档](DEPLOYMENT.md)
- [Android部署指南](ANDROID_DEPLOY.md)

## 开发环境

- Node.js >= 16
- Expo CLI
- Expo Go App (手机端测试) 
