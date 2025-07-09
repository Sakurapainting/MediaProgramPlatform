# 智慧融媒体云平台

一个现代化的融媒体内容投放管理平台，支持广告和节目内容的智能投放到各种终端设备。

> 🎉 **项目已完成基础架构搭建，包含完整的前后端代码、数据库设计和部署文档！**

## 功能特性

- 📺 **终端设备管理** - 支持多种终端设备的接入和管理
- � **安卓终端集成** - 通过本地MQTT broker与安卓屏幕终端通信
- �📢 **广告投放管理** - 智能广告投放策略和排期管理
- 📋 **节目内容管理** - 节目内容的上传、编辑和分发
- 📊 **数据统计分析** - 投放效果的实时监控和数据分析
- 🎯 **精准投放** - 基于地理位置、时间、受众的精准投放
- 🔧 **设备监控** - 终端设备状态的实时监控和远程管理

## ⚡ 快速开始

### 📋 系统要求
- Node.js 16+ 
- MongoDB 4.4+
- npm 或 yarn

### 🚀 一键启动
```bash
# 克隆项目
git clone <repository-url>
cd MediaProgramPlatform

# 安装依赖
npm run install-all

# 启动开发环境 (包含本地MQTT broker)
npm run dev
```

### 🧪 MQTT功能测试
```bash
# 快速MQTT连接测试
node test-mqtt-quick.js

# 本地MQTT端到端测试
node test-local-mqtt-e2e.js

# 网络配置检查
network-check.bat  # Windows
./network-check.sh # Linux/Mac
```

### 🌐 访问地址
- **前端管理界面**: http://localhost:3000
- **后端API服务**: http://localhost:5001
- **本地MQTT broker**: tcp://localhost:1883
- **默认账号**: admin@example.com / 123456

详细安装说明请查看 [INSTALLATION.md](./INSTALLATION.md)

## 技术栈

### 前端
- React 18 + TypeScript
- Ant Design Pro
- Redux Toolkit
- React Router v6
- Axios
- ECharts

### 后端
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- MQTT (Aedes broker) - 本地MQTT服务器
- Socket.io
- JWT认证
- Multer文件上传

## 项目结构

```
MediaProgramPlatform/
├── client/                 # 前端应用
│   ├── public/
│   ├── src/
│   │   ├── components/     # 通用组件
│   │   ├── pages/         # 页面组件
│   │   ├── store/         # Redux状态管理
│   │   ├── services/      # API服务
│   │   ├── utils/         # 工具函数
│   │   └── types/         # TypeScript类型定义
│   └── package.json
├── server/                # 后端服务
│   ├── src/
│   │   ├── controllers/   # 控制器
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # 路由
│   │   ├── middleware/    # 中间件
│   │   ├── services/      # 业务服务
│   │   └── utils/         # 工具函数
│   └── package.json
├── docs/                  # 文档
└── README.md
```

## 快速开始

### 安装依赖
```bash
npm run install-all
```

### 启动开发环境
```bash
npm run dev
```

### 构建生产版本
```bash
npm run build
```

## 主要功能模块

### 1. 设备管理
- 终端设备注册和认证
- 设备状态监控
- 远程配置管理
- 设备分组管理

### 2. 内容管理
- 广告素材上传和管理
- 节目内容编辑
- 内容审核流程
- 版权管理

### 3. 投放管理
- 投放计划制定
- 排期管理
- 投放策略配置
- 紧急插播功能

### 4. 数据分析
- 投放效果统计
- 设备运行监控
- 用户行为分析
- 报表生成

## API 文档

详细的API文档请参考 `/docs/api.md`

## 贡献指南

请参考 `/docs/CONTRIBUTING.md`

## 许可证

MIT License

## ✅ 项目完成度

### 已完成功能
- ✅ 完整的项目架构设计
- ✅ 前端React应用框架（基于Ant Design Pro）
- ✅ 后端Node.js API服务
- ✅ 本地MQTT broker集成 (Aedes)
- ✅ 安卓终端MQTT通信协议
- ✅ 数据库模型设计（用户、设备、内容、投放活动）
- ✅ 用户认证和权限管理
- ✅ 智能仪表盘和数据可视化
- ✅ 设备管理基础功能
- ✅ 实时通信框架（Socket.io）
- ✅ 完整的开发和部署文档

### 🚧 待完善功能
- 📁 内容上传和管理功能
- 🎯 投放活动创建和管理
- 📊 高级数据分析和报表
- 🔔 实时通知和告警系统
- 📱 移动端适配
- 🌍 国际化支持

## 📁 项目文档

- [📖 产品介绍](./docs/PRODUCT.md) - 详细的产品功能和特性说明
- [🔧 安装指南](./INSTALLATION.md) - 完整的环境搭建和安装步骤
- [⚡ 快速开始](./QUICKSTART.md) - 快速部署和使用指南
- [📱 MQTT安卓集成](./MQTT_ANDROID_INTEGRATION.md) - 安卓终端MQTT通信指南
- [🌐 网络配置](./NETWORK_CONFIG_GUIDE.md) - 本地MQTT服务器网络配置
- [📲 安卓配置](./ANDROID_NETWORK_SETUP.md) - 安卓设备连接配置
- [🏗️ 开发指南](./docs/DEVELOPMENT.md) - 开发规范和代码贡献指南
- [🚀 部署文档](./docs/DEPLOYMENT.md) - 生产环境部署指南

## 🎯 下一步计划

1. **完善内容管理模块**
   - 文件上传和存储
   - 多媒体格式支持
   - 内容预览和编辑

2. **增强投放功能**
   - 投放策略配置
   - 排期管理系统
   - 效果追踪分析

3. **优化用户体验**
   - 响应式设计
   - 操作流程优化
   - 性能提升

4. **扩展企业功能**
   - 多租户支持
   - API开放平台
   - 第三方集成

## 🤝 贡献指南

欢迎提交 Issue 和 Pull Request！

1. Fork 项目
2. 创建特性分支 (`git checkout -b feature/AmazingFeature`)
3. 提交更改 (`git commit -m 'Add some AmazingFeature'`)
4. 推送到分支 (`git push origin feature/AmazingFeature`)
5. 打开 Pull Request

## 📄 许可证

本项目基于 MIT 许可证开源 - 查看 [LICENSE](LICENSE) 文件了解详情

---

**智慧融媒体云平台** - 让内容投放更智能，让媒体管理更简单！

如有问题或建议，请随时联系开发团队。
