# 英雄学院 - 战斗设计工具

一个基于DeepSeek AI的游戏战斗设计工具，用于生成和管理游戏中的职业和元素。

## 功能特性

- 🎮 可视化界面管理职业和元素
- 🤖 集成DeepSeek API自动生成新职业
- 💭 支持开启/关闭深度思考模式
- 📝 可编辑的职业和元素列表
- 🎨 现代化的UI设计

## 安装步骤

1. 安装依赖：
```bash
npm install
```

2. 启动服务器：
```bash
npm start
```

3. 打开浏览器访问：
```
http://localhost:3000
```

## 使用说明

1. **职业大类**：在文本框中编辑已有的职业列表（每行一个）
2. **元素大类**：在文本框中编辑已有的元素列表（每行一个）
3. **深度思考**：切换开关以启用/禁用深度思考模式
4. **新增职业**：点击按钮，系统会根据现有职业和元素生成一个新的职业

## 技术栈

- 后端：Node.js + Express
- 前端：HTML + CSS + JavaScript
- AI：DeepSeek API

## 部署到 Render

### 准备工作

1. **确保代码已提交到 GitHub**：
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git remote add origin <你的GitHub仓库地址>
   git push -u origin main
   ```

2. **在 Render 创建 Web Service**：
   - 访问 https://render.com 并注册/登录
   - 点击 "New +" → "Web Service"
   - 连接你的 GitHub 仓库
   - 配置如下：
     - **Name**: `heroschool-agent`
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: 选择 Free 计划

3. **设置环境变量**：
   - 在 Render 控制台的 "Environment" 部分
   - 添加环境变量：
     - **Key**: `DEEPSEEK_API_KEY`
     - **Value**: `sk-96abdfaa73754608aaa4292f02824d8d`
   - 点击 "Save Changes"

4. **部署**：
   - Render 会自动开始构建和部署
   - 等待部署完成（通常需要 2-5 分钟）
   - 部署完成后，你会得到一个 URL（如 `https://heroschool-agent.onrender.com`）

5. **分享链接**：
   - 将 Render 提供的 URL 分享给朋友
   - 所有人可以同时访问和编辑

### 注意事项

- **免费版限制**：Render 免费版在 15 分钟无活动后会休眠，首次访问需要等待几秒唤醒
- **数据持久化**：所有数据保存在 `data.json` 和 `prompts.json` 文件中，会持久保存
- **并发编辑**：多人同时编辑时，最后保存的数据会覆盖之前的（建议协调使用）
- **API密钥安全**：API密钥已配置为从环境变量读取，不会暴露在代码中

## 本地开发注意事项

- API密钥已配置在服务器端，确保安全性
- 确保网络连接正常以调用DeepSeek API
- 生成的职业会自动添加到职业列表中
