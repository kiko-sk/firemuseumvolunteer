#!/bin/bash

echo "🚀 消防博物馆志愿者系统 - 快速上线脚本"
echo "=========================================="

# 检查Git状态
echo "📋 检查Git状态..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  发现未提交的更改，正在提交..."
    git add .
    git commit -m "Prepare for production deployment - $(date)"
    git push origin main
else
    echo "✅ 代码已是最新状态"
fi

# 测试后端服务
echo "🔧 测试后端服务..."
if curl -s http://localhost:8000/api/gifts > /dev/null; then
    echo "✅ 后端服务运行正常"
else
    echo "⚠️  后端服务未运行，正在启动..."
    cd gift-backend
    npm start &
    cd ..
    sleep 5
fi

# 构建Web管理端
echo "🌐 构建Web管理端..."
cd web-admin
if npm run build; then
    echo "✅ Web管理端构建成功"
else
    echo "❌ Web管理端构建失败"
    exit 1
fi
cd ..

# 检查App配置
echo "📱 检查App配置..."
if [ -f "volunteer-app-new/eas.json" ]; then
    echo "✅ App配置已就绪"
else
    echo "⚠️  请先配置 eas.json"
fi

echo ""
echo "🎉 本地构建完成！"
echo ""
echo "📋 下一步操作："
echo "1. 访问 https://vercel.com 部署后端和Web端"
echo "2. 使用 EAS CLI 构建和发布App"
echo "3. 参考 DEPLOYMENT.md 获取详细步骤"
echo ""
echo "🔗 相关文档："
echo "- 部署指南: DEPLOYMENT.md"
echo "- 项目文档: README.md" 