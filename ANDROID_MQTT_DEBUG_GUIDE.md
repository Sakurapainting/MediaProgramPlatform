# Android MQTT 设备注册调试指南

## ❌ 当前问题分析

**问题**: 安卓APP连接到MQTT服务器(localhost:1883)后，设备没有在云平台的设备管理界面中显示。

**诊断结果**: 
- ✅ MQTT服务器正在运行 (端口1883)
- ✅ 云平台API服务器正在运行 (端口5001)  
- ✅ 已有测试设备成功注册并显示在管理界面
- ❌ 您的安卓APP可能存在以下问题

## 🔍 最可能的原因

### 1. **MQTT服务器地址错误**
**症状**: APP使用`localhost`或`127.0.0.1`作为MQTT服务器地址
**原因**: `localhost`只能连接本机，安卓设备无法连接到服务器

```java
// ❌ 错误配置
String MQTT_BROKER_URL = "tcp://localhost:1883";

// ✅ 正确配置 - 使用服务器实际IP
String MQTT_BROKER_URL = "tcp://192.168.80.1:1883";  // 替换为您的服务器IP
```

### 2. **没有发送注册消息**
**症状**: MQTT连接成功但设备未注册
**原因**: 仅连接MQTT不足以注册设备，必须发送注册消息

### 3. **注册消息格式错误**
**症状**: 发送了消息但服务器无法识别
**原因**: 消息格式不符合服务器要求

## 🔧 解决步骤

### 步骤1: 检查MQTT服务器地址

**正确的配置示例:**
```java
// ❌ 错误配置 - 安卓设备无法连接
String MQTT_BROKER_URL = "tcp://localhost:1883";

// ✅ 正确配置 - 使用服务器实际IP
String MQTT_BROKER_URL = "tcp://192.168.80.1:1883";  // 替换为您的服务器IP
String CLIENT_ID = "android_" + android.provider.Settings.Secure.getString(
    getContentResolver(), android.provider.Settings.Secure.ANDROID_ID);
```

### 步骤2: 正确的设备注册消息格式

**服务器期望的消息格式:**
```java
// 发布主题: device/register
JSONObject registerMessage = new JSONObject();
registerMessage.put("action", "register");
registerMessage.put("deviceId", deviceId);
registerMessage.put("deviceType", "android_screen");
registerMessage.put("timestamp", new Date().toISOString());

JSONObject metadata = new JSONObject();
metadata.put("version", "1.0.0");
metadata.put("platform", "android");
metadata.put("resolution", "1920x1080");
metadata.put("location", "设备位置");
metadata.put("address", "设备地址");
metadata.put("region", "区域");
metadata.put("city", "城市");

JSONObject coordinates = new JSONObject();
coordinates.put("latitude", 39.9042);
coordinates.put("longitude", 116.4074);
metadata.put("coordinates", coordinates);

metadata.put("size", "设备尺寸");
metadata.put("orientation", "horizontal");

registerMessage.put("metadata", metadata);
```

### 步骤3: 正确的主题订阅

**必须订阅的确认主题:**
```java
// 在MQTT连接成功后立即订阅
String confirmTopic = "device/" + CLIENT_ID + "/register/confirm";
String errorTopic = "device/" + CLIENT_ID + "/register/error";

mqttClient.subscribe(confirmTopic, 1);
mqttClient.subscribe(errorTopic, 1);
```

### 步骤4: 完整的注册流程

```java
mqttClient.connect(options, null, new IMqttActionListener() {
    @Override
    public void onSuccess(IMqttToken asyncActionToken) {
        Log.d("MQTT", "连接成功");
        try {
            // 1. 先订阅确认主题
            String confirmTopic = "device/" + CLIENT_ID + "/register/confirm";
            String errorTopic = "device/" + CLIENT_ID + "/register/error";
            
            mqttClient.subscribe(confirmTopic, 1);
            mqttClient.subscribe(errorTopic, 1);
            
            // 2. 发送注册消息
            JSONObject registerMsg = createRegistrationMessage();
            
            // 3. 发布到正确主题
            String topic = "device/register";
            MqttMessage message = new MqttMessage(registerMsg.toString().getBytes());
            message.setQos(1);
            mqttClient.publish(topic, message);
            
            Log.d("MQTT", "注册消息已发送");
            
        } catch (Exception e) {
            Log.e("MQTT", "注册失败: " + e.getMessage());
        }
    }

    @Override
    public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
        Log.e("MQTT", "连接失败: " + exception.getMessage());
    }
});
``` 
      "latitude": 39.9042, 
      "longitude": 116.4074 
    }
  }
}
```

### 4. Android MQTT客户端代码示例

```java
import org.eclipse.paho.client.mqttv3.*;

