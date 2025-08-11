#!/bin/bash

echo "🚀 Vercel数据重新同步脚本"
echo "=========================="
echo ""

# 检查当前Git状态
echo "🔍 检查当前Git状态..."
git status

echo ""
echo "📋 可用的重新同步方法："
echo ""

echo "方法1: 强制重新部署 (推荐)"
echo "1. 访问 https://vercel.com/dashboard"
echo "2. 选择项目: firemuseumvolunteer"
echo "3. 进入 Settings > General"
echo "4. 点击 'Redeploy' 按钮"
echo "5. 选择 'Redeploy without Build Cache'"
echo ""

echo "方法2: 通过Git强制推送"
echo "1. 强制推送当前代码到GitHub"
echo "2. Vercel会自动检测并重新部署"
echo ""

echo "方法3: 删除并重新导入项目"
echo "1. 在Vercel中删除当前项目"
echo "2. 重新导入GitHub仓库"
echo "3. 重新配置域名和环境变量"
echo ""

echo "方法4: 通过Vercel CLI重新部署"
echo "1. 安装Vercel CLI: npm i -g vercel"
echo "2. 登录: vercel login"
echo "3. 重新部署: vercel --prod"
echo ""

# 检查是否有未推送的提交
if git status | grep -q "ahead of 'origin/main'"; then
    echo "⚠️  检测到本地有未推送的提交！"
    echo "建议先推送代码到GitHub，然后使用Vercel重新部署功能。"
    echo ""
    
    read -p "是否要尝试推送代码到GitHub? (y/n): " choice
    if [ "$choice" = "y" ] || [ "$choice" = "Y" ]; then
        echo "尝试推送代码..."
        git push origin main
    fi
else
    echo "✅ Git状态正常，所有代码已同步"
fi

echo ""
echo "🎯 推荐操作顺序："
echo "1. 使用Vercel控制台强制重新部署"
echo "2. 如果问题持续，考虑重新导入项目"
echo "3. 验证所有功能正常工作"
echo ""

echo "📞 如需帮助，请检查："
echo "- Vercel部署日志"
echo "- 环境变量配置"
echo "- 域名DNS设置"
echo "- 构建配置"
