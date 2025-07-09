const mqtt = require('mqtt');

console.log('🔍 实时监听所有MQTT活动...');
console.log('🎯 这个监听器将一直运行，实时显示任何MQTT连接和消息');
console.log('');

// 连接到本地MQTT服务器
const client = mqtt.connect('mqtt://localhost:1883', {
    clientId: `realtime_monitor_${Date.now()}`,
    keepalive: 60,
    clean: true,
    reconnectPeriod: 1000,
    connectTimeout: 30 * 1000
});

let messageCount = 0;
let startTime = new Date();

client.on('connect', () => {
    console.log('✅ 监听器已连接到MQTT服务器 (localhost:1883)');
    console.log('📅 开始时间:', startTime.toLocaleString());
    console.log('');
    
    // 订阅所有主题
    client.subscribe('#', { qos: 1 }, (err) => {
        if (!err) {
            console.log('📢 已订阅所有主题 (#)');
            console.log('🎧 开始实时监听...');
            console.log('💡 现在请在Android app中点击"连接MQTT"');
            console.log('');
        }
    });
});

client.on('message', (topic, message) => {
    messageCount++;
    const timestamp = new Date().toLocaleString();
    
    console.log(`\n📨 [${messageCount}] [${timestamp}] 收到MQTT消息:`);
    console.log(`   🎯 主题: ${topic}`);
    
    try {
        const data = JSON.parse(message.toString());
        console.log(`   📋 消息类型: ${data.type || '未知'}`);
        console.log(`   🆔 设备ID: ${data.deviceId || '未知'}`);
        console.log(`   👤 客户端ID: ${data.clientId || '未知'}`);
        
        if (data.type === 'register') {
            console.log('🎯 这是设备注册消息！');
            console.log('📄 完整内容:');
            console.log(JSON.stringify(data, null, 2));
        } else if (data.type === 'heartbeat') {
            console.log('💓 心跳消息 - 设备在线');
        } else {
            console.log('📄 消息内容:');
            console.log(JSON.stringify(data, null, 2));
        }
        
        console.log('─'.repeat(50));
        
    } catch (e) {
        console.log(`   📄 原始消息: ${message.toString()}`);
        console.log('─'.repeat(50));
    }
});

client.on('error', (error) => {
    console.log('❌ MQTT连接错误:', error);
});

client.on('close', () => {
    console.log('📴 MQTT连接关闭');
});

// 每30秒显示状态
setInterval(() => {
    const now = new Date();
    const elapsed = Math.floor((now - startTime) / 1000);
    console.log(`\n⏰ [${now.toLocaleTimeString()}] 监听中... (运行 ${elapsed}s, 收到 ${messageCount} 条消息)`);
    
    if (messageCount === 0) {
        console.log('💡 如果Android app已连接但没有收到消息，可能原因：');
        console.log('   - Android app连接到不同的MQTT服务器');
        console.log('   - Android app使用了不同的端口');
        console.log('   - Android app的MQTT配置有问题');
    }
}, 30000);

// 处理退出
process.on('SIGINT', () => {
    console.log('\n📊 监听统计:');
    console.log(`   运行时间: ${Math.floor((new Date() - startTime) / 1000)}秒`);
    console.log(`   收到消息: ${messageCount}条`);
    console.log(`   结束时间: ${new Date().toLocaleString()}`);
    client.end();
    process.exit(0);
});

console.log('📱 准备就绪！请在Android app中操作...');
console.log('🛑 按 Ctrl+C 停止监听');
