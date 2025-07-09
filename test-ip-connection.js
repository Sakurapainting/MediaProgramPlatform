const mqtt = require('mqtt');

console.log('🔍 测试从192.168.13.217连接MQTT服务器...');

// 尝试连接到192.168.13.217:1883 (Android app应该连接的地址)
const client = mqtt.connect('mqtt://192.168.13.217:1883', {
    clientId: `test_192_168_13_217_${Date.now()}`,
    keepalive: 60,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000
});

client.on('connect', () => {
    console.log('✅ 成功连接到 mqtt://192.168.13.217:1883');
    console.log('📡 这意味着Android设备应该能够连接');
    
    // 发送测试注册消息
    const testMessage = {
        type: 'register',
        deviceId: 'test_android_192_168_13_217',
        clientId: client.options.clientId,
        timestamp: Date.now(),
        data: {
            deviceId: 'test_android_192_168_13_217',
            name: '测试安卓设备_192.168.13.217',
            type: 'android_screen',
            location: {
                name: 'IP连接测试',
                address: '192.168.13.217'
            },
            specifications: {
                resolution: '1920x1080'
            },
            capabilities: ['display', 'audio', 'touch']
        }
    };
    
    client.publish('device/register', JSON.stringify(testMessage), { qos: 1 }, (err) => {
        if (!err) {
            console.log('📤 测试注册消息已发送');
        } else {
            console.log('❌ 发送测试消息失败:', err);
        }
    });
    
    setTimeout(() => {
        console.log('🔚 测试完成，断开连接');
        client.end();
    }, 3000);
});

client.on('error', (error) => {
    console.log('❌ 连接 192.168.13.217:1883 失败:', error);
    console.log('');
    console.log('💡 可能的解决方案：');
    console.log('   1. 检查Windows防火墙设置');
    console.log('   2. 确认网络配置正确');
    console.log('   3. Android设备可能在不同的网络');
});

client.on('close', () => {
    console.log('📴 连接已关闭');
    process.exit(0);
});

console.log('⏳ 尝试连接中...');
