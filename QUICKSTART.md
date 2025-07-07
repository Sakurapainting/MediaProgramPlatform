# 快速启动指南

## 前置要求

1. **Node.js** (版本 16 或更高)
   - 下载地址: https://nodejs.org/

2. **MongoDB** (版本 4.4 或更高)
   - 下载地址: https://www.mongodb.com/try/download/community
   - 或使用 MongoDB Atlas 云数据库

## 安装和启动

### 方法一：使用启动脚本（推荐）

1. 打开 PowerShell 或命令提示符
2. 进入项目根目录
3. 运行启动脚本：
   ```powershell
   .\start.ps1
   ```

### 方法二：手动启动

1. **安装依赖**
   ```bash
   npm run install-all
   ```

2. **配置环境变量**
   ```bash
   # 复制环境变量模板
   cp server\.env.example server\.env
   
   # 编辑 server\.env 文件，修改数据库连接等配置
   ```

3. **启动 MongoDB**
   - 如果使用本地 MongoDB，请确保服务正在运行
   - 默认连接地址：mongodb://localhost:27017/media-platform

4. **启动开发服务器**
   ```bash
   npm run dev
   ```

## 访问应用

- **前端界面**: http://localhost:3000
- **后端API**: http://localhost:5000

## 默认登录账号

- **邮箱**: admin@example.com
- **密码**: 123456

## 项目结构

```
MediaProgramPlatform/
├── client/                 # React 前端应用
├── server/                 # Node.js 后端服务
├── docs/                   # 文档
├── package.json           # 项目配置
├── start.ps1              # 启动脚本
└── README.md              # 项目说明
```

## 主要功能

- 🎛️ **仪表盘** - 系统概览和统计数据
- 📺 **设备管理** - 终端设备的注册、监控和管理
- 📁 **内容管理** - 广告素材和节目内容的上传管理
- 🎯 **投放管理** - 广告投放计划和排期管理
- 📊 **数据统计** - 投放效果分析和报表
- 👥 **用户管理** - 系统用户和权限管理

## 开发说明

### 技术栈

**前端**:
- React 18 + TypeScript
- Ant Design Pro
- Zustand (状态管理)
- ECharts (图表)

**后端**:
- Node.js + Express
- MongoDB + Mongoose
- JWT 认证
- Socket.io (实时通信)

### 开发命令

```bash
# 启动开发环境
npm run dev

# 分别启动前端和后端
npm run client
npm run server

# 构建生产版本
npm run build

# 运行测试
npm test
```

## 故障排除

1. **端口冲突**
   - 前端默认端口：3000
   - 后端默认端口：5000
   - 如有冲突，请修改相应配置文件

2. **数据库连接失败**
   - 检查 MongoDB 是否正在运行
   - 检查 server/.env 中的连接字符串

3. **依赖安装失败**
   - 尝试删除 node_modules 文件夹重新安装
   - 使用 npm cache clean --force 清理缓存

## 获取帮助

如有问题，请查看：
- [项目文档](./docs/)
- [API 文档](./docs/api.md)
- [部署指南](./docs/deployment.md)
