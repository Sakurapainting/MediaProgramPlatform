# MQTT服务器架构迁移说明

## 📋 迁移概览

### 迁移前架构 (Local Broker)
```
安卓设备 ←→ 云平台MQTT Broker (端口1884) ←→ 云平台后端
```

### 迁移后架构 (Public Broker)
```
安卓设备 ←→ broker.emqx.io:1883 ←→ 云平台客户端
```

## 🔄 架构变更详情

### 变更前 (本地Aedes Broker)
- **MQTT服务器**: 云平台内置Aedes broker
- **端口**: 1884 (自定义端口)
- **网络要求**: 需要开放防火墙端口，配置端口转发
- **部署复杂度**: 较高，需要网络配置

### 变更后 (公共MQTT Broker)
- **MQTT服务器**: broker.emqx.io (公共免费服务器)
- **端口**: 1883 (标准MQTT端口)
- **网络要求**: 仅需互联网连接
- **部署复杂度**: 极低，即插即用

## 🛠️ 代码变更说明

### 1. 云平台后端变更

#### `server/src/services/mqttService.ts`
- **变更前**: Aedes broker服务器实现
- **变更后**: MQTT客户端实现，连接到broker.emqx.io

#### 主要变更点:
```typescript
// 变更前
const aedes = require('aedes')();
const server = require('net').createServer(aedes.handle);

// 变更后  
const mqtt = require('mqtt');
const client = mqtt.connect('mqtt://broker.emqx.io:1883');
```

### 2. 环境变量变更

#### `server/.env`
```env
# 变更前
MQTT_PORT=1884

# 变更后
MQTT_BROKER_URL=mqtt://broker.emqx.io:1883
```

### 3. 安卓端配置变更

```java
// 变更前
String MQTT_BROKER_URL = "tcp://YOUR_SERVER_IP:1884";

// 变更后
String MQTT_BROKER_URL = "tcp://broker.emqx.io:1883";
```

## 📊 优势对比

| 特性 | 本地Broker | 公共Broker |
|------|------------|------------|
| 网络配置 | 复杂 | 简单 |
| 防火墙要求 | 需要开放端口 | 无需配置 |
| 跨网络通信 | 需要端口转发 | 原生支持 |
| 部署难度 | 中等 | 极低 |
| 维护成本 | 较高 | 极低 |
| 数据隐私 | 高 | 中等 |
| 服务稳定性 | 依赖自维护 | 专业运维 |

## 🔧 迁移后的网络要求

### 云平台服务器
- ✅ 能够访问互联网 (连接broker.emqx.io)
- ✅ 开放5001端口 (仅针对安卓设备的API访问)
- ❌ 无需开放MQTT端口1884

### 安卓设备
- ✅ 能够访问互联网 (连接broker.emqx.io)
- ✅ 能够访问云平台API (云平台IP:5001)
- ❌ 无需特殊网络配置

## 🧪 测试验证

### 1. 运行网络检查脚本
```bash
# Windows
.\network-check.bat

# Linux/Mac
chmod +x network-check.sh
./network-check.sh
```

### 2. 运行快速测试
```bash
node test-mqtt-quick.js
```

### 3. 验证MQTT连接
```bash
# 使用mosquitto客户端测试
mosquitto_pub -h broker.emqx.io -p 1883 -t "test/topic" -m "hello"
mosquitto_sub -h broker.emqx.io -p 1883 -t "test/topic"
```

## 📱 安卓端配置清单

### 必需配置项
1. **MQTT服务器**: `broker.emqx.io`
2. **MQTT端口**: `1883`
3. **云平台API**: `http://YOUR_SERVER_IP:5001`

### 配置示例代码
```java
public class MqttConfig {
    public static final String MQTT_BROKER_URL = "tcp://broker.emqx.io:1883";
    public static final String API_BASE_URL = "http://192.168.1.100:5001"; // 替换为实际IP
    public static final int QOS = 1;
    public static final boolean CLEAN_SESSION = true;
}
```

## 🔒 安全注意事项

### 公共MQTT服务器使用建议
1. **数据加密**: 重要数据应在应用层加密
2. **主题命名**: 使用唯一标识符避免冲突
3. **消息大小**: 控制消息大小，避免影响性能
4. **生产环境**: 考虑使用私有MQTT服务器或TLS加密

### 建议的主题命名规范
```
device/{deviceId}/register    # 设备注册
device/{deviceId}/heartbeat   # 心跳上报
device/{deviceId}/status      # 状态上报
device/{deviceId}/content/push # 内容推送
device/{deviceId}/command     # 命令下发
device/{deviceId}/log         # 日志上报
```

## 📋 迁移完成检查清单

- [x] 云平台MQTT服务重构为客户端模式
- [x] 更新环境变量配置
- [x] 更新网络检查脚本
- [x] 更新快速测试脚本
- [x] 更新集成文档
- [x] 更新网络配置指南
- [ ] 安卓端MQTT配置适配
- [ ] 端到端功能测试
- [ ] 部署验证

## 💡 后续建议

1. **安卓端适配**: 确保安卓App配置为broker.emqx.io
2. **端到端测试**: 完整测试云平台与安卓端的MQTT通信
3. **性能优化**: 根据实际使用情况优化连接参数
4. **安全加固**: 考虑添加消息加密和认证机制
5. **监控告警**: 添加MQTT连接状态监控

## 🔗 相关文档

- [MQTT安卓集成文档](./MQTT_ANDROID_INTEGRATION.md)
- [网络配置指南](./NETWORK_CONFIG_GUIDE.md)
- [安卓网络设置](./ANDROID_NETWORK_SETUP.md)
