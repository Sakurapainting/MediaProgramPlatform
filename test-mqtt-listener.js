const mqtt = require('mqtt');

console.log('🔍 测试MQTT连接和设备查询...');

// 连接到本地MQTT服务器
const client = mqtt.connect('mqtt://localhost:1883', {
    clientId: `test_client_${Date.now()}`,
    keepalive: 60,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000
});

client.on('connect', () => {
    console.log('✅ 成功连接到MQTT服务器');
    
    // 订阅设备注册主题
    client.subscribe('device/register', { qos: 1 }, (err) => {
        if (!err) {
            console.log('📢 订阅 device/register 主题成功');
        } else {
            console.log('❌ 订阅失败:', err);
        }
    });
    
    // 订阅所有设备相关主题
    const topics = [
        'device/+/register',
        'device/register', 
        'device/heartbeat',
        'device/status',
        'device/data'
    ];
    
    topics.forEach(topic => {
        client.subscribe(topic, { qos: 1 }, (err) => {
            if (!err) {
                console.log(`📢 订阅主题: ${topic}`);
            }
        });
    });
    
    console.log('🎧 监听设备消息中...');
});

client.on('message', (topic, message) => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`\n📨 [${timestamp}] 收到消息:`);
    console.log(`   主题: ${topic}`);
    
    try {
        const data = JSON.parse(message.toString());
        console.log(`   类型: ${data.type || '未知'}`);
        console.log(`   设备ID: ${data.deviceId || '未知'}`);
        console.log(`   内容:`, JSON.stringify(data, null, 2));
    } catch (e) {
        console.log(`   原始消息: ${message.toString()}`);
    }
});

client.on('error', (error) => {
    console.log('❌ MQTT连接错误:', error);
});

client.on('close', () => {
    console.log('📴 MQTT连接关闭');
});

// 10秒后关闭连接
setTimeout(() => {
    console.log('\n⏰ 测试时间结束，关闭连接');
    client.end();
    process.exit(0);
}, 10000);
