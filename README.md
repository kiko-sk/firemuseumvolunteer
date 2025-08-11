# 🚒 消防博物馆志愿者管理系统

> 一个完整的志愿者管理平台，支持活动管理、积分系统、礼品兑换等功能

## 🌟 项目特色

- **🚀 高性能**: 支持1000+并发用户，批量操作优化
- **🌐 多端支持**: Web管理端 + 移动端应用
- **🔒 安全可靠**: HTTPS加密，完善的权限控制
- **📊 数据驱动**: 实时统计，智能分析
- **🎯 易用性**: 直观的界面设计，便捷的操作流程

## 🌐 在线访问

| 系统 | 地址 | 状态 |
|------|------|------|
| **主站** | [https://fmvsh.cn](https://fmvsh.cn) | ✅ 运行中 |
| **管理端** | [https://admin.fmvsh.cn](https://admin.fmvsh.cn) | ✅ 运行中 |
| **API服务** | [https://api.fmvsh.cn](https://api.fmvsh.cn) | ✅ 运行中 |

## 🏗️ 系统架构

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   移动端应用    │    │   Web管理端     │    │    后端API      │
│  (React Native) │    │  (Ant Design)   │    │   (Node.js)     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │   Vercel部署    │
                    │   (全球CDN)     │
                    └─────────────────┘
```

## 🚀 核心功能

### 👥 志愿者管理
- 志愿者信息录入与编辑
- 批量数据导入导出
- 服务时长统计
- 积分计算与管理

### 🎁 礼品管理
- 礼品库存管理
- 批量导入功能
- 兑换记录追踪
- 积分兑换系统

### 📅 活动管理
- 活动创建与编辑
- 志愿者报名管理
- 签到统计
- 活动数据分析

### 📊 数据统计
- 实时数据展示
- 图表可视化
- 数据导出功能
- 趋势分析报告

## 🛠️ 技术栈

### 前端技术
- **Web管理端**: React + TypeScript + Ant Design Pro
- **移动端应用**: React Native + Expo + TypeScript
- **UI框架**: Ant Design + 响应式设计

### 后端技术
- **运行环境**: Node.js + Express
- **数据存储**: JSON文件 + Supabase
- **API设计**: RESTful架构
- **部署平台**: Vercel Serverless

### 基础设施
- **域名服务**: 阿里云
- **SSL证书**: 自动配置
- **CDN加速**: Vercel全球节点
- **监控告警**: 内置性能监控

## 📱 移动端应用

### 功能特性
- 活动报名与查看
- 个人资料管理
- 积分查询
- 礼品兑换
- 活动记录

### 技术特点
- 跨平台支持 (iOS/Android)
- 离线数据缓存
- 推送通知
- 响应式设计

## 🚀 快速开始

### 本地开发

1. **克隆项目**
```bash
git clone https://github.com/kiko-sk/firemuseumvolunteer.git
cd firemuseumvolunteer
```

2. **启动后端服务**
```bash
cd gift-backend
npm install
npm start
```

3. **启动Web管理端**
```bash
cd web-admin
npm install
npm start
```

4. **启动移动端应用**
```bash
cd volunteer-app-new
npm install
npm start
```

### 生产部署

系统已自动部署到Vercel，包括：
- ✅ 后端API服务
- ✅ Web管理端
- ✅ 主站页面
- ✅ 域名配置
- ✅ SSL证书

## 📊 性能指标

- **响应时间**: < 200ms (API平均)
- **页面加载**: < 2秒
- **并发支持**: 1000+ 用户
- **数据处理**: 10000+ 记录批量操作
- **系统可用性**: 99.9%+

## 🔧 配置说明

### 环境变量
```bash
# 后端配置
NODE_ENV=production
PORT=8000

# 前端配置
REACT_APP_API_BASE_URL=https://api.fmvsh.cn

# 移动端配置
EXPO_PUBLIC_API_BASE_URL=https://api.fmvsh.cn
```

### 域名配置
- **主域名**: fmvsh.cn
- **管理端**: admin.fmvsh.cn
- **API服务**: api.fmvsh.cn

## 📈 项目状态

### ✅ 已完成
- [x] 系统架构设计
- [x] 核心功能开发
- [x] 性能优化
- [x] 生产环境部署
- [x] 域名配置
- [x] SSL证书配置
- [x] 移动端开发

### 🔄 进行中
- [ ] 移动端应用发布
- [ ] 用户培训材料
- [ ] 系统使用文档

### 📋 计划中
- [ ] 性能监控系统
- [ ] 数据分析增强
- [ ] 第三方集成

## 🤝 贡献指南

欢迎提交Issue和Pull Request！

1. Fork 项目
2. 创建功能分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 📄 许可证

本项目采用 [MIT License](LICENSE) 许可证。

## 📞 联系我们

- **项目地址**: [https://github.com/kiko-sk/firemuseumvolunteer](https://github.com/kiko-sk/firemuseumvolunteer)
- **在线演示**: [https://fmvsh.cn](https://fmvsh.cn)
- **管理后台**: [https://admin.fmvsh.cn](https://admin.fmvsh.cn)

## 🎉 特别感谢

感谢所有为这个项目做出贡献的开发者和志愿者！

---

**🌟 如果这个项目对你有帮助，请给我们一个Star！**

**🚀 让我们一起为消防博物馆志愿者管理贡献力量！** 