public class MQTTManager {
    private static final String BROKER_URL = "tcp://192.168.80.1:1883";
    private static final String CLIENT_ID = "android_" + Build.SERIAL;
    
    private MqttClient mqttClient;
    
    public void connect() {
        try {
            mqttClient = new MqttClient(BROKER_URL, CLIENT_ID, new MemoryPersistence());
            
            MqttConnectOptions options = new MqttConnectOptions();
            options.setCleanSession(true);
            options.setKeepAliveInterval(60);
            
            mqttClient.setCallback(new MqttCallback() {
                @Override
                public void connectionLost(Throwable cause) {
                    Log.e("MQTT", "Connection lost", cause);
                }
                
                @Override
                public void messageArrived(String topic, MqttMessage message) {
                    String payload = new String(message.getPayload());
                    Log.d("MQTT", "Message received [" + topic + "]: " + payload);
                    
                    // 处理注册确认消息
                    if (topic.equals("device/" + CLIENT_ID + "/register/confirm")) {
                        handleRegistrationConfirm(payload);
                    }
                }
                
                @Override
                public void deliveryComplete(IMqttDeliveryToken token) {}
            });
            
            mqttClient.connect(options);
            Log.d("MQTT", "Connected successfully");
            
            // 连接成功后订阅主题
            subscribeToTopics();
            
            // 发送设备注册消息
            registerDevice();
            
        } catch (MqttException e) {
            Log.e("MQTT", "Connection failed", e);
        }
    }
    
    private void subscribeToTopics() throws MqttException {
        String[] topics = {
            "device/" + CLIENT_ID + "/content",
            "device/" + CLIENT_ID + "/command", 
            "device/" + CLIENT_ID + "/register/confirm",
            "device/" + CLIENT_ID + "/register/error",
            "broadcast/all"
        };
        
        for (String topic : topics) {
            mqttClient.subscribe(topic, 1);
            Log.d("MQTT", "Subscribed to: " + topic);
        }
    }
    
    private void registerDevice() {
        try {
            JSONObject registration = new JSONObject();
            registration.put("action", "register");
            registration.put("deviceId", getDeviceId());
            registration.put("deviceType", "android_screen");
            registration.put("timestamp", new Date().toISOString());
            
            JSONObject metadata = new JSONObject();
            metadata.put("version", "1.0.0");
            metadata.put("platform", "android");
            metadata.put("resolution", getScreenResolution());
            metadata.put("location", "您的位置");
            metadata.put("address", "您的地址");
            metadata.put("region", "您的区域");
            metadata.put("city", "您的城市");
            
            JSONObject coordinates = new JSONObject();
            coordinates.put("latitude", 39.9042);
            coordinates.put("longitude", 116.4074);
            metadata.put("coordinates", coordinates);
            
            registration.put("metadata", metadata);
            
            MqttMessage message = new MqttMessage(registration.toString().getBytes());
            message.setQos(1);
            
            mqttClient.publish("device/register", message);
            Log.d("MQTT", "Registration message sent");
            
        } catch (Exception e) {
            Log.e("MQTT", "Failed to send registration", e);
        }
    }
    
    private void handleRegistrationConfirm(String payload) {
        try {
            JSONObject response = new JSONObject(payload);
            String status = response.getString("status");
            String message = response.getString("message");
            
            if ("success".equals(status)) {
                Log.d("MQTT", "Registration successful: " + message);
                // 注册成功，开始发送心跳
                startHeartbeat();
            } else {
                Log.e("MQTT", "Registration failed: " + message);
            }
        } catch (Exception e) {
            Log.e("MQTT", "Failed to parse registration response", e);
        }
    }
    
