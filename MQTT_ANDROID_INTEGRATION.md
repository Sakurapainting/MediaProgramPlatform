# 智慧融媒体云平台 - MQTT安卓终端集成

## 🎉 完成状态

✅ **本地MQTT服务器集成完成** - 安卓屏幕终端可以通过本地部署的MQTT broker与云平台进行真实连接和数据传输

## 📋 已实现功能

### 1. MQTT服务器 (`server/src/services/mqttService.ts`)
- ✅ 基于Aedes的本地MQTT broker服务器
- ✅ 支持设备注册、心跳、状态上报、数据传输
- ✅ 支持内容推送、命令下发、广播消息
- ✅ 自动设备状态管理和数据库同步
- ✅ 本地MQTT服务器监听端口1883

### 2. Device模型扩展 (`server/src/models/Device.ts`)
- ✅ 新增`android_screen`设备类型
- ✅ 新增MQTT连接信息字段：
  - `clientId`: MQTT客户端ID
  - `isConnected`: 连接状态
  - `lastConnectedAt`: 最后连接时间
  - `subscriptions`: 订阅主题列表
  - `messageCount`: 消息计数
  - `lastMessage`: 最后一条消息

### 3. MQTT管理API (`server/src/routes/mqtt.ts`)
- ✅ `GET /api/mqtt/status` - MQTT连接状态查询
- ✅ `GET /api/mqtt/devices` - 安卓设备列表
- ✅ `GET /api/mqtt/devices/:deviceId` - 设备详情
- ✅ `POST /api/mqtt/push` - 内容推送到设备
- ✅ `POST /api/mqtt/command` - 命令下发
- ✅ `POST /api/mqtt/broadcast` - 广播消息
- ✅ `POST /api/mqtt/batch-push` - 批量推送
- ✅ `POST /api/mqtt/restart/:deviceId` - 设备重启
- ✅ `POST /api/mqtt/screenshot/:deviceId` - 远程截图

### 4. 主服务器集成 (`server/src/index.ts`)
- ✅ MQTT客户端自动启动和连接管理
- ✅ 优雅关闭处理
- ✅ 路由注册和中间件集成
- ✅ 错误处理和日志记录

## 🔗 MQTT连接信息

### 本地MQTT服务器配置
- **MQTT地址**: `您的服务器IP地址` (本地MQTT broker)
- **MQTT端口**: `1883` (本地部署)
- **协议版本**: MQTT v3.1.1
- **QoS等级**: 1 (至少一次传递)
- **认证方式**: 无需用户名密码
- **网络要求**: 安卓设备与云平台服务器在同一局域网，或通过端口转发访问

### 云平台API配置
- **API地址**: `您的服务器IP地址:5001` (如 192.168.1.100:5001)
- **API端口**: `5001` (云平台HTTP API服务)

### 💡 网络配置指南
1. 🏠 **本地MQTT服务器**: 云平台自建Aedes broker，监听1883端口
2. 🔥 **防火墙配置**: 需开放1883端口(MQTT)和5001端口(API)
3. � **网络要求**: 安卓设备与云平台服务器在同一局域网
4. 🔧 **云平台API端口**: 确保5001端口对安卓设备开放
5. 📱 **安卓端配置**: MQTT服务器设为云平台服务器IP:1883
6. 📋 **详细配置**: 参考 `NETWORK_CONFIG_GUIDE.md` 文档
7. 🌍 **公网访问**: 如需公网访问，需配置端口转发

