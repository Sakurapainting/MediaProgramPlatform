const mqtt = require('mqtt');

console.log('🔍 测试不同MQTT服务器地址的连通性...');
console.log('');

const addresses = [
    'mqtt://localhost:1883',
    'mqtt://127.0.0.1:1883',
    'mqtt://192.168.13.217:1883',
    'mqtt://0.0.0.0:1883'
];

async function testConnection(address) {
    return new Promise((resolve) => {
        console.log(`🔗 测试连接: ${address}`);
        
        const client = mqtt.connect(address, {
            clientId: `connectivity_test_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            keepalive: 30,
            clean: true,
            connectTimeout: 10 * 1000
        });
        
        const timeout = setTimeout(() => {
            client.end();
            resolve({ address, success: false, error: '连接超时' });
        }, 12000);
        
        client.on('connect', () => {
            clearTimeout(timeout);
            console.log(`✅ ${address} - 连接成功`);
            
            // 发送测试消息
            const testMessage = {
                type: 'connectivity_test',
                timestamp: Date.now(),
                source: 'connectivity_test_script',
                message: '连通性测试消息'
            };
            
            client.publish('test/connectivity', JSON.stringify(testMessage), { qos: 1 }, (err) => {
                if (!err) {
                    console.log(`📤 ${address} - 测试消息发送成功`);
                }
                client.end();
                resolve({ address, success: true });
            });
        });
        
        client.on('error', (error) => {
            clearTimeout(timeout);
            console.log(`❌ ${address} - 连接失败:`, error.message);
            client.end();
            resolve({ address, success: false, error: error.message });
        });
    });
}

async function runTests() {
    console.log('开始连通性测试...');
    console.log('─'.repeat(60));
    
    const results = [];
    
    for (const address of addresses) {
        const result = await testConnection(address);
        results.push(result);
        console.log('');
    }
    
    console.log('📊 测试结果汇总:');
    console.log('─'.repeat(60));
    
    results.forEach(result => {
        const status = result.success ? '✅ 成功' : '❌ 失败';
        const error = result.error ? ` (${result.error})` : '';
        console.log(`${result.address} - ${status}${error}`);
    });
    
    console.log('');
    console.log('💡 建议:');
    const successfulConnections = results.filter(r => r.success);
    
    if (successfulConnections.length > 0) {
        console.log('✅ 可用的连接地址:');
        successfulConnections.forEach(r => {
            console.log(`   - ${r.address}`);
        });
        
        if (successfulConnections.some(r => r.address.includes('192.168.13.217'))) {
            console.log('');
            console.log('🎯 192.168.13.217:1883 可以连接，Android设备应该也能连接');
            console.log('   问题可能在于:');
            console.log('   1. Android设备不在同一网络');
            console.log('   2. Android app的MQTT配置不正确');
            console.log('   3. Android app连接了但没有发送注册消息');
        } else {
            console.log('');
            console.log('⚠️  192.168.13.217:1883 无法连接，Android设备可能需要使用其他地址');
        }
    } else {
        console.log('❌ 所有连接都失败了，MQTT服务器可能有问题');
    }
    
    process.exit(0);
}

runTests().catch(console.error);
