# 阿里云部署指南

## 一、购买和配置服务器

### 1. 购买 ECS 服务器

1. 登录阿里云控制台：https://ecs.console.aliyun.com
2. 点击 "创建实例"
3. 配置选择：
   - **地域**：选择离你最近的区域（如华东1-杭州）
   - **实例规格**：选择 "共享型" 或 "计算型"，最低配置即可（1核2G）
   - **镜像**：选择 "Ubuntu 22.04" 或 "CentOS 7"（推荐 Ubuntu）
   - **系统盘**：40GB 即可
   - **网络**：选择专有网络 VPC
   - **公网IP**：选择 "分配公网IPv4地址"（必须）
   - **安全组**：选择 "新建安全组"，开放端口：
     - 22（SSH）
     - 80（HTTP）
     - 443（HTTPS）
     - 3000（应用端口，可选）
4. 设置登录凭证（密码或密钥对）
5. 完成购买

### 2. 配置安全组规则

1. 进入 ECS 控制台
2. 找到你的实例，点击 "安全组"
3. 点击 "配置规则" → "入方向" → "添加安全组规则"
4. 添加以下规则：
   - **端口范围**：80/80，**授权对象**：0.0.0.0/0
   - **端口范围**：443/443，**授权对象**：0.0.0.0/0
   - **端口范围**：3000/3000，**授权对象**：0.0.0.0/0（如果直接使用3000端口）

---

## 二、连接服务器并安装环境

### 1. 使用 SSH 连接服务器

**Windows 用户：**
- 使用 PowerShell 或 CMD
- 或使用 PuTTY、Xshell 等工具

```bash
ssh root@你的服务器公网IP
# 输入你设置的密码
```

### 2. 更新系统

```bash
# Ubuntu/Debian
apt update && apt upgrade -y

# CentOS
yum update -y
```

### 3. 安装 Node.js

**方法1：使用 NodeSource（推荐）**

```bash
# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt-get install -y nodejs

# CentOS
curl -fsSL https://rpm.nodesource.com/setup_18.x | bash -
yum install -y nodejs
```

**方法2：使用 nvm（推荐用于多版本管理）**

```bash
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
source ~/.bashrc
nvm install 18
nvm use 18
```

**验证安装：**
```bash
node --version
npm --version
```

### 4. 安装 Git

```bash
# Ubuntu/Debian
apt install git -y

# CentOS
yum install git -y
```

### 5. 安装 PM2（进程管理器）

```bash
npm install -g pm2
```

---

## 三、部署应用

### 方法1：从 GitHub 克隆（推荐）

```bash
# 创建项目目录
mkdir -p /var/www
cd /var/www

# 克隆仓库
git clone https://github.com/mhlutong/fightdesignagent.git
cd fightdesignagent

# 安装依赖
npm install

# 设置环境变量
export DEEPSEEK_API_KEY=sk-96abdfaa73754608aaa4292f02824d8d
export NODE_ENV=production

# 使用 PM2 启动应用
pm2 start server.js --name heroschool-agent

# 设置 PM2 开机自启
pm2 startup
pm2 save
```

### 方法2：使用 scp 上传文件

**在本地 Windows 电脑上：**

```powershell
# 使用 PowerShell
scp -r E:\heroschoolagent root@你的服务器IP:/var/www/
```

**然后在服务器上：**

```bash
cd /var/www/heroschoolagent
npm install
export DEEPSEEK_API_KEY=sk-96abdfaa73754608aaa4292f02824d8d
pm2 start server.js --name heroschool-agent
pm2 startup
pm2 save
```

---

## 四、配置 Nginx 反向代理（推荐）

### 1. 安装 Nginx

```bash
# Ubuntu/Debian
apt install nginx -y

# CentOS
yum install nginx -y
```

### 2. 配置 Nginx

```bash
# 编辑配置文件
nano /etc/nginx/sites-available/default
# 或 CentOS: nano /etc/nginx/nginx.conf
```

**添加以下配置：**

