/**
 * Android MQTT设备注册示例代码
 * 这是您的安卓应用需要实现的MQTT连接和设备注册逻辑
 */

// 安卓端MQTT配置
public class MQTTConfig {
    private static final String DEFAULT_MQTT_SERVER = "192.168.80.1";
    private static final int DEFAULT_MQTT_PORT = 1883;
    private static final String DEVICE_ID = "debug_device_001";
    private static final String CLIENT_ID = "debug_client_001";
    
    // MQTT主题
    public static final String TOPIC_REGISTER = "device/register";
    public static final String TOPIC_HEARTBEAT = "device/heartbeat";
    public static final String TOPIC_STATUS = "device/status";
    public static final String TOPIC_CONTENT_PREFIX = "device/" + CLIENT_ID + "/content";
    public static final String TOPIC_COMMAND_PREFIX = "device/" + CLIENT_ID + "/command";
    public static final String TOPIC_BROADCAST = "broadcast/all";
}

// 设备注册消息示例
public class DeviceRegistration {
    
    public static JSONObject createRegistrationMessage() throws JSONException {
        JSONObject registration = new JSONObject();
        registration.put("action", "register");
        registration.put("deviceId", MQTTConfig.DEVICE_ID);
        registration.put("deviceType", "android_screen");
        registration.put("timestamp", new Date().toISOString());
        
        // 设备元数据
        JSONObject metadata = new JSONObject();
        metadata.put("version", "1.0.0");
        metadata.put("platform", "android");
        metadata.put("resolution", "1920x1080");
        metadata.put("location", "测试位置");
        metadata.put("address", "测试地址");
        metadata.put("region", "华北");
        metadata.put("city", "北京");
        
        JSONObject coordinates = new JSONObject();
        coordinates.put("latitude", 39.9042);
        coordinates.put("longitude", 116.4074);
        metadata.put("coordinates", coordinates);
        
        registration.put("metadata", metadata);
        
        return registration;
    }
}

// MQTT连接和注册示例
public class MQTTDeviceManager {
    private MqttAndroidClient mqttClient;
    private boolean isConnected = false;
    
