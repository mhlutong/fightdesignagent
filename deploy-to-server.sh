#!/bin/bash
# 阿里云服务器部署脚本
# 在服务器上执行此脚本

echo "🚀 开始部署到阿里云服务器..."

# 更新系统
echo "📦 更新系统..."
apt update && apt upgrade -y

# 安装 Node.js
echo "📦 安装 Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
    apt-get install -y nodejs
else
    echo "✅ Node.js 已安装: $(node --version)"
fi

# 安装 Git
echo "📦 安装 Git..."
if ! command -v git &> /dev/null; then
    apt install git -y
else
    echo "✅ Git 已安装: $(git --version)"
fi

# 安装 PM2
echo "📦 安装 PM2..."
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
else
    echo "✅ PM2 已安装"
fi

# 创建项目目录
echo "📁 创建项目目录..."
mkdir -p /var/www
cd /var/www

# 克隆或更新代码
if [ -d "fightdesignagent" ]; then
    echo "📥 更新代码..."
    cd fightdesignagent
    git pull
else
    echo "📥 克隆代码..."
    git clone https://github.com/mhlutong/fightdesignagent.git
    cd fightdesignagent
fi

# 安装依赖
echo "📦 安装依赖..."
npm install

# 设置环境变量
echo "🔧 设置环境变量..."
export DEEPSEEK_API_KEY=sk-96abdfaa73754608aaa4292f02824d8d
export NODE_ENV=production
export PORT=3000

# 创建 .env 文件
echo "📝 创建 .env 文件..."
cat > .env << EOF
DEEPSEEK_API_KEY=sk-96abdfaa73754608aaa4292f02824d8d
NODE_ENV=production
PORT=3000
EOF

# 停止旧进程（如果存在）
echo "🛑 停止旧进程..."
pm2 delete heroschool-agent 2>/dev/null || true

# 启动应用
echo "🚀 启动应用..."
pm2 start server.js --name heroschool-agent

# 设置开机自启
echo "⚙️  配置开机自启..."
pm2 startup
pm2 save

echo ""
echo "✅ 部署完成！"
echo ""
echo "📊 应用状态:"
pm2 list
echo ""
echo "🌐 访问地址: http://8.136.220.66:3000"
echo ""
echo "📝 常用命令:"
echo "  查看日志: pm2 logs heroschool-agent"
echo "  重启应用: pm2 restart heroschool-agent"
echo "  查看状态: pm2 list"
