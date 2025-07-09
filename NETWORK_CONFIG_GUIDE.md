# 本地MQTT服务器网络配置指南

## 🏠 本地MQTT服务器架构

### 架构说明
- **MQTT服务器**: 本地Aedes broker (集成在云平台后端)
- **云平台**: 内置MQTT broker服务，监听1883端口
- **安卓终端**: 直连云平台服务器的MQTT端口
- **通信方式**: 局域网或端口转发访问

```
安卓设备 ←→ 云平台服务器:1883 (本地MQTT broker)
              ↓
         云平台后端 (API:5001)
```

### 配置优势
✅ **数据安全**: 本地部署，数据不出局域网
✅ **响应速度**: 本地通信，延迟极低
✅ **完全控制**: 自主管理MQTT服务器
✅ **自定义扩展**: 支持认证、SSL等高级配置

## 🔧 网络配置步骤

### 步骤一: 云平台服务器配置

**必需开放端口**: 1883 (MQTT) 和 5001 (API)

1. **Windows防火墙配置**
   ```powershell
   # 开放MQTT端口1883
   New-NetFirewallRule -DisplayName "MQTT Server" -Direction Inbound -Protocol TCP -LocalPort 1883 -Action Allow
   
   # 开放API端口5001
   New-NetFirewallRule -DisplayName "Media Platform API" -Direction Inbound -Protocol TCP -LocalPort 5001 -Action Allow
   ```

2. **Linux防火墙配置**
   ```bash
   # Ubuntu/Debian (ufw)
   sudo ufw allow 1883
   sudo ufw allow 5001
   
   # CentOS/RHEL (firewalld)
   sudo firewall-cmd --permanent --add-port=1883/tcp
   sudo firewall-cmd --permanent --add-port=5001/tcp
   sudo firewall-cmd --reload
   
   # 使用iptables
   sudo iptables -A INPUT -p tcp --dport 1883 -j ACCEPT
   sudo iptables -A INPUT -p tcp --dport 5001 -j ACCEPT
   ```

### 步骤二: 网络连通性测试

1. **测试本地MQTT服务器连接**
   ```bash
   # 从云平台服务器本地测试
   telnet localhost 1883
   
   # 从安卓设备测试 (替换为实际服务器IP)
   telnet YOUR_SERVER_IP 1883
   ```

2. **测试云平台API访问**
   ```bash
   # 从安卓设备测试 (替换为实际服务器IP)
   curl http://YOUR_SERVER_IP:5001/health
   ```

### 步骤三: 安卓端配置

1. **MQTT服务器配置**
   ```java
   // 安卓App中的MQTT配置 - 连接本地MQTT broker
   String MQTT_BROKER_URL = "tcp://YOUR_SERVER_IP:1883";  // 云平台服务器IP
   String CLIENT_ID = "android_" + deviceId;
   ```

2. **云平台API配置**
   ```java
   // 云平台API配置 (替换为实际服务器IP)
   String API_BASE_URL = "http://YOUR_SERVER_IP:5001";
   ```

3. **网络权限确认**
   确保 `AndroidManifest.xml` 包含:
   ```xml
   <uses-permission android:name="android.permission.INTERNET" />
   <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
   ```

## 🧪 连接测试

### 1. 云平台连接测试
```bash
# 启动云平台服务 (自动启动本地MQTT broker)
npm run dev

# 查看MQTT broker状态
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5001/api/mqtt/status
```

### 2. 本地MQTT broker测试
```bash
# 使用MQTT客户端工具测试本地broker
mosquitto_pub -h YOUR_SERVER_IP -p 1883 -t "test/topic" -m "hello"
mosquitto_sub -h YOUR_SERVER_IP -p 1883 -t "test/topic"

# 本地测试
mosquitto_pub -h localhost -p 1883 -t "test/topic" -m "hello"
mosquitto_sub -h localhost -p 1883 -t "test/topic"
```

### 3. 端到端测试
运行快速测试脚本:
```bash
node test-mqtt-quick.js
```

在安卓设备上测试连接:
```bash
# 使用MQTT客户端App测试
# 服务器: YOUR_SERVER_IP
# 端口: 1883
# 或使用网络工具ping服务器IP
```

## 🔒 安全配置

