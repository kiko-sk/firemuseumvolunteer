# 🌐 域名配置说明

## 📋 当前域名配置

### 主域名
- **正式域名**: `https://fmvsh.cn/`
- **状态**: ✅ 已配置

### 子域名规划
- **API服务**: `https://api.fmvsh.cn`
- **管理后台**: `https://admin.fmvsh.cn`
- **主站**: `https://fmvsh.cn`

## 🔧 配置步骤

### 1. 阿里云域名解析配置

在阿里云控制台中为域名 `fmvsh.cn` 添加以下解析记录：

#### A记录 (用于主站)
```
记录类型: A
主机记录: @
记录值: [Vercel分配的IP地址]
TTL: 600
```

#### CNAME记录 (用于API服务)
```
记录类型: CNAME
主机记录: api
记录值: [后端服务域名].vercel.app
TTL: 600
```

#### CNAME记录 (用于管理后台)
```
记录类型: CNAME
主机记录: admin
记录值: [Web管理端域名].vercel.app
TTL: 600
```

### 2. Vercel项目配置

#### 后端API项目
1. 在Vercel中部署 `gift-backend` 目录
2. 获取分配的域名 (如: `your-backend.vercel.app`)
3. 在阿里云中添加CNAME记录指向此域名

#### Web管理端项目
1. 在Vercel中部署 `web-admin` 目录
2. 获取分配的域名 (如: `your-admin.vercel.app`)
3. 在阿里云中添加CNAME记录指向此域名

### 3. SSL证书配置

阿里云会自动为域名提供SSL证书，确保HTTPS访问正常。

## 📱 移动端App配置

### 环境变量配置
```bash
# 生产环境
EXPO_PUBLIC_API_BASE_URL=https://api.fmvsh.cn

# 开发环境 (可选)
EXPO_PUBLIC_API_BASE_URL=http://10.0.2.2:8000
```

### 代码中的域名检测
App会自动检测环境：
- 开发环境: 使用本地IP地址
- 生产环境: 使用 `https://api.fmvsh.cn`

## 🔍 测试验证

### 1. 域名解析测试
```bash
# 测试主域名
curl -I https://fmvsh.cn

# 测试API域名
curl -I https://api.fmvsh.cn/api/gifts

# 测试管理后台
curl -I https://admin.fmvsh.cn
```

### 2. API功能测试
```bash
# 测试礼品接口
curl https://api.fmvsh.cn/api/gifts

# 测试积分接口
curl https://api.fmvsh.cn/api/points
```

### 3. 移动端App测试
1. 构建生产版本App
2. 安装到设备
3. 测试所有API调用是否正常

## 🚨 注意事项

### 1. DNS传播时间
- 域名解析可能需要几分钟到几小时生效
- 建议在配置后等待一段时间再测试

### 2. HTTPS证书
- 确保所有子域名都支持HTTPS
- 检查证书是否自动续期

### 3. 跨域配置
- 确保后端API配置了正确的CORS设置
- 允许来自 `https://fmvsh.cn` 和 `https://admin.fmvsh.cn` 的请求

### 4. 环境变量
- 生产环境使用环境变量管理敏感信息
- 不要在代码中硬编码API密钥

## 📞 故障排除

### 常见问题

1. **域名无法访问**
   - 检查DNS解析是否正确
   - 确认Vercel项目是否正常运行

2. **HTTPS证书错误**
   - 检查阿里云SSL证书状态
   - 确认域名解析指向正确地址

3. **API调用失败**
   - 检查CORS配置
   - 确认API服务正常运行

4. **移动端App无法连接**
   - 检查网络连接
   - 确认API域名配置正确

## 🎉 配置完成

完成以上配置后，您的消防博物馆志愿者系统将拥有完整的域名体系：

- **主站**: https://fmvsh.cn
- **API服务**: https://api.fmvsh.cn
- **管理后台**: https://admin.fmvsh.cn
- **移动端App**: 自动使用生产环境API

所有服务都将通过HTTPS安全访问，确保数据传输安全。
