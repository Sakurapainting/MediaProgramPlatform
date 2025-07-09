# 安卓设备本地MQTT服务器连接配置

## 🎯 目标
让安卓设备通过本地MQTT broker与云平台进行通信

## � 新架构说明

### 架构变更
- **旧架构**: 安卓设备 ←→ 公共MQTT服务器 ←→ 云平台后端
- **新架构**: 安卓设备 ←→ 云平台本地MQTT broker (1883端口)

### 优势
✅ **数据安全**: 本地部署，数据不出局域网
✅ **响应速度快**: 本地通信，延迟极低
✅ **完全控制**: 自主管理MQTT服务器配置
✅ **自定义扩展**: 支持认证、SSL等高级功能

## 🔧 配置步骤

### 1. 云平台服务器配置

**已内置MQTT broker**: 云平台自动启动Aedes broker，监听1883端口

1. **获取云平台服务器IP** (安卓设备需要此IP连接)
   ```bash
   # Windows
   ipconfig
   
   # Linux/Mac  
   ifconfig
   ```
   记录IPv4地址，例如：`192.168.1.100`

2. **确认端口开放**
   ```bash
   # 检查MQTT端口1883是否监听
   netstat -an | grep 1883
   
   # 检查API端口5001是否监听  
   netstat -an | grep 5001
   ```

### 2. 安卓设备网络配置

**需要配置的地址**:

1. **MQTT服务器配置**
   ```java
   // 连接本地MQTT broker
   String MQTT_BROKER_URL = "tcp://YOUR_SERVER_IP:1883";  // 改为云平台服务器IP
   String CLIENT_ID = "android_" + deviceId;
   ```

2. **云平台API配置**
   ```java
   String API_BASE_URL = "http://192.168.1.100:5001";  // 替换为实际服务器IP
   ```

### 3. 网络连通性测试

1. **测试本地MQTT broker连接**
   ```bash
   # 从云平台服务器本地测试
   telnet localhost 1883
   
   # 从安卓设备测试 (替换为实际服务器IP)
   telnet 192.168.1.100 1883
   ```

2. **测试云平台API访问**
   ```bash
   # 从安卓设备测试 (替换为实际服务器IP)
   curl http://192.168.1.100:5001/health
   ```

### 4. 防火墙配置 (云平台服务器端)

**Windows防火墙**:
1. 控制面板 → 系统和安全 → Windows Defender防火墙
2. 点击"高级设置"
3. 选择"入站规则" → "新建规则"
4. 选择"端口" → "TCP" → 输入"1883" (MQTT)
5. 再创建一个规则开放"5001" (API)
6. 选择"允许连接"

**Linux系统**:
```bash
sudo ufw allow 1883  # MQTT端口
sudo ufw allow 5001  # API端口
```

## 📱 安卓App配置示例

### 1. MainActivity.java 配置
```java
public class MqttConfig {
    // 本地MQTT broker配置
    public static final String MQTT_BROKER_URL = "tcp://192.168.1.100:1883";  // 云平台服务器IP
    public static final String CLIENT_ID_PREFIX = "android_screen_";
    
    // 云平台API配置 (替换为实际服务器IP)
    public static final String API_BASE_URL = "http://192.168.1.100:5001";
    
    // MQTT参数
    public static final int QOS = 1;
    public static final boolean CLEAN_SESSION = true;
    public static final int KEEP_ALIVE_INTERVAL = 60;
    public static final int CONNECTION_TIMEOUT = 30;
}
```

### 2. 网络权限配置
确保 `AndroidManifest.xml` 包含:
```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
```

### 3. MQTT连接代码示例
```java
private void connectToMqtt() {
    try {
        String clientId = MqttConfig.CLIENT_ID_PREFIX + getDeviceId();
        
        MqttConnectOptions options = new MqttConnectOptions();
        options.setCleanSession(MqttConfig.CLEAN_SESSION);
        options.setKeepAliveInterval(MqttConfig.KEEP_ALIVE_INTERVAL);
        options.setConnectionTimeout(MqttConfig.CONNECTION_TIMEOUT);
        
        mqttClient = new MqttAndroidClient(this, MqttConfig.MQTT_BROKER_URL, clientId);
        mqttClient.connect(options, new IMqttActionListener() {
            @Override
            public void onSuccess(IMqttToken asyncActionToken) {
                Log.d(TAG, "Connected to MQTT broker");
                subscribeToTopics();
            }
            
            @Override
            public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                Log.e(TAG, "Failed to connect to MQTT broker", exception);
            }
        });
    } catch (MqttException e) {
        Log.e(TAG, "MQTT connection error", e);
    }
}
```

