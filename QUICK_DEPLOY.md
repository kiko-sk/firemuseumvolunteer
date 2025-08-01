# 🚀 快速上线指南 (5分钟完成)

## ✅ 当前状态
- ✅ 后端API已完善并测试通过
- ✅ Web管理端已构建成功
- ✅ App配置已就绪
- ✅ 部署脚本已准备

## 🌐 立即上线步骤

### 1. 后端上线 (2分钟)
1. 访问 [Vercel](https://vercel.com)
2. 点击 "New Project"
3. 导入你的GitHub仓库: `kiko-sk/firemuseumvolunteer`
4. 选择 `gift-backend` 目录
5. 点击 "Deploy"
6. 复制生成的URL (如: `https://your-backend.vercel.app`)

### 2. Web管理端上线 (2分钟)
1. 在Vercel中再次点击 "New Project"
2. 选择同一个GitHub仓库
3. 选择 `web-admin` 目录
4. 构建命令: `npm run build`
5. 输出目录: `dist`
6. 点击 "Deploy"

### 3. App发布 (1分钟)
```bash
# 安装EAS CLI
npm install -g @expo/eas-cli

# 登录Expo
eas login

# 构建App
cd volunteer-app-new
eas build --platform all --profile production
```

## 🔗 获取的URL
- 后端API: `https://your-backend.vercel.app`
- Web管理端: `https://your-admin.vercel.app`
- App下载: Expo应用商店

## 📱 测试上线
1. 访问Web管理端，测试登录功能
2. 下载App，测试志愿者功能
3. 确认所有API调用正常

## 🎉 完成！
你的消防博物馆志愿者系统已成功上线！

---
*详细部署文档请参考: DEPLOYMENT.md* 