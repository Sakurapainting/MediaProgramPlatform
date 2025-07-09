const mqtt = require('mqtt');

console.log('🔍 长时间监听MQTT设备消息...');
console.log('📍 检查点：');
console.log('   1. Android app的MQTT服务器地址是否正确？');
console.log('   2. 默认配置是 192.168.13.217:1883');
console.log('   3. 如果您的服务器在其他地址，请在app中修改配置');
console.log('');

// 连接到本地MQTT服务器
const client = mqtt.connect('mqtt://localhost:1883', {
    clientId: `extended_listener_${Date.now()}`,
    keepalive: 60,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000
});

let messageCount = 0;

client.on('connect', () => {
    console.log('✅ 成功连接到MQTT服务器 (localhost:1883)');
    console.log('📅 开始时间:', new Date().toLocaleString());
    
    // 订阅所有相关主题
    const topics = [
        'device/register',
        'device/+/register', 
        'device/heartbeat',
        'device/+/heartbeat',
        'device/status',
        'device/+/status',
        'device/data',
        'device/+/data',
        'device/+/content',
        'device/+/commands',
        'broadcast/all',
        'register/confirm',
        '+/+',
        '#'
    ];
    
    topics.forEach(topic => {
        client.subscribe(topic, { qos: 1 }, (err) => {
            if (!err) {
                console.log(`📢 订阅主题: ${topic}`);
            }
        });
    });
    
    console.log('🎧 开始长时间监听设备消息...');
    console.log('💡 提示：如果Android app连接到其他服务器地址，这里不会收到消息');
    console.log('');
});

client.on('message', (topic, message) => {
    messageCount++;
    const timestamp = new Date().toLocaleString();
    console.log(`\n📨 [${messageCount}] [${timestamp}] 收到MQTT消息:`);
    console.log(`   主题: ${topic}`);
    
    try {
        const data = JSON.parse(message.toString());
        console.log(`   消息类型: ${data.type || '未知'}`);
        console.log(`   设备ID: ${data.deviceId || '未知'}`);
        console.log(`   客户端ID: ${data.clientId || '未知'}`);
        
        if (data.type === 'register') {
            console.log('🎯 设备注册消息详情:');
            console.log(JSON.stringify(data, null, 2));
        } else if (data.type === 'heartbeat') {
            console.log('💓 心跳消息 - 设备在线');
        } else {
            console.log('   消息内容:');
            console.log(JSON.stringify(data, null, 2));
        }
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

// 定期显示状态
const statusInterval = setInterval(() => {
    const timestamp = new Date().toLocaleTimeString();
    console.log(`⏰ [${timestamp}] 仍在监听中... (已收到 ${messageCount} 条消息)`);
}, 30000);

// 60秒后结束
setTimeout(() => {
    console.log('\n📊 监听统计:');
    console.log(`   总共收到 ${messageCount} 条消息`);
    console.log(`   结束时间: ${new Date().toLocaleString()}`);
    
    if (messageCount === 0) {
        console.log('');
        console.log('🔍 没有收到消息可能的原因：');
        console.log('   1. Android app连接到不同的MQTT服务器地址');
        console.log('   2. 网络连接问题');
        console.log('   3. MQTT客户端连接失败');
        console.log('   4. 防火墙阻止连接');
        console.log('');
        console.log('💡 建议：');
        console.log('   1. 检查Android app中的MQTT服务器配置');
        console.log('   2. 确认服务器地址和端口正确');
        console.log('   3. 查看Android app的日志输出');
    }
    
    clearInterval(statusInterval);
    client.end();
    process.exit(0);
}, 60000);

console.log('📱 请现在在Android app中点击"连接MQTT"按钮...');