    public void connectAndRegister() {
        try {
            String serverUri = "tcp://" + MQTTConfig.DEFAULT_MQTT_SERVER + ":" + MQTTConfig.DEFAULT_MQTT_PORT;
            mqttClient = new MqttAndroidClient(context, serverUri, MQTTConfig.CLIENT_ID);
            
            MqttConnectOptions options = new MqttConnectOptions();
            options.setKeepAliveInterval(60);
            options.setCleanSession(true);
            options.setConnectionTimeout(30);
            
            mqttClient.setCallback(new MqttCallback() {
                @Override
                public void connectionLost(Throwable cause) {
                    Log.e("MQTT", "连接丢失: " + cause.getMessage());
                    isConnected = false;
                }
                
                @Override
                public void messageArrived(String topic, MqttMessage message) throws Exception {
                    Log.d("MQTT", "收到消息 [" + topic + "]: " + new String(message.getPayload()));
                    handleIncomingMessage(topic, new String(message.getPayload()));
                }
                
                @Override
                public void deliveryComplete(IMqttDeliveryToken token) {
                    Log.d("MQTT", "消息发送完成");
                }
            });
            
            mqttClient.connect(options, null, new IMqttActionListener() {
                @Override
                public void onSuccess(IMqttToken asyncActionToken) {
                    Log.d("MQTT", "MQTT连接成功");
                    isConnected = true;
                    
                    // 连接成功后立即注册设备
                    registerDevice();
                    
                    // 订阅相关主题
                    subscribeToTopics();
                    
                    // 启动心跳
                    startHeartbeat();
                }
                
                @Override
                public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                    Log.e("MQTT", "MQTT连接失败: " + exception.getMessage());
                    isConnected = false;
                }
            });
            
        } catch (MqttException e) {
            Log.e("MQTT", "MQTT初始化失败: " + e.getMessage());
        }
    }
    
    private void registerDevice() {
        try {
            JSONObject registrationMessage = DeviceRegistration.createRegistrationMessage();
            publishMessage(MQTTConfig.TOPIC_REGISTER, registrationMessage.toString());
            Log.d("MQTT", "设备注册消息已发送");
        } catch (Exception e) {
            Log.e("MQTT", "设备注册失败: " + e.getMessage());
        }
    }
    
    private void subscribeToTopics() {
        try {
            // 订阅设备专用主题
            String[] topics = {
                MQTTConfig.TOPIC_CONTENT_PREFIX,
                MQTTConfig.TOPIC_COMMAND_PREFIX,
                MQTTConfig.TOPIC_BROADCAST,
                "device/" + MQTTConfig.CLIENT_ID + "/register/confirm",
                "device/" + MQTTConfig.CLIENT_ID + "/register/error"
            };
            
            for (String topic : topics) {
                mqttClient.subscribe(topic, 1);
                Log.d("MQTT", "订阅主题: " + topic);
            }
        } catch (MqttException e) {
            Log.e("MQTT", "主题订阅失败: " + e.getMessage());
        }
    }
    
    private void startHeartbeat() {
        // 每30秒发送一次心跳
        Timer heartbeatTimer = new Timer();
        heartbeatTimer.scheduleAtFixedRate(new TimerTask() {
            @Override
            public void run() {
                if (isConnected) {
                    sendHeartbeat();
                }
            }
        }, 0, 30000);
    }
    
    private void sendHeartbeat() {
        try {
            JSONObject heartbeat = new JSONObject();
            heartbeat.put("action", "heartbeat");
            heartbeat.put("deviceId", MQTTConfig.DEVICE_ID);
            heartbeat.put("timestamp", new Date().toISOString());
            heartbeat.put("status", "online");
            
            publishMessage(MQTTConfig.TOPIC_HEARTBEAT, heartbeat.toString());
            Log.d("MQTT", "心跳已发送");
        } catch (Exception e) {
            Log.e("MQTT", "心跳发送失败: " + e.getMessage());
        }
    }
    
    private void publishMessage(String topic, String message) {
        try {
            if (isConnected && mqttClient != null) {
                MqttMessage mqttMessage = new MqttMessage(message.getBytes());
                mqttMessage.setQos(1);
                mqttClient.publish(topic, mqttMessage);
            }
        } catch (MqttException e) {
            Log.e("MQTT", "消息发布失败: " + e.getMessage());
        }
    }
    
    private void handleIncomingMessage(String topic, String message) {
        try {
            JSONObject jsonMessage = new JSONObject(message);
            
            if (topic.contains("/register/confirm")) {
                Log.d("MQTT", "设备注册确认: " + jsonMessage.getString("message"));
            } else if (topic.contains("/register/error")) {
                Log.e("MQTT", "设备注册错误: " + jsonMessage.getString("message"));
            } else if (topic.contains("/content")) {
                Log.d("MQTT", "收到内容推送: " + jsonMessage.toString());
                // 处理内容推送
                handleContentPush(jsonMessage);
            } else if (topic.equals(MQTTConfig.TOPIC_BROADCAST)) {
                Log.d("MQTT", "收到广播消息: " + jsonMessage.toString());
                // 处理广播消息
                handleBroadcast(jsonMessage);
            }
        } catch (JSONException e) {
            Log.e("MQTT", "消息解析失败: " + e.getMessage());
        }
    }
    
    private void handleContentPush(JSONObject content) {
        // 实现内容推送处理逻辑
        Log.d("MQTT", "处理内容推送");
        
        // 发送确认消息
        try {
            JSONObject response = new JSONObject();
            response.put("action", "content_response");
            response.put("contentId", content.optString("contentId"));
            response.put("status", "received");
            response.put("timestamp", new Date().toISOString());
            
            publishMessage(MQTTConfig.TOPIC_STATUS, response.toString());
        } catch (Exception e) {
            Log.e("MQTT", "内容确认发送失败: " + e.getMessage());
        }
    }
    
    private void handleBroadcast(JSONObject broadcast) {
        // 实现广播消息处理逻辑
        Log.d("MQTT", "处理广播消息");
    }
}
