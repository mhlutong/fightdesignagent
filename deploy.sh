#!/bin/bash
# 阿里云快速部署脚本

echo "🚀 开始部署..."

# 检查 Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js 未安装，请先安装 Node.js"
    exit 1
fi

# 检查 PM2
if ! command -v pm2 &> /dev/null; then
    echo "📦 安装 PM2..."
    npm install -g pm2
fi

# 进入项目目录
cd "$(dirname "$0")"

# 安装依赖
echo "📦 安装依赖..."
npm install

# 检查环境变量
if [ -z "$DEEPSEEK_API_KEY" ]; then
    echo "⚠️  警告: DEEPSEEK_API_KEY 环境变量未设置"
    echo "   请在服务器上设置: export DEEPSEEK_API_KEY=你的密钥"
fi

# 启动应用
echo "🚀 启动应用..."
pm2 delete heroschool-agent 2>/dev/null || true
pm2 start server.js --name heroschool-agent
pm2 save

echo "✅ 部署完成！"
echo "📊 查看状态: pm2 list"
echo "📝 查看日志: pm2 logs heroschool-agent"
