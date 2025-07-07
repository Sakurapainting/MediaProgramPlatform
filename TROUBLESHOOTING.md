# 开发环境启动指南

## 问题说明
当前系统的npm缓存存在权限问题，无法正常安装依赖。以下是几种解决方案：

## 解决方案

### 方案1: 以管理员身份运行（推荐）

1. **右键点击PowerShell或命令提示符**
2. **选择"以管理员身份运行"**
3. **进入项目目录并安装依赖**：
   ```bash
   cd "d:\Harine_internship\code\MediaProgramPlatform"
   npm install
   cd server
   npm install
   cd ../client
   npm install
   ```

### 方案2: 修复npm权限

1. **删除npm缓存目录**：
   ```bash
   # 以管理员身份运行
   rd /s /q "D:\nodejs\node_cache"
   ```

2. **重新配置npm缓存路径**：
   ```bash
   npm config set cache "C:\Users\%USERNAME%\AppData\Roaming\npm-cache" --global
   ```

### 方案3: 使用yarn（如果已安装）

```bash
cd "d:\Harine_internship\code\MediaProgramPlatform"
yarn install
cd server
yarn install
cd ../client  
yarn install
```

### 方案4: 简化版本启动

如果依赖安装仍有问题，可以使用以下最小化版本：

1. **创建简化的后端服务**
2. **使用CDN版本的前端库**
3. **跳过复杂依赖，直接运行核心功能**

## 启动步骤（依赖安装成功后）

### 1. 启动MongoDB
```bash
# 确保MongoDB服务正在运行
# Windows: services.msc 查找MongoDB服务
# 或者使用MongoDB Compass
```

### 2. 配置环境变量
```bash
# 在server目录下创建.env文件
cd server
copy .env.example .env
# 编辑.env文件，配置数据库连接
```

### 3. 启动后端服务
```bash
cd server
npm run dev
# 或者
node dist/index.js
```

### 4. 启动前端应用
```bash
# 新开一个终端
cd client
npm start
```

### 5. 访问应用
- 前端: http://localhost:3000
- 后端: http://localhost:5000

## 故障排除

### 如果MongoDB未安装
可以使用在线MongoDB服务：
1. 注册MongoDB Atlas: https://cloud.mongodb.com/
2. 创建免费集群
3. 获取连接字符串配置到.env文件

### 如果仍有权限问题
1. 重启电脑
2. 检查杀毒软件是否阻止
3. 使用Windows管理员账户
4. 考虑使用WSL2 + Ubuntu环境

## 临时解决方案

如果现在就想看到效果，我可以：
1. 创建一个静态HTML版本的前端界面
2. 使用简单的Node.js服务器
3. 模拟数据展示核心功能
