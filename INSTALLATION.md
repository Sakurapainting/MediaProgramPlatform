# 智慧融媒体云平台 - 完整安装指南

## 系统要求

- Windows 10/11 或 macOS 或 Linux
- 至少 4GB RAM
- 2GB 可用磁盘空间

## 步骤 1: 安装 Node.js

1. 访问 Node.js 官网：https://nodejs.org/
2. 下载 LTS 版本（推荐 v18 或更高版本）
3. 运行安装程序，按默认选项安装
4. 安装完成后，打开命令提示符验证：
   ```bash
   node --version
   npm --version
   ```

## 步骤 2: 安装 MongoDB

### 选项 A: 本地安装 MongoDB

1. 访问：https://www.mongodb.com/try/download/community
2. 选择适合您操作系统的版本下载
3. 安装 MongoDB Community Server
4. 启动 MongoDB 服务

### 选项 B: 使用 MongoDB Atlas（云数据库，推荐）

1. 注册 MongoDB Atlas 账号：https://cloud.mongodb.com/
2. 创建免费集群
3. 获取连接字符串，稍后配置到项目中

## 步骤 3: 下载和配置项目

1. 下载项目代码到本地
2. 打开命令提示符，进入项目目录：
   ```bash
   cd "路径\to\MediaProgramPlatform"
   ```

3. 安装项目依赖：
   ```bash
   npm install
   ```

4. 安装后端依赖：
   ```bash
   cd server
   npm install
   cd ..
   ```

5. 安装前端依赖：
   ```bash
   cd client
   npm install
   cd ..
   ```

## 步骤 4: 配置环境变量

1. 在 `server` 目录下创建 `.env` 文件
2. 复制 `server\.env.example` 的内容到 `.env` 文件
3. 根据实际情况修改配置：

```env
# 如果使用本地 MongoDB
MONGODB_URI=mongodb://localhost:27017/media-platform

# 如果使用 MongoDB Atlas
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/media-platform

JWT_SECRET=your-super-secret-jwt-key-here
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
```

## 步骤 5: 启动项目

### 方法 1: 同时启动前后端
```bash
npm run dev
```

### 方法 2: 分别启动
```bash
# 终端 1: 启动后端
cd server
npm run dev

# 终端 2: 启动前端  
cd client
npm start
```

## 步骤 6: 访问应用

- 前端地址：http://localhost:3001
- 后端 API：http://localhost:5001

## 初始账号

系统会自动创建管理员账号：
- 邮箱：admin@example.com
  - 密码：123456

## 验证安装

1. 打开浏览器访问 http://localhost:3001
2. 使用上述账号登录
3. 查看仪表盘是否正常显示

## 常见问题

### Q: npm 命令无法识别
A: 需要先安装 Node.js，并确保添加到系统 PATH

### Q: MongoDB 连接失败
A: 检查 MongoDB 服务是否启动，或验证 Atlas 连接字符串

### Q: 端口被占用
A: 修改 .env 文件中的 PORT 配置

### Q: 前端页面空白
A: 检查控制台错误，确保后端服务正常运行

## 生产部署

详细的生产环境部署指南请参考 `docs/deployment.md`

## 技术支持

如遇问题，请查看：
- 项目文档：`docs/` 目录
- GitHub Issues
- 联系开发团队
