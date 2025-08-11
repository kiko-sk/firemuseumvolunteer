# 🔧 Vercel项目配置备份

## 📅 备份时间
**2024年8月8日** - 重新部署前配置备份

## 🌐 项目信息

### 项目名称
- **后端API**: firemuseumvolunteer (gift-backend)
- **Web管理端**: web-admin (需要重新创建)
- **主站**: fmvsh.cn (需要重新配置)

## 🔑 域名配置

### 当前域名设置
| 域名 | 类型 | 状态 | 说明 |
|------|------|------|------|
| `api.fmvsh.cn` | 自定义域名 | ✅ 已配置 | 后端API服务 |
| `admin.fmvsh.cn` | 自定义域名 | ✅ 已配置 | Web管理端 |
| `fmvsh.cn` | 主域名 | ✅ 已配置 | 主站页面 |

### DNS记录 (阿里云)
```
api.fmvsh.cn -> Vercel CNAME
admin.fmvsh.cn -> Vercel CNAME  
fmvsh.cn -> Vercel CNAME
```

## ⚙️ 环境变量配置

### 后端环境变量
```bash
NODE_ENV=production
PORT=8000
```

### 前端环境变量
```bash
REACT_APP_API_BASE_URL=https://api.fmvsh.cn
```

## 🏗️ 构建配置

### 后端构建设置
- **框架预设**: Node.js
- **构建命令**: `npm start`
- **输出目录**: 默认
- **安装命令**: `npm install`

### Web管理端构建设置
- **框架预设**: Create React App
- **构建命令**: `npm run build`
- **输出目录**: `dist`
- **安装命令**: `npm install`

## 📁 项目结构

### 后端项目 (gift-backend)
```
gift-backend/
├── package.json
├── server.js
├── api/
│   ├── gifts.js
│   ├── activities.js
│   ├── volunteer-style.js
│   ├── signup-list.js
│   └── points.js
└── data/
    ├── gifts.json
    ├── activities.json
    └── volunteers.json
```

### Web管理端 (web-admin)
```
web-admin/
├── package.json
├── .umirc.ts
├── src/
│   ├── pages/
│   ├── components/
│   └── utils/
└── dist/ (构建输出)
```

## 🔄 重新部署步骤

### 1. 删除现有项目
- 在Vercel控制台删除 `firemuseumvolunteer` 项目
- 确认删除操作

### 2. 重新创建后端项目
- 导入GitHub仓库
- 选择 `gift-backend` 目录
- 配置项目名称：`firemuseumvolunteer`
- 设置环境变量

### 3. 重新创建Web管理端项目
- 导入GitHub仓库
- 选择 `web-admin` 目录
- 配置项目名称：`web-admin-fmvsh`
- 设置构建命令和输出目录

### 4. 重新配置域名
- 为后端项目配置 `api.fmvsh.cn`
- 为Web管理端配置 `admin.fmvsh.cn`
- 验证DNS解析

## ⚠️ 注意事项

1. **数据安全**: 重新部署不会丢失JSON数据文件
2. **域名配置**: 需要重新配置所有自定义域名
3. **SSL证书**: Vercel会自动配置SSL证书
4. **环境变量**: 需要重新设置所有环境变量
5. **构建配置**: 确保构建命令和输出目录正确

## 📞 验证清单

重新部署后请验证：
- [ ] 后端API所有端点正常响应
- [ ] Web管理端页面正常加载
- [ ] 域名解析正确
- [ ] SSL证书有效
- [ ] 数据导入导出功能正常
- [ ] 所有页面功能可用

---

**备份完成时间**: 2024年8月8日  
**备份状态**: ✅ 完成  
**下一步**: 执行删除和重新导入操作
