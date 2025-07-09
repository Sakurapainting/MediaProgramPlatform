package com.mediaplatform.android.service;

import android.app.Service;
import android.content.Context;
import android.content.Intent;
import android.os.Binder;
import android.os.Handler;
import android.os.IBinder;
import android.os.Looper;
import android.widget.Toast;

import com.mediaplatform.android.model.*;
import com.mediaplatform.android.utils.DeviceUtils;
import com.mediaplatform.android.utils.Logger;
import com.mediaplatform.android.utils.PreferencesManager;

import org.eclipse.paho.client.mqttv3.*;
import org.eclipse.paho.client.mqttv3.persist.MemoryPersistence;
import org.json.JSONException;
import org.json.JSONObject;

import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

/**
 * MQTT连接和消息处理服务
 * 负责与云平台的MQTT通信、设备注册、心跳、内容处理等核心功能
 * 更新为使用EMQX公共服务器: broker.emqx.io
 */
public class MqttService extends Service implements MqttCallback {
    private static final String TAG = "MqttService";
    
    // MQTT配置常量 - 使用EMQX公共服务器
    private static final String DEFAULT_BROKER_HOST = "broker.emqx.io"; // EMQX公共MQTT服务器
    private static final int DEFAULT_BROKER_PORT = 1883; // 标准MQTT端口
    private static final int QOS = 1;
    private static final boolean CLEAN_SESSION = true;
    private static final int KEEP_ALIVE_INTERVAL = 60; // 60秒
    private static final int CONNECTION_TIMEOUT = 30; // 30秒
    
    // 心跳和重连配置
    private static final long HEARTBEAT_INTERVAL = 30000; // 30秒心跳
    private static final long RECONNECT_DELAY = 5000; // 5秒重连延迟
    private static final int MAX_RECONNECT_ATTEMPTS = 10;
    
    // MQTT主题常量 - 添加项目前缀避免冲突
    private static final String TOPIC_PREFIX = "mediaplatform/"; // 主题前缀
    private String deviceRegistrationTopic;
    private String deviceHeartbeatTopic;
    private String deviceStatusTopic;
    private String deviceDataTopic;
    private String contentPushTopic;
    private String commandTopic;
    private String broadcastTopic;
    
    // 核心组件
    private MqttClient mqttClient;
    private PreferencesManager preferencesManager;
    private String deviceId;
    private String clientId;
    private Handler mainHandler;
    private ScheduledExecutorService heartbeatExecutor;
    
    // 连接状态
    private boolean isConnected = false;
    private boolean isRegistered = false;
    private int reconnectAttempts = 0;
    
    // 回调接口
    private MqttServiceCallback serviceCallback;
    
    public interface MqttServiceCallback {
        void onConnected();
        void onDisconnected();
        void onContentReceived(ContentPush content);
        void onCommandReceived(Command command);
        void onBroadcastReceived(String message);
        void onError(String error);
    }
    
    // Binder for Activity communication
    public class MqttServiceBinder extends Binder {
        public MqttService getService() {
            return MqttService.this;
        }
    }
    
    private final IBinder binder = new MqttServiceBinder();
    
    @Override
    public void onCreate() {
        super.onCreate();
        Logger.d(TAG, "MQTT Service created");
        
        preferencesManager = new PreferencesManager(this);
        mainHandler = new Handler(Looper.getMainLooper());
        heartbeatExecutor = Executors.newSingleThreadScheduledExecutor();
        
        // 初始化设备ID和主题
        initializeDevice();
        initializeTopics();
    }
    
    @Override
    public int onStartCommand(Intent intent, int flags, int startId) {
        Logger.d(TAG, "MQTT Service starting");
        connectToMqttBroker();
        return START_STICKY; // 服务被杀死后自动重启
    }
    
    @Override
    public IBinder onBind(Intent intent) {
        return binder;
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        Logger.d(TAG, "MQTT Service destroyed");
        cleanup();
    }
    
    /**
     * 初始化设备信息
     */
    private void initializeDevice() {
        deviceId = preferencesManager.getDeviceId();
        if (deviceId == null || deviceId.isEmpty()) {
            deviceId = DeviceUtils.generateDeviceId(this);
            preferencesManager.setDeviceId(deviceId);
        }
        
        clientId = "android_screen_" + deviceId;
        Logger.d(TAG, "Device ID: " + deviceId + ", Client ID: " + clientId);
    }
    
    /**
     * 初始化MQTT主题 - 添加项目前缀
     */
    private void initializeTopics() {
        deviceRegistrationTopic = TOPIC_PREFIX + "device/register";
        deviceHeartbeatTopic = TOPIC_PREFIX + "device/heartbeat";
        deviceStatusTopic = TOPIC_PREFIX + "device/status";
        deviceDataTopic = TOPIC_PREFIX + "device/data";
        contentPushTopic = TOPIC_PREFIX + "device/" + clientId + "/content";
        commandTopic = TOPIC_PREFIX + "device/" + clientId + "/command";
        broadcastTopic = TOPIC_PREFIX + "broadcast/all";
        
        Logger.d(TAG, "Topics initialized with prefix: " + TOPIC_PREFIX);
    }
    
    /**
     * 连接到MQTT代理服务器 - 使用EMQX公共服务器
     */
    private void connectToMqttBroker() {
        if (isConnected) {
            Logger.d(TAG, "Already connected to MQTT broker");
            return;
        }
        
        try {
            // 使用默认的EMQX服务器，也可以从配置中读取
            String brokerHost = preferencesManager.getBrokerHost();
            if (brokerHost == null || brokerHost.isEmpty()) {
                brokerHost = DEFAULT_BROKER_HOST;
                preferencesManager.setBrokerHost(brokerHost);
            }
            
            int brokerPort = preferencesManager.getBrokerPort();
            if (brokerPort <= 0) {
                brokerPort = DEFAULT_BROKER_PORT;
                preferencesManager.setBrokerPort(brokerPort);
            }
            
            String brokerUrl = "tcp://" + brokerHost + ":" + brokerPort;
            Logger.d(TAG, "Connecting to EMQX MQTT broker: " + brokerUrl);
            
            // 创建MQTT客户端
            mqttClient = new MqttClient(brokerUrl, clientId, new MemoryPersistence());
            mqttClient.setCallback(this);
            
            // 配置连接选项
            MqttConnectOptions connOpts = new MqttConnectOptions();
            connOpts.setCleanSession(CLEAN_SESSION);
            connOpts.setKeepAliveInterval(KEEP_ALIVE_INTERVAL);
            connOpts.setConnectionTimeout(CONNECTION_TIMEOUT);
            connOpts.setAutomaticReconnect(false); // 手动处理重连
            
            // 设置遗嘱消息（设备意外断开时发送）
            String willTopic = deviceStatusTopic;
            DeviceStatus offlineStatus = new DeviceStatus();
            offlineStatus.setDeviceId(deviceId);
            offlineStatus.setStatus("offline");
            offlineStatus.setTimestamp(System.currentTimeMillis());
            
            connOpts.setWill(willTopic, offlineStatus.toJson().getBytes(), QOS, false);
            
            // 异步连接
            mqttClient.connect(connOpts, null, new IMqttActionListener() {
                @Override
                public void onSuccess(IMqttToken asyncActionToken) {
                    mainHandler.post(() -> {
                        Logger.d(TAG, "Successfully connected to EMQX MQTT broker");
                        isConnected = true;
                        reconnectAttempts = 0;
                        
                        // 订阅主题
                        subscribeToTopics();
                        
                        // 注册设备
                        registerDevice();
                        
                        // 启动心跳
                        startHeartbeat();
                        
                        // 通知回调
                        if (serviceCallback != null) {
                            serviceCallback.onConnected();
                        }
                        
                        showToast("已连接到EMQX云平台");
                    });
                }
                
                @Override
                public void onFailure(IMqttToken asyncActionToken, Throwable exception) {
                    mainHandler.post(() -> {
                        Logger.e(TAG, "Failed to connect to EMQX MQTT broker", exception);
                        isConnected = false;
                        
                        if (serviceCallback != null) {
                            serviceCallback.onError("连接EMQX失败: " + exception.getMessage());
                        }
                        
                        showToast("连接EMQX云平台失败，正在重试...");
                        
                        // 自动重连
                        scheduleReconnect();
                    });
                }
            });
            
        } catch (Exception e) {
            Logger.e(TAG, "Error creating MQTT client", e);
            if (serviceCallback != null) {
                serviceCallback.onError("MQTT客户端创建失败: " + e.getMessage());
            }
            scheduleReconnect();
        }
    }
    
    /**
     * 订阅MQTT主题
     */
    private void subscribeToTopics() {
        if (!isConnected || mqttClient == null) {
            return;
        }
        
        try {
            // 订阅内容推送主题
            mqttClient.subscribe(contentPushTopic, QOS);
            Logger.d(TAG, "Subscribed to content push topic: " + contentPushTopic);
            
            // 订阅命令主题
            mqttClient.subscribe(commandTopic, QOS);
            Logger.d(TAG, "Subscribed to command topic: " + commandTopic);
            
            // 订阅广播主题
            mqttClient.subscribe(broadcastTopic, QOS);
            Logger.d(TAG, "Subscribed to broadcast topic: " + broadcastTopic);
            
        } catch (Exception e) {
            Logger.e(TAG, "Error subscribing to topics", e);
        }
    }
    
