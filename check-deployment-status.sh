#!/bin/bash

echo "🚀 消防博物馆志愿者系统 - 部署状态检查"
echo "=========================================="
echo ""

# 检查后端API状态
echo "🔍 检查后端API状态..."
if curl -s -f https://api.fmvsh.cn/api/gifts > /dev/null; then
    echo "✅ 后端API: https://api.fmvsh.cn - 正常运行"
else
    echo "❌ 后端API: https://api.fmvsh.cn - 连接失败"
fi

# 检查Web管理端状态
echo "🔍 检查Web管理端状态..."
if curl -s -f https://admin.fmvsh.cn > /dev/null; then
    echo "✅ Web管理端: https://admin.fmvsh.cn - 正常运行"
else
    echo "❌ Web管理端: https://admin.fmvsh.cn - 连接失败"
fi

# 检查主站状态
echo "🔍 检查主站状态..."
if curl -s -f https://fmvsh.cn > /dev/null; then
    echo "✅ 主站: https://fmvsh.cn - 正常运行"
else
    echo "❌ 主站: https://fmvsh.cn - 连接失败"
fi

# 检查API端点
echo ""
echo "🔍 检查API端点..."
endpoints=("gifts" "activities" "volunteer-style" "signup-list" "points")

for endpoint in "${endpoints[@]}"; do
    if curl -s -f "https://api.fmvsh.cn/api/$endpoint" > /dev/null; then
        echo "✅ /api/$endpoint - 正常"
    else
        echo "❌ /api/$endpoint - 失败"
    fi
done

# 检查SSL证书
echo ""
echo "🔍 检查SSL证书..."
if openssl s_client -connect fmvsh.cn:443 -servername fmvsh.cn < /dev/null 2>/dev/null | grep -q "Verify return code: 0"; then
    echo "✅ SSL证书: 有效"
else
    echo "❌ SSL证书: 无效或过期"
fi

# 检查DNS解析
echo ""
echo "🔍 检查DNS解析..."
domains=("fmvsh.cn" "admin.fmvsh.cn" "api.fmvsh.cn")

for domain in "${domains[@]}"; do
    if nslookup "$domain" > /dev/null 2>&1; then
        echo "✅ $domain - DNS解析正常"
    else
        echo "❌ $domain - DNS解析失败"
    fi
done

echo ""
echo "=========================================="
echo "🎯 检查完成！"
echo ""
echo "📱 如需构建移动端应用，请运行："
echo "cd volunteer-app-new"
echo "eas build --platform all --profile production"
echo ""
echo "🌐 系统访问地址："
echo "- 主站: https://fmvsh.cn"
echo "- 管理端: https://admin.fmvsh.cn"
echo "- API: https://api.fmvsh.cn"