### 1. 防火墙规则(生产环境)

```bash
# 只允许特定IP段访问MQTT端口
iptables -A INPUT -p tcp -s 192.168.1.0/24 --dport 1883 -j ACCEPT
iptables -A INPUT -p tcp --dport 1883 -j DROP

# 允许API端口
iptables -A INPUT -p tcp -s 192.168.1.0/24 --dport 5001 -j ACCEPT
```

### 2. MQTT认证(可选)

修改 `mqttService.ts` 添加用户名密码验证:
```typescript
this.aedes.authenticate = (client, username, password, callback) => {
  if (username === 'android_user' && password.toString() === 'secure_password') {
    callback(null, true);
  } else {
    callback(new Error('认证失败'), false);
  }
};
```

### 3. SSL/TLS加密(生产环境推荐)

```typescript
import tls from 'tls';
import fs from 'fs';

// 使用TLS服务器
const options = {
  key: fs.readFileSync('server-key.pem'),
  cert: fs.readFileSync('server-cert.pem')
};

this.server = tls.createServer(options, this.aedes.handle);
```

## 📋 常见问题

### Q1: 安卓设备无法连接MQTT
**解决**: 
1. 检查服务器IP是否正确
2. 确认防火墙1883端口开放
3. 测试网络连通性：`telnet YOUR_SERVER_IP 1883`

### Q2: 连接频繁断开
**解决**:
1. 检查网络稳定性
2. 调整心跳间隔
3. 启用自动重连

### Q3: 内网可以连接，外网无法连接
**解决**:
1. 配置路由器端口转发 (1883 -> 云平台服务器:1883)
2. 检查公网IP是否正确
3. 确认ISP是否屏蔽端口

### Q4: MQTT broker无法启动
**解决**:
1. 检查1883端口是否被占用: `netstat -an | grep 1883`
2. 确认没有其他MQTT服务运行
3. 检查权限是否足够

## 🧪 测试命令

### 1. 快速连通性测试
```bash
# 测试MQTT端口
telnet YOUR_SERVER_IP 1883

# 测试HTTP API
curl http://YOUR_SERVER_IP:5001/health
```

### 2. MQTT客户端测试
```bash
# 使用mosquitto客户端
mosquitto_sub -h YOUR_SERVER_IP -p 1883 -t "test/topic"
mosquitto_pub -h YOUR_SERVER_IP -p 1883 -t "test/topic" -m "Hello MQTT"
```

### 3. 网络诊断
```bash
# 检查路由
traceroute YOUR_SERVER_IP

# 检查DNS解析
nslookup YOUR_DOMAIN_NAME

# 检查端口开放
nmap -p 1883,5001 YOUR_SERVER_IP
```

## 🌍 公网访问配置 (可选)

如需从公网访问本地MQTT服务器，需要配置端口转发：

### 路由器端口转发
1. 登录路由器管理界面
2. 找到"端口转发"或"虚拟服务器"设置
3. 添加转发规则：
   - 外部端口: 1883 → 内部IP:1883 (MQTT)
   - 外部端口: 5001 → 内部IP:5001 (API)

### 动态DNS配置 (可选)
1. 申请动态DNS服务 (如花生壳、No-IP)
2. 配置域名指向公网IP
3. 在安卓App中使用域名连接

## 🚀 部署检查清单

- [ ] 云平台服务器MQTT broker正常启动 (端口1883)
- [ ] 防火墙开放端口 1883 和 5001  
- [ ] 获取正确的服务器IP地址
- [ ] 配置路由器端口转发(如需公网访问)
- [ ] 安卓App配置正确的服务器地址
- [ ] 测试MQTT连接正常: `telnet YOUR_SERVER_IP 1883`
- [ ] 测试HTTP API访问正常: `curl http://YOUR_SERVER_IP:5001/health`
- [ ] 运行端到端测试: `node test-mqtt-quick.js`

---

**✅ 本地MQTT服务器网络配置完成!**

现在您拥有：
- 本地部署的MQTT broker，数据安全可控
- 局域网内高速通信
- 支持公网端口转发扩展
- 完整的安卓终端连接能力
- [ ] 验证设备注册和心跳功能

---

**完成以上配置后，安卓设备就可以从任何网络连接到您的MQTT服务器了！** 🎉