    private void startHeartbeat() {
        // 每30秒发送一次心跳
        Timer timer = new Timer();
        timer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                sendHeartbeat();
            }
        }, 0, 30000);
    }
    
    private void sendHeartbeat() {
        try {
            JSONObject heartbeat = new JSONObject();
            heartbeat.put("action", "heartbeat");
            heartbeat.put("deviceId", getDeviceId());
            heartbeat.put("timestamp", new Date().toISOString());
            heartbeat.put("status", "online");
            
            MqttMessage message = new MqttMessage(heartbeat.toString().getBytes());
            message.setQos(1);
            
            mqttClient.publish("device/heartbeat", message);
            Log.d("MQTT", "Heartbeat sent");
            
        } catch (Exception e) {
            Log.e("MQTT", "Failed to send heartbeat", e);
        }
    }
    
    private String getDeviceId() {
        // 生成唯一的设备ID
        return "android_" + Build.SERIAL + "_" + System.currentTimeMillis();
    }
    
    private String getScreenResolution() {
        DisplayMetrics metrics = getResources().getDisplayMetrics();
        return metrics.widthPixels + "x" + metrics.heightPixels;
    }
}
```

## 🔧 调试工具

### 1. 使用MQTT客户端工具测试

推荐使用MQTTX或MQTT.fx工具测试连接：

**连接参数**:
- Host: 192.168.80.1
- Port: 1883
- Client ID: test_client_debug

**测试发送注册消息**:
主题: `device/register`
消息: (使用上面的JSON格式)

### 2. 查看服务器日志

运行以下命令查看实时日志：
```bash
# 查看MQTT连接日志
tail -f server_logs.log | grep MQTT

# 或者直接观察控制台输出
```

### 3. API状态检查

```bash
# 登录获取token
curl -X POST http://192.168.80.1:5001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"123456"}'

# 查询MQTT状态
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://192.168.80.1:5001/api/mqtt/status

# 查询设备列表
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://192.168.80.1:5001/api/devices
```

## ✅ 验证步骤

1. **检查网络连通性**: Android设备能ping通服务器IP
2. **MQTT连接成功**: 在服务器日志中看到"MQTT client connected"
3. **注册消息发送**: 在服务器日志中看到"Processing device registration"
4. **注册成功确认**: Android应用收到register/confirm消息
5. **设备出现在管理界面**: 在云平台设备管理界面中看到设备

## 🚨 常见问题

### 问题1: 连接超时
- **原因**: 网络不通或防火墙阻挡
- **解决**: 检查网络连接，开放1883端口

### 问题2: 连接成功但没有注册
- **原因**: 没有发送注册消息或消息格式错误
- **解决**: 检查注册消息的JSON格式和发布主题

### 问题3: 注册失败
- **原因**: 设备ID重复或数据库连接问题
- **解决**: 使用唯一的设备ID，检查MongoDB连接

### 问题4: 设备显示离线
- **原因**: 没有发送心跳消息
- **解决**: 实现定期心跳机制（每30秒）

## 📱 Android权限配置

确保在AndroidManifest.xml中添加必要权限：

```xml
<uses-permission android:name="android.permission.INTERNET" />
<uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
<uses-permission android:name="android.permission.ACCESS_WIFI_STATE" />
<uses-permission android:name="android.permission.READ_PHONE_STATE" />
```

## 🔍 最终检查清单

- [ ] 服务器IP地址正确（不是localhost）
- [ ] MQTT端口1883可访问
- [ ] 注册消息格式正确
- [ ] 发布到正确主题（device/register）
- [ ] 订阅确认主题（device/{CLIENT_ID}/register/confirm）
- [ ] 实现心跳机制
- [ ] 处理注册响应消息
- [ ] 设备ID唯一且有效

完成以上步骤后，您的Android设备应该会在云平台设备管理界面中正确显示。
