#!/usr/bin/env node

const mqtt = require('mqtt');
const os = require('os');

console.log('🔍 安卓MQTT设备注册快速调试工具');
console.log('=' .repeat(50));

// 获取本机IP地址
function getLocalIPAddress() {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name]) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return 'localhost';
}

const serverIP = getLocalIPAddress();
const mqttBrokerUrl = `mqtt://${serverIP}:1883`;
const deviceId = `debug_quick_${Date.now()}`;
const clientId = `quick_test_${Date.now()}`;

console.log(`📡 服务器IP: ${serverIP}`);
console.log(`🔗 MQTT地址: ${mqttBrokerUrl}`);
console.log(`📱 设备ID: ${deviceId}`);
console.log(`🆔 客户端ID: ${clientId}`);
console.log('');

// 1. 测试网络连通性
console.log('🌐 1. 测试网络连通性...');
const net = require('net');
const socket = new net.Socket();

socket.setTimeout(5000);
socket.connect(1883, serverIP, () => {
    console.log('✅ MQTT端口1883连通正常');
    socket.destroy();
    
    // 2. 测试MQTT连接和注册
    testMQTTConnection();
});

socket.on('timeout', () => {
    console.log('❌ MQTT端口1883连接超时');
    console.log('   请检查：');
    console.log('   - 服务器是否在运行');
    console.log('   - 防火墙是否开放1883端口');
    console.log('   - 网络连接是否正常');
    process.exit(1);
});

socket.on('error', (err) => {
    console.log('❌ MQTT端口1883连接失败:', err.message);
    console.log('   可能原因：');
    console.log('   - MQTT服务器未启动');
    console.log('   - 端口被防火墙阻止');
    console.log('   - IP地址不正确');
    process.exit(1);
});

function testMQTTConnection() {
    console.log('📡 2. 测试MQTT连接...');
    
    const client = mqtt.connect(mqttBrokerUrl, {
        clientId: clientId,
        clean: true,
        connectTimeout: 10000,
        keepalive: 60
    });

    let registrationSent = false;
    let confirmationReceived = false;

    // 连接成功
    client.on('connect', () => {
        console.log('✅ MQTT连接成功');
        
        // 订阅确认主题
        const confirmTopic = `device/${clientId}/register/confirm`;
        const errorTopic = `device/${clientId}/register/error`;
        
        client.subscribe([confirmTopic, errorTopic], (err) => {
            if (err) {
                console.log('❌ 订阅主题失败:', err.message);
            } else {
                console.log('📬 订阅确认和错误主题成功');
                
                // 发送注册消息
                sendRegistrationMessage();
            }
        });
    });

    // 连接失败
    client.on('error', (err) => {
        console.log('❌ MQTT连接失败:', err.message);
        console.log('   检查安卓APP中的配置：');
        console.log(`   String MQTT_BROKER_URL = "tcp://${serverIP}:1883";`);
        process.exit(1);
    });

    // 接收消息
    client.on('message', (topic, message) => {
        console.log('📨 收到确认消息:', topic);
        try {
            const data = JSON.parse(message.toString());
            if (data.status === 'success') {
                console.log('🎉 设备注册成功确认:', data.message);
                confirmationReceived = true;
                
                // 测试完成
                setTimeout(() => {
                    testAPIAccess();
                    client.end();
                }, 1000);
            } else {
                console.log('❌ 设备注册失败:', data.message);
            }
        } catch (e) {
            console.log('❌ 消息解析失败:', e.message);
        }
    });

    function sendRegistrationMessage() {
        console.log('📋 3. 发送设备注册消息...');
        
        const registerMessage = {
            action: "register",
            deviceId: deviceId,
            deviceType: "android_screen",
            timestamp: new Date().toISOString(),
            metadata: {
                version: "1.0.0",
                platform: "android",
                resolution: "1920x1080",
                location: "调试测试位置",
                address: "调试测试地址",
                region: "测试区域",
                city: "测试城市",
                coordinates: {
                    latitude: 39.9042,
                    longitude: 116.4074
                },
                size: "调试设备",
                orientation: "horizontal"
            }
        };

        // 发布注册消息
        const topic = 'device/register';
        client.publish(topic, JSON.stringify(registerMessage), { qos: 1 }, (err) => {
            if (err) {
                console.log('❌ 发送注册消息失败:', err.message);
            } else {
                console.log('✅ 注册消息发送成功');
                registrationSent = true;
                
                // 等待确认
                setTimeout(() => {
                    if (!confirmationReceived) {
                        console.log('⚠️  等待确认消息超时（10秒）');
                        console.log('   可能原因：');
                        console.log('   - 服务器未处理注册消息');
                        console.log('   - 消息格式不正确');
                        console.log('   - 服务器内部错误');
                        client.end();
                        process.exit(1);
                    }
                }, 10000);
            }
        });
    }
}

function testAPIAccess() {
    console.log('🌐 4. 测试API访问...');
    
    const http = require('http');
    const options = {
        hostname: serverIP,
        port: 5001,
        path: '/health',
        method: 'GET',
        timeout: 5000
    };

    const req = http.request(options, (res) => {
        if (res.statusCode === 200) {
            console.log('✅ API服务器响应正常');
            
            // 测试设备查询
            testDeviceQuery();
        } else {
            console.log('❌ API服务器响应异常:', res.statusCode);
        }
    });

    req.on('timeout', () => {
        console.log('❌ API服务器访问超时');
        console.log('   请检查5001端口是否开放');
        req.destroy();
    });

    req.on('error', (err) => {
        console.log('❌ API服务器连接失败:', err.message);
        console.log('   可能原因：');
        console.log('   - API服务器未启动');
        console.log('   - 端口5001被阻止');
    });

    req.end();
}

function testDeviceQuery() {
    console.log('📋 5. 验证设备注册结果...');
    
    // 简化：直接提示用户手动检查
    console.log('');
    console.log('🎯 测试完成！请手动验证：');
    console.log('');
    console.log('1. 打开云平台管理界面');
    console.log('2. 登录账号：admin@example.com / 123456');
    console.log('3. 查看设备管理页面');
    console.log(`4. 确认设备 "${deviceId}" 是否出现在列表中`);
    console.log('');
    console.log('📱 安卓APP配置参考：');
    console.log(`   String MQTT_BROKER_URL = "tcp://${serverIP}:1883";`);
    console.log(`   String CLIENT_ID = "android_" + 您的设备唯一ID;`);
    console.log('');
    console.log('🔧 如果安卓APP仍无法注册，请检查：');
    console.log('   1. 是否使用正确的服务器IP地址');
    console.log('   2. 是否在MQTT连接成功后发送注册消息');
    console.log('   3. 注册消息格式是否正确');
    console.log('   4. 是否订阅了确认主题');
    console.log('');
    console.log('📚 详细调试指南：ANDROID_MQTT_DEBUG_GUIDE.md');
}
