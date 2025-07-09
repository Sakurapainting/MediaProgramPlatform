const mqtt = require('mqtt');

console.log('🔍 测试从192.168.13.217连接MQTT服务器...');

// 模拟Android设备的连接方式
const client = mqtt.connect('mqtt://192.168.13.217:1883', {
    clientId: 'android_test_client',
    keepalive: 60,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000
});

client.on('connect', () => {
    console.log('✅ 成功连接到 192.168.13.217:1883');
    
    // 模拟Android应用发送设备注册消息
    const registerMessage = {
        type: "register",
        deviceId: "android_test_device",
        clientId: "android_test_client",
        timestamp: Date.now(),
        data: {
            deviceId: "android_test_device",
            name: "测试安卓终端",
            type: "android_screen",
            location: {
                name: "测试位置",
                address: "测试地址",
                coordinates: {
                    latitude: 0.0,
                    longitude: 0.0
                }
            },
            specifications: {
                resolution: "1920x1080",
                size: "55寸",
                orientation: "horizontal"
            },
            version: "1.0.0",
            capabilities: ["display", "audio", "touch"]
        }
    };
    
    console.log('📤 发送设备注册消息...');
    client.publish('device/register', JSON.stringify(registerMessage), { qos: 1 }, (err) => {
        if (err) {
            console.log('❌ 发送失败:', err);
        } else {
            console.log('✅ 设备注册消息发送成功');
        }
    });
    
    // 发送心跳消息
    setTimeout(() => {
        const heartbeatMessage = {
            type: "heartbeat", 
            deviceId: "android_test_device",
            clientId: "android_test_client",
            timestamp: Date.now(),
            data: {
                uptime: 12345,
                memoryUsage: 45.6,
                cpuUsage: 23.1
            }
        };
        
        console.log('💓 发送心跳消息...');
        client.publish('device/heartbeat', JSON.stringify(heartbeatMessage), { qos: 1 });
    }, 2000);
    
    // 5秒后断开连接
    setTimeout(() => {
        console.log('🔌 断开测试连接');
        client.end();
        process.exit(0);
    }, 5000);
});

client.on('error', (error) => {
    console.log('❌ 连接失败:', error);
    process.exit(1);
});

client.on('close', () => {
    console.log('📴 连接关闭');
});
