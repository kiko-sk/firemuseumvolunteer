# 📱 Android App 部署指南

## 🎯 目标
- 构建Android APK文件
- 发布到Google Play Store (可选)
- 提供APK直接下载

## 🚀 快速部署步骤

### 1. 注册Expo账户
1. 访问 [Expo](https://expo.dev)
2. 注册免费账户
3. 记住用户名和密码

### 2. 登录EAS CLI
```bash
cd volunteer-app-new
eas login
# 输入你的Expo账户信息
```

### 3. 配置项目
```bash
eas build:configure
# 选择 Android 平台
```

### 4. 构建Android APK
```bash
# 构建预览版本 (APK文件)
eas build --platform android --profile preview

# 或构建生产版本 (AAB文件，用于Google Play)
eas build --platform android --profile production
```

### 5. 下载APK
构建完成后：
1. 在Expo控制台找到构建结果
2. 下载APK文件
3. 可以直接分发给用户安装

## 📋 发布选项

### 选项1: 直接分发APK
- 构建完成后下载APK文件
- 通过邮件、网盘等方式分发给用户
- 用户需要开启"未知来源"安装权限

### 选项2: Google Play Store (推荐)
- 需要Google Play开发者账户 ($25一次性费用)
- 上传AAB文件到Google Play Console
- 用户可以从Google Play下载

### 选项3: 内部测试
- 使用Expo的内部测试功能
- 生成测试链接，用户扫码安装

## 🔧 配置说明

当前配置已优化为Android专用：
- 移除了iOS相关配置
- 设置Android构建类型为APK/AAB
- 简化了构建流程

## 📞 需要帮助？

如果在构建过程中遇到问题：
1. 检查网络连接
2. 确认Expo账户登录状态
3. 查看构建日志中的错误信息

---
*iOS版本可以在Apple开发者账户问题解决后重新配置* 