const mqtt = require('mqtt');

// 模拟您的安卓设备配置
const MQTT_SERVER = "192.168.80.1";
const MQTT_PORT = 1883;
const DEVICE_ID = "debug_device_001";
const CLIENT_ID = "debug_client_001";

console.log('🚀 模拟安卓设备连接测试');
console.log(`📱 设备ID: ${DEVICE_ID}`);
console.log(`🔗 客户端ID: ${CLIENT_ID}`);
console.log(`🌐 MQTT服务器: ${MQTT_SERVER}:${MQTT_PORT}\n`);

// 连接到MQTT服务器
const client = mqtt.connect(`mqtt://${MQTT_SERVER}:${MQTT_PORT}`, {
    clientId: CLIENT_ID,
    keepalive: 60,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000
});

client.on('connect', () => {
    console.log('✅ MQTT连接成功');
    
    // 订阅相关主题
    const topics = [
        `device/${CLIENT_ID}/content`,
        `device/${CLIENT_ID}/command`,
        `device/${CLIENT_ID}/register/confirm`,
        `device/${CLIENT_ID}/register/error`,
        'broadcast/all'
    ];
    
    topics.forEach(topic => {
        client.subscribe(topic, (err) => {
            if (!err) {
                console.log(`📬 订阅主题成功: ${topic}`);
            } else {
                console.log(`❌ 订阅主题失败: ${topic}`, err);
            }
        });
    });
    
    // 发送设备注册消息
    setTimeout(() => {
        const registrationMessage = {
            action: 'register',
            deviceId: DEVICE_ID,
            deviceType: 'android_screen',
            timestamp: new Date().toISOString(),
            metadata: {
                version: '1.0.0',
                platform: 'android',
                resolution: '1920x1080',
                location: '测试位置',
                address: '测试地址',
                region: '华北',
                city: '北京',
                coordinates: { 
                    latitude: 39.9042, 
                    longitude: 116.4074 
                }
            }
        };
        
        client.publish('device/register', JSON.stringify(registrationMessage));
        console.log('📋 设备注册消息已发送');
    }, 1000);
    
    // 启动心跳
    setInterval(() => {
        const heartbeat = {
            action: 'heartbeat',
            deviceId: DEVICE_ID,
            timestamp: new Date().toISOString(),
            status: 'online'
        };
        
        client.publish('device/heartbeat', JSON.stringify(heartbeat));
        console.log('💓 心跳已发送');
    }, 30000);
});

client.on('message', (topic, message) => {
    const msg = message.toString();
    console.log(`📨 收到消息 [${topic}]: ${msg}`);
    
    try {
        const data = JSON.parse(msg);
        
        if (topic.includes('/register/confirm')) {
            console.log('🎉 设备注册成功确认:', data.message);
        } else if (topic.includes('/register/error')) {
            console.log('❌ 设备注册失败:', data.message);
        } else if (topic.includes('/content')) {
            console.log('📺 收到内容推送:', data);
            
            // 发送确认消息
            const response = {
                action: 'content_response',
                contentId: data.contentId,
                status: 'received',
                timestamp: new Date().toISOString()
            };
            client.publish('device/status', JSON.stringify(response));
            console.log('✅ 内容接收确认已发送');
        } else if (topic === 'broadcast/all') {
            console.log('📢 收到广播消息:', data);
        }
    } catch (e) {
        console.log('⚠️ 消息解析失败:', e.message);
    }
});

client.on('error', (error) => {
    console.log('❌ MQTT连接错误:', error.message);
});

client.on('close', () => {
    console.log('📱 MQTT连接已关闭');
});

// 优雅退出
process.on('SIGINT', () => {
    console.log('\n🛑 正在断开MQTT连接...');
    client.end();
    process.exit(0);
});

console.log('⏳ 正在连接到MQTT服务器...');