    /**
     * 注册设备到云平台
     */
    private void registerDevice() {
        try {
            DeviceRegistration registration = new DeviceRegistration();
            registration.setDeviceId(deviceId);
            registration.setDeviceType("android_screen");
            registration.setDeviceName("安卓屏幕终端-" + deviceId.substring(0, 8));
            registration.setDeviceModel(DeviceUtils.getDeviceModel());
            registration.setDeviceVersion(DeviceUtils.getSystemVersion());
            registration.setAppVersion(DeviceUtils.getAppVersion(this));
            registration.setScreenResolution(DeviceUtils.getScreenResolution(this));
            registration.setLocation(DeviceUtils.getLocation(this));
            registration.setTimestamp(System.currentTimeMillis());
            
            publishMessage(deviceRegistrationTopic, registration.toJson(), false);
            Logger.d(TAG, "Device registration sent to EMQX");
            
        } catch (Exception e) {
            Logger.e(TAG, "Error sending device registration", e);
        }
    }
    
    /**
     * 启动心跳定时任务
     */
    private void startHeartbeat() {
        stopHeartbeat(); // 先停止现有的心跳
        
        heartbeatExecutor.scheduleAtFixedRate(() -> {
            if (isConnected) {
                sendHeartbeat();
            }
        }, HEARTBEAT_INTERVAL, HEARTBEAT_INTERVAL, TimeUnit.MILLISECONDS);
        
        Logger.d(TAG, "Heartbeat started for EMQX connection");
    }
    
    /**
     * 停止心跳
     */
    private void stopHeartbeat() {
        if (heartbeatExecutor != null && !heartbeatExecutor.isShutdown()) {
            heartbeatExecutor.shutdown();
            heartbeatExecutor = Executors.newSingleThreadScheduledExecutor();
        }
    }
    
    /**
     * 发送心跳消息
     */
    private void sendHeartbeat() {
        try {
            JSONObject heartbeat = new JSONObject();
            heartbeat.put("deviceId", deviceId);
            heartbeat.put("timestamp", System.currentTimeMillis());
            heartbeat.put("status", "online");
            heartbeat.put("batteryLevel", DeviceUtils.getBatteryLevel(this));
            heartbeat.put("storageInfo", DeviceUtils.getStorageInfo());
            heartbeat.put("memoryInfo", DeviceUtils.getMemoryInfo(this));
            
            publishMessage(deviceHeartbeatTopic, heartbeat.toString(), false);
            Logger.v(TAG, "Heartbeat sent to EMQX");
            
        } catch (Exception e) {
            Logger.e(TAG, "Error sending heartbeat", e);
        }
    }
    
    /**
     * 发布MQTT消息
     */
    public void publishMessage(String topic, String payload, boolean retained) {
        if (!isConnected || mqttClient == null) {
            Logger.w(TAG, "Cannot publish message - not connected to EMQX");
            return;
        }
        
        try {
            MqttMessage message = new MqttMessage(payload.getBytes());
            message.setQos(QOS);
            message.setRetained(retained);
            
            mqttClient.publish(topic, message);
            Logger.v(TAG, "Published message to EMQX topic " + topic + ": " + payload);
            
        } catch (Exception e) {
            Logger.e(TAG, "Error publishing message to EMQX topic " + topic, e);
        }
    }
    
    /**
     * 发送设备状态更新
     */
    public void sendDeviceStatus(String status, String details) {
        try {
            DeviceStatus deviceStatus = new DeviceStatus();
            deviceStatus.setDeviceId(deviceId);
            deviceStatus.setStatus(status);
            deviceStatus.setDetails(details);
            deviceStatus.setTimestamp(System.currentTimeMillis());
            
            publishMessage(deviceStatusTopic, deviceStatus.toJson(), false);
            Logger.d(TAG, "Device status sent to EMQX: " + status);
            
        } catch (Exception e) {
            Logger.e(TAG, "Error sending device status", e);
        }
    }
    