# 测试HTTP API
curl http://YOUR_SERVER_IP:5001/health
```

### 4. 安卓设备配置

在安卓App的设置界面中配置：
- **MQTT服务器地址**: `YOUR_SERVER_IP` (例如：192.168.1.100)
- **MQTT端口**: `1883` (本地MQTT broker端口)

### 5. 修改安卓代码默认配置

在您的安卓项目中，修改以下文件：

**MqttService.java**:
```java
private static final String DEFAULT_BROKER_HOST = "YOUR_SERVER_IP"; // 替换为您的服务器IP
private static final int DEFAULT_BROKER_PORT = 1883; // 本地MQTT broker端口
```

**SettingsActivity.java** (loadCurrentSettings方法):
```java
brokerHostEditText.setText("YOUR_SERVER_IP"); // 替换为您的服务器IP
brokerPortEditText.setText("1883"); // MQTT端口
```

## 🌐 不同网络场景的配置

### 场景1: 局域网访问 (推荐)
- 安卓设备和服务器在同一WiFi网络
- 直接使用服务器的局域网IP (如192.168.1.100)
- 无需额外配置，数据安全可控

### 场景2: 跨网络访问 (需要端口转发)
- 安卓设备通过4G/5G或其他WiFi访问
- 需要配置路由器端口转发：外部1883 → 内部服务器1883
- 使用路由器的公网IP地址

### 场景3: 云服务器部署
- 将云平台部署到阿里云、腾讯云等
- 配置安全组开放端口1883和5001
- 使用云服务器的公网IP

## 🧪 测试步骤

1. **启动云平台服务** (自动启动本地MQTT broker):
   ```bash
   cd server
   npm run dev
   ```

2. **运行网络检查**:
   ```bash
   # Windows
   network-check.bat
   
   # Linux/Mac  
   ./network-check.sh
   ```

3. **运行MQTT测试**:
   ```bash
   node test-mqtt-quick.js
   ```

4. **安卓设备测试**:
   - 配置MQTT服务器地址为您的服务器IP
   - 启动安卓App
   - 检查连接状态

## 🔒 安全建议

### 生产环境配置
1. **SSL/TLS加密**: 使用MQTTS (端口8883)
2. **用户认证**: 配置MQTT用户名密码
3. **IP白名单**: 限制允许连接的IP段
4. **域名解析**: 使用域名代替IP地址

### 示例SSL配置
```typescript
// 在mqttService.ts中添加SSL支持
import tls from 'tls';
import fs from 'fs';

const options = {
  key: fs.readFileSync('path/to/server-key.pem'),
  cert: fs.readFileSync('path/to/server-cert.pem')
};

this.server = tls.createServer(options, this.aedes.handle);
```

## 📞 故障排除

### 常见问题

1. **连接超时**
   - 检查防火墙设置 (端口1883和5001)
   - 确认IP地址正确
   - 测试网络连通性: `telnet YOUR_SERVER_IP 1883`

2. **连接被拒绝**
   - 确认MQTT broker已启动
   - 检查端口1883是否被占用: `netstat -an | grep 1883`
   - 查看服务器日志

3. **频繁断线**
   - 检查网络稳定性
   - 调整心跳间隔
   - 启用自动重连

### 日志查看
```bash
# 查看云平台服务日志
tail -f server/logs/app.log

# 查看系统端口占用
netstat -tuln | grep 1883
```

---

**完成以上配置后，安卓设备就可以通过本地MQTT broker连接到您的云平台了！** 🚀

新架构优势：
- 🏠 本地部署，数据安全可控
- ⚡ 局域网通信，延迟极低
- 🔧 自主管理，支持自定义扩展
- 📱 支持多安卓设备同时连接
