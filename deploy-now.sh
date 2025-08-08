#!/bin/bash

# 🚀 消防博物馆志愿者系统 - 快速部署脚本
# 使用方法: ./deploy-now.sh

echo "🚀 开始部署消防博物馆志愿者系统..."
echo "目标域名: https://fmvsh.cn"
echo ""

# 检查当前状态
echo "📋 检查当前状态..."
if [ -d ".git" ]; then
    echo "✅ Git仓库已初始化"
    COMMIT_COUNT=$(git log --oneline origin/main..HEAD | wc -l)
    echo "📝 本地领先远程仓库 $COMMIT_COUNT 个提交"
else
    echo "❌ 未找到Git仓库"
    exit 1
fi

echo ""
echo "🔧 检查项目配置..."

# 检查后端配置
if [ -f "gift-backend/package.json" ] && [ -f "gift-backend/vercel.json" ]; then
    echo "✅ 后端配置完整"
else
    echo "❌ 后端配置缺失"
    exit 1
fi

# 检查前端配置
if [ -f "web-admin/package.json" ] && [ -f "web-admin/vercel.json" ]; then
    echo "✅ 前端配置完整"
else
    echo "❌ 前端配置缺失"
    exit 1
fi

echo ""
echo "📱 检查移动端配置..."
if [ -f "volunteer-app-new/eas.json" ]; then
    echo "✅ 移动端配置完整"
else
    echo "❌ 移动端配置缺失"
    exit 1
fi

echo ""
echo "🎯 部署步骤指南:"
echo ""
echo "1️⃣ 后端API部署 (Vercel)"
echo "   - 访问: https://vercel.com"
echo "   - 创建新项目"
echo "   - 导入仓库: kiko-sk/firemuseumvolunteer"
echo "   - 选择目录: gift-backend"
echo "   - 项目名称: fmvsh-api"
echo "   - 环境变量: NODE_ENV=production"
echo ""
echo "2️⃣ Web管理端部署 (Vercel)"
echo "   - 创建新项目"
echo "   - 选择目录: web-admin"
echo "   - 项目名称: fmvsh-admin"
echo "   - 环境变量: REACT_APP_API_BASE_URL=https://api.fmvsh.cn"
echo "   - 构建命令: npm run build"
echo "   - 输出目录: dist"
echo ""
echo "3️⃣ 域名配置"
echo "   - 后端域名: api.fmvsh.cn"
echo "   - 管理端域名: admin.fmvsh.cn"
echo "   - 主站域名: fmvsh.cn"
echo ""
echo "4️⃣ DNS解析配置 (阿里云)"
echo "   - 访问: https://dc.console.aliyun.com/"
echo "   - 域名: fmvsh.cn"
echo "   - 添加CNAME记录: api -> [后端域名].vercel.app"
echo "   - 添加CNAME记录: admin -> [前端域名].vercel.app"
echo ""
echo "5️⃣ 移动端构建"
echo "   - 登录EAS: eas login"
echo "   - 构建iOS: eas build --platform ios --profile production"
echo "   - 构建Android: eas build --platform android --profile production"
echo ""

echo "⏰ 预计完成时间: 30-60分钟"
echo ""
echo "📞 如遇问题，请检查:"
echo "   - Vercel部署日志"
echo "   - DNS解析状态"
echo "   - API连通性"
echo "   - 环境变量配置"
echo ""
echo "🎉 部署完成后，您将拥有:"
echo "   - 主站: https://fmvsh.cn"
echo "   - API: https://api.fmvsh.cn"
echo "   - 管理端: https://admin.fmvsh.cn"
echo "   - 移动端App: 应用商店下载"
echo ""

# 尝试推送代码（如果网络正常）
echo "🔄 尝试推送代码到GitHub..."
if git push origin main 2>/dev/null; then
    echo "✅ 代码推送成功"
else
    echo "⚠️  网络问题，代码推送失败"
    echo "   请在网络恢复后手动执行: git push origin main"
fi

echo ""
echo "🚀 部署指南已生成完成！"
echo "请按照上述步骤手动执行部署操作。"