    /**
     * 安排重连
     */
    private void scheduleReconnect() {
        if (reconnectAttempts >= MAX_RECONNECT_ATTEMPTS) {
            Logger.e(TAG, "Max reconnect attempts reached for EMQX");
            if (serviceCallback != null) {
                serviceCallback.onError("连接EMQX失败次数过多，请检查网络设置");
            }
            return;
        }
        
        reconnectAttempts++;
        long delay = RECONNECT_DELAY * reconnectAttempts; // 指数退避
        
        mainHandler.postDelayed(() -> {
            Logger.d(TAG, "Attempting EMQX reconnect #" + reconnectAttempts);
            connectToMqttBroker();
        }, delay);
    }
    
    /**
     * 清理资源
     */
    private void cleanup() {
        try {
            isConnected = false;
            
            // 停止心跳
            stopHeartbeat();
            
            // 断开MQTT连接
            if (mqttClient != null && mqttClient.isConnected()) {
                // 发送离线状态
                sendDeviceStatus("offline", "Service stopped");
                
                mqttClient.disconnect();
                mqttClient.close();
            }
            
        } catch (Exception e) {
            Logger.e(TAG, "Error during cleanup", e);
        }
    }
    
    // MQTT回调方法实现
    
    @Override
    public void connectionLost(Throwable cause) {
        mainHandler.post(() -> {
            Logger.w(TAG, "EMQX MQTT connection lost", cause);
            isConnected = false;
            
            if (serviceCallback != null) {
                serviceCallback.onDisconnected();
            }
            
            showToast("与EMQX云平台连接中断，正在重连...");
            
            // 自动重连
            scheduleReconnect();
        });
    }
    
    @Override
    public void messageArrived(String topic, MqttMessage message) throws Exception {
        String payload = new String(message.getPayload());
        Logger.d(TAG, "Message arrived from EMQX - Topic: " + topic + ", Payload: " + payload);
        
        mainHandler.post(() -> {
            try {
                if (topic.equals(contentPushTopic)) {
                    handleContentPush(payload);
                } else if (topic.equals(commandTopic)) {
                    handleCommand(payload);
                } else if (topic.equals(broadcastTopic)) {
                    handleBroadcast(payload);
                }
            } catch (Exception e) {
                Logger.e(TAG, "Error handling message from EMQX topic: " + topic, e);
            }
        });
    }
    
    @Override
    public void deliveryComplete(IMqttDeliveryToken token) {
        Logger.v(TAG, "Message delivery complete to EMQX");
    }
    
    /**
     * 处理内容推送
     */
    private void handleContentPush(String payload) {
        try {
            ContentPush content = ContentPush.fromJson(payload);
            Logger.d(TAG, "Content push received from EMQX: " + content.getContentType());
            
            if (serviceCallback != null) {
                serviceCallback.onContentReceived(content);
            }
            
        } catch (Exception e) {
            Logger.e(TAG, "Error handling content push", e);
        }
    }
    
    /**
     * 处理命令
     */
    private void handleCommand(String payload) {
        try {
            Command command = Command.fromJson(payload);
            Logger.d(TAG, "Command received from EMQX: " + command.getAction());
            
            if (serviceCallback != null) {
                serviceCallback.onCommandReceived(command);
            }
            
        } catch (Exception e) {
            Logger.e(TAG, "Error handling command", e);
        }
    }
    
    /**
     * 处理广播消息
     */
    private void handleBroadcast(String payload) {
        try {
            Logger.d(TAG, "Broadcast received from EMQX: " + payload);
            
            if (serviceCallback != null) {
                serviceCallback.onBroadcastReceived(payload);
            }
            
        } catch (Exception e) {
            Logger.e(TAG, "Error handling broadcast", e);
        }
    }
    
    // 公共方法
    
    public void setServiceCallback(MqttServiceCallback callback) {
        this.serviceCallback = callback;
    }
    
    public boolean isConnected() {
        return isConnected;
    }
    
    public String getDeviceId() {
        return deviceId;
    }
    
    public String getClientId() {
        return clientId;
    }
    
    public String getBrokerInfo() {
        String brokerHost = preferencesManager.getBrokerHost();
        int brokerPort = preferencesManager.getBrokerPort();
        return brokerHost + ":" + brokerPort;
    }
    
    /**
     * 手动重连
     */
    public void reconnect() {
        reconnectAttempts = 0;
        connectToMqttBroker();
    }
    
    /**
     * 更新服务器配置
     */
    public void updateBrokerConfig(String host, int port) {
        preferencesManager.setBrokerHost(host);
        preferencesManager.setBrokerPort(port);
        
        // 重新连接
        cleanup();
        connectToMqttBroker();
    }
    
    private void showToast(String message) {
        Toast.makeText(this, message, Toast.LENGTH_SHORT).show();
    }
}