```nginx
server {
    listen 80;
    server_name 你的域名或服务器IP;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

### 3. 启动 Nginx

```bash
# 测试配置
nginx -t

# 启动 Nginx
systemctl start nginx
systemctl enable nginx  # 开机自启
```

---

## 五、配置环境变量（永久）

### 方法1：使用 PM2 环境变量文件

```bash
# 创建 .env 文件
cd /var/www/fightdesignagent
nano .env
```

**添加内容：**
```
DEEPSEEK_API_KEY=sk-96abdfaa73754608aaa4292f02824d8d
NODE_ENV=production
PORT=3000
```

**修改 server.js 支持 .env（需要安装 dotenv）：**

```bash
npm install dotenv
```

在 server.js 开头添加：
```javascript
require('dotenv').config();
```

### 方法2：使用系统环境变量

```bash
# 编辑 /etc/environment
nano /etc/environment

# 添加：
DEEPSEEK_API_KEY=sk-96abdfaa73754608aaa4292f02824d8d
NODE_ENV=production
```

---

## 六、访问应用

### 方式1：直接访问（如果开放了3000端口）
```
http://你的服务器公网IP:3000
```

### 方式2：通过 Nginx（推荐）
```
http://你的服务器公网IP
```

---

## 七、常用 PM2 命令

```bash
# 查看运行状态
pm2 list

# 查看日志
pm2 logs heroschool-agent

# 重启应用
pm2 restart heroschool-agent

# 停止应用
pm2 stop heroschool-agent

# 删除应用
pm2 delete heroschool-agent

# 查看详细信息
pm2 info heroschool-agent

# 监控
pm2 monit
```

---

## 八、更新代码

### 如果使用 Git：

```bash
cd /var/www/fightdesignagent
git pull
npm install  # 如果有新的依赖
pm2 restart heroschool-agent
```

---

## 九、配置域名（可选）

### 1. 购买域名
在阿里云购买域名

### 2. 解析域名
- 进入域名控制台
- 添加 A 记录：
  - **记录类型**：A
  - **主机记录**：@ 或 www
  - **记录值**：你的服务器公网IP

### 3. 配置 SSL 证书（HTTPS）

**使用 Let's Encrypt 免费证书：**

```bash
# 安装 Certbot
apt install certbot python3-certbot-nginx -y

# 获取证书
certbot --nginx -d 你的域名.com

# 自动续期
certbot renew --dry-run
```

---

## 十、防火墙配置

```bash
# Ubuntu (UFW)
ufw allow 22
ufw allow 80
ufw allow 443
ufw enable

# CentOS (firewalld)
firewall-cmd --permanent --add-port=22/tcp
firewall-cmd --permanent --add-port=80/tcp
firewall-cmd --permanent --add-port=443/tcp
firewall-cmd --reload
```

---

## 故障排查

### 1. 应用无法访问
- 检查 PM2 状态：`pm2 list`
- 查看日志：`pm2 logs heroschool-agent`
- 检查端口：`netstat -tlnp | grep 3000`
- 检查防火墙和安全组

### 2. 502 Bad Gateway（Nginx）
- 检查应用是否运行：`pm2 list`
- 检查 Nginx 配置：`nginx -t`
- 查看 Nginx 日志：`tail -f /var/log/nginx/error.log`

### 3. 环境变量未生效
- 重启 PM2：`pm2 restart heroschool-agent`
- 检查 .env 文件是否存在
- 确认 dotenv 已安装

---

## 安全建议

1. **修改 SSH 默认端口**
2. **使用密钥登录而非密码**
3. **定期更新系统**
4. **配置 fail2ban 防止暴力破解**
5. **定期备份 data.json 和 prompts.json**

---

## 快速部署脚本

创建一个 `deploy.sh` 文件：

```bash
#!/bin/bash
cd /var/www/fightdesignagent
git pull
npm install
pm2 restart heroschool-agent
echo "部署完成！"
```

使用：
```bash
chmod +x deploy.sh
./deploy.sh
```
