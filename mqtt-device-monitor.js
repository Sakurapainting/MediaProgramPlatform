const mqtt = require('mqtt');

console.log('🔍 持续监听MQTT设备消息...');
console.log('请在Android应用中点击"连接MQTT"按钮');

// 连接到本地MQTT服务器
const client = mqtt.connect('mqtt://localhost:1883', {
    clientId: `device_monitor_${Date.now()}`,
    keepalive: 60,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000
});

let messageCount = 0;

client.on('connect', () => {
    console.log('✅ 成功连接到MQTT服务器 (localhost:1883)');
    console.log('📅 开始时间:', new Date().toLocaleString());
    
    // 订阅所有设备相关主题
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
        '+/+',  // 监听所有二级主题
        '#'     // 监听所有主题
    ];
    
    topics.forEach(topic => {
        client.subscribe(topic, { qos: 1 }, (err) => {
            if (!err) {
                console.log(`📢 订阅主题: ${topic}`);
            }
        });
    });
    
    console.log('\n🎧 监听所有MQTT消息中...');
    console.log('按 Ctrl+C 停止监听\n');
});

client.on('message', (topic, message) => {
    messageCount++;
    const timestamp = new Date().toLocaleString();
    
    console.log(`\n📨 消息 #${messageCount} [${timestamp}]`);
    console.log(`🏷️  主题: ${topic}`);
    
    try {
        const data = JSON.parse(message.toString());
        console.log(`📋 类型: ${data.type || '未知'}`);
        console.log(`🆔 设备ID: ${data.deviceId || '未设置'}`);
        console.log(`🔗 客户端ID: ${data.clientId || '未设置'}`);
        
        if (data.type === 'register') {
            console.log(`🎉 检测到设备注册!`);
            console.log(`   设备名称: ${data.data?.name || '未知'}`);
            console.log(`   设备类型: ${data.data?.type || '未知'}`);
            console.log(`   位置: ${data.data?.location?.name || '未知'}`);
        } else if (data.type === 'heartbeat') {
            console.log(`💓 心跳消息`);
        } else if (data.type === 'status') {
            console.log(`📊 状态更新: ${data.data?.status || '未知'}`);
        }
        
        console.log(`📄 完整数据:`, JSON.stringify(data, null, 2));
    } catch (e) {
        console.log(`📝 原始消息: ${message.toString()}`);
    }
    
    console.log('─'.repeat(60));
});

client.on('error', (error) => {
    console.log('❌ MQTT连接错误:', error);
});

client.on('close', () => {
    console.log('📴 MQTT连接关闭');
});

// 处理程序退出
process.on('SIGINT', () => {
    console.log('\n\n📊 监听统计:');
    console.log(`   总共收到 ${messageCount} 条消息`);
    console.log(`   结束时间: ${new Date().toLocaleString()}`);
    client.end();
    process.exit(0);
});

// 每30秒输出一次状态
setInterval(() => {
    console.log(`\n⏰ [${new Date().toLocaleTimeString()}] 仍在监听中... (已收到 ${messageCount} 条消息)`);
}, 30000);