### HTTP API
- **服务器地址**: `http://您的服务器IP:5001` (如 http://192.168.1.100:5001)
- **认证方式**: JWT Bearer Token
- **管理员账号**: admin@example.com / 123456

### 安卓端配置示例
```java
// MQTT连接配置 - 连接本地MQTT broker
String MQTT_BROKER_URL = "tcp://YOUR_SERVER_IP:1883";  // 改为云平台服务器IP
String CLIENT_ID = "android_" + deviceId;

// 云平台API配置  
String API_BASE_URL = "http://YOUR_SERVER_IP:5001";
```

## 📱 安卓终端消息协议

### 1. 设备注册
```json
// 发布主题: device/register
{
  "type": "register",
  "deviceId": "android_001",
  "clientId": "mqtt_client_001", 
  "timestamp": 1640995200000,
  "data": {
    "deviceId": "android_001",
    "name": "安卓屏幕终端_001",
    "type": "android_screen",
    "location": {
      "name": "大厅显示屏",
      "address": "北京市朝阳区xxx大厦1层",
      "coordinates": {"latitude": 39.9042, "longitude": 116.4074}
    },
    "specifications": {
      "resolution": "1920x1080",
      "size": "55寸", 
      "orientation": "horizontal"
    },
    "version": "1.0.0",
    "capabilities": ["display", "audio", "touch"]
  }
}
```

### 2. 心跳消息
```json
// 发布主题: device/heartbeat
{
  "type": "heartbeat",
  "deviceId": "android_001",
  "clientId": "mqtt_client_001",
  "timestamp": 1640995200000,
  "data": {
    "uptime": 12345678,
    "memoryUsage": 45.6,
    "cpuUsage": 23.1,
    "temperature": 35,
    "brightness": 80
  }
}
```

### 3. 状态更新
```json
// 发布主题: device/status  
{
  "type": "status",
  "deviceId": "android_001",
  "clientId": "mqtt_client_001",
  "timestamp": 1640995200000,
  "data": {
    "status": "online",
    "deviceInfo": {
      "battery": 85,
      "temperature": 32,
      "brightness": 80,
      "volume": 60
    }
  }
}
```

### 4. 设备数据上报
```json
// 发布主题: device/data
{
  "type": "data", 
  "deviceId": "android_001",
  "clientId": "mqtt_client_001",
  "timestamp": 1640995200000,
  "data": {
    "dataType": "screenshot",
    "payload": {
      "filename": "screenshot_001.jpg",
      "base64": "data:image/jpeg;base64,/9j/4AAQ...",
      "width": 1920,
      "height": 1080
    }
  }
}
```

### 5. 内容响应
```json
// 发布主题: device/content_response
{
  "type": "content_response",
  "deviceId": "android_001", 
  "clientId": "mqtt_client_001",
  "timestamp": 1640995200000,
  "data": {
    "contentId": "content_001",
    "status": "playing", // playing, completed, error
    "error": null
  }
}
```

## 📤 服务器下发消息

### 1. 内容推送
```json
// 订阅主题: device/{clientId}/content
{
  "type": "content_push",
  "timestamp": 1640995200000,
  "data": {
    "contentId": "content_001",
    "url": "https://example.com/image.jpg",
    "type": "image",
    "duration": 10,
    "priority": 1,
    "schedule": {
      "startTime": "2024-01-01T09:00:00Z",
      "endTime": "2024-01-01T18:00:00Z"
    }
  }
}
```

### 2. 命令下发
```json
// 订阅主题: device/{clientId}/commands
{
  "type": "command",
  "timestamp": 1640995200000,
  "data": {
    "command": "screenshot",
    "params": {
      "quality": 90,
      "format": "jpg"
    }
  }
}
```

### 3. 广播消息
```json
// 订阅主题: broadcast/all
{
  "type": "broadcast",
  "timestamp": 1640995200000,
  "data": {
    "message": "系统维护通知",
    "level": "info"
  }
}
```

## 🧪 测试工具

### 1. API测试脚本
```bash
node test-mqtt-quick.js  # 快速功能测试
```

### 2. MQTT客户端模拟器
```bash
# 使用提供的HTML模拟器
open mqtt-test.html

# 或使用Node.js客户端
node test-mqtt-client.js
```

### 3. 推荐的MQTT测试工具
- **MQTT.fx** - 图形化MQTT客户端
- **MQTTX** - 跨平台MQTT 5.0客户端  
- **Mosquitto** - 命令行MQTT客户端

## 🚀 启动服务

```bash
# 1. 启动MongoDB数据库服务

# 2. 启动后端服务
cd server
npm run dev

# 3. 启动前端服务 (可选)
cd client  
npm start
```

## 📊 监控和管理

### 服务状态查询
```bash
curl http://localhost:5001/health
```

### MQTT状态查询 (需要登录)
```bash
# 1. 登录获取token
curl -X POST http://localhost:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"123456"}'

# 2. 查询MQTT状态
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/mqtt/status
```

## 🔧 配置说明

### 环境变量 (`server/.env`)
```env
MONGODB_URI=mongodb://localhost:27017/media-platform
JWT_SECRET=your-super-secret-jwt-key-here
PORT=5001
MQTT_PORT=1883
CLIENT_URL=http://localhost:3000
```

### 本地MQTT服务器说明
- **服务器**: 本地Aedes broker，集成在云平台后端服务中
- **端口**: 1883 (TCP)，可配置SSL/TLS端口8883
- **特点**: 本地部署，数据安全，响应快速
- **认证**: 当前无需认证，可根据需要增加认证机制
- **局域网**: 适合局域网环境部署，支持端口转发公网访问
- **安全**: 建议防火墙仅开放必要端口，生产环境启用认证

## 📝 下一步开发建议

1. **安卓客户端开发**
   - 使用Eclipse Paho Android或类似MQTT库
   - 实现自动重连和离线缓存
   - 添加SSL/TLS加密支持

2. **功能增强**
   - 增加设备分组管理
   - 支持固件升级推送
   - 添加实时音视频流推送
   - 实现设备远程控制面板

3. **监控优化**
   - 添加设备健康状态监控
   - 实现异常告警机制
   - 增加详细的操作日志

4. **性能优化**
   - 支持集群部署
   - 添加Redis缓存
   - 优化大量设备并发处理

## 🔒 安全考虑

- JWT认证保护API访问
- MQTT客户端ID验证
- 建议生产环境启用SSL/TLS
- 定期更新JWT密钥

---

**🎉 安卓屏幕终端与智慧融媒体云平台的本地MQTT连接功能已完成！**

现在安卓终端可以：
- 通过本地MQTT broker连接到云平台
- 注册设备信息和规格
- 发送心跳和状态数据  
- 接收内容推送和命令
- 上报设备数据和响应结果

网站端管理功能：
- 实时查看设备连接状态
- 推送内容到指定设备
- 下发控制命令
- 监控设备健康状态
- 批量管理和广播功能

技术架构：
- 本地MQTT broker (Aedes) 监听1883端口
- 云平台后端集成MQTT服务
- 安卓终端直连本地服务器
- 支持局域网部署和公网端口转发
