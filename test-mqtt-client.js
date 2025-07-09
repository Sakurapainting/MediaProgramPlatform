#!/usr/bin/env node

/**
 * 安卓终端MQTT模拟测试脚本
 * 
 * 安装依赖: npm install mqtt
 * 运行: node test-mqtt-client.js
 */

const mqtt = require('mqtt');

// 配置
const MQTT_URL = 'mqtt://localhost:1884'; // 注意端口是1884
const CLIENT_ID = 'android_test_' + Math.random().toString(16).substr(2, 8);
const DEVICE_ID = 'android_001';

console.log('🚀 启动安卓终端MQTT测试客户端');
console.log(`📱 客户端ID: ${CLIENT_ID}`);
console.log(`🔗 连接地址: ${MQTT_URL}`);

// 创建MQTT客户端
const client = mqtt.connect(MQTT_URL, {
    clientId: CLIENT_ID,
    clean: true,
    connectTimeout: 4000,
    reconnectPeriod: 1000,
});

// 连接事件
client.on('connect', () => {
    console.log('✅ 已连接到MQTT服务器');
    
    // 订阅相关主题
    const topics = [
        `device/${CLIENT_ID}/register`,
        `device/${CLIENT_ID}/commands`,
        `device/${CLIENT_ID}/content`,
        `device/${CLIENT_ID}/heartbeat`,
        `broadcast/all`
    ];
    
    topics.forEach(topic => {
        client.subscribe(topic, (err) => {
            if (!err) {
                console.log(`📢 订阅主题: ${topic}`);
            } else {
                console.error(`❌ 订阅失败 ${topic}:`, err);
            }
        });
    });
    
    // 延迟1秒后注册设备
    setTimeout(() => {
        registerDevice();
    }, 1000);
    
    // 启动心跳定时器
    setInterval(() => {
        sendHeartbeat();
    }, 30000); // 每30秒发送一次心跳
});

// 消息接收事件
client.on('message', (topic, message) => {
    const messageStr = message.toString();
    console.log(`📨 收到消息 [${topic}]: ${messageStr}`);
    
    try {
        const data = JSON.parse(messageStr);
        
        switch (data.type) {
            case 'register_response':
                console.log('✅ 设备注册成功!');
                console.log('🔑 服务器分配的主题:', data.topics);
                break;
                
            case 'content_push':
                console.log('📺 收到内容推送:', data.data);
                // 模拟内容播放响应
                setTimeout(() => {
                    sendContentResponse(data.data.contentId, 'playing');
                }, 1000);
                break;
                
            case 'command':
                console.log(`🎮 收到命令: ${data.data.command}`);
                handleCommand(data.data);
                break;
                
            case 'heartbeat_response':
                console.log('💓 心跳响应正常');
                break;
                
            case 'broadcast':
                console.log('📢 收到广播消息:', data.data);
                break;
                
            default:
                console.log('❓ 未知消息类型:', data.type);
        }
    } catch (e) {
        console.log('📄 收到非JSON消息:', messageStr);
    }
});

// 错误事件
client.on('error', (error) => {
    console.error('❌ MQTT错误:', error);
});

// 离线事件
client.on('offline', () => {
    console.log('📴 与服务器断开连接');
});

// 重连事件
client.on('reconnect', () => {
    console.log('🔄 尝试重新连接...');
});

// 设备注册
function registerDevice() {
    const registrationData = {
        type: 'register',
        deviceId: DEVICE_ID,
        clientId: CLIENT_ID,
        timestamp: Date.now(),
        data: {
            deviceId: DEVICE_ID,
            name: '安卓屏幕终端_测试',
            type: 'android_screen',
            location: {
                name: '测试大厅',
                address: '北京市朝阳区测试大厦1层',
                coordinates: {
                    latitude: 39.9042,
                    longitude: 116.4074
                }
            },
            specifications: {
                resolution: '1920x1080',
                size: '55寸',
                orientation: 'horizontal'
            },
            version: '1.0.0',
            capabilities: ['display', 'audio', 'touch', 'screenshot']
        }
    };
    
    sendMessage('device/register', registrationData);
    console.log('📝 发送设备注册请求');
}

// 发送心跳
function sendHeartbeat() {
    const heartbeatData = {
        type: 'heartbeat',
        deviceId: DEVICE_ID,
        clientId: CLIENT_ID,
        timestamp: Date.now(),
        data: {
            uptime: process.uptime() * 1000,
            memoryUsage: Math.random() * 100,
            cpuUsage: Math.random() * 100,
            temperature: Math.floor(Math.random() * 20) + 25, // 25-45度
            brightness: Math.floor(Math.random() * 100)
        }
    };
    
    sendMessage('device/heartbeat', heartbeatData);
    console.log('💓 发送心跳');
}

// 发送状态更新
function sendStatusUpdate(status = 'online') {
    const statusData = {
        type: 'status',
        deviceId: DEVICE_ID,
        clientId: CLIENT_ID,
        timestamp: Date.now(),
        data: {
            status: status,
            deviceInfo: {
                battery: Math.floor(Math.random() * 100),
                temperature: Math.floor(Math.random() * 20) + 25,
                brightness: Math.floor(Math.random() * 100),
                volume: Math.floor(Math.random() * 100)
            }
        }
    };
    
    sendMessage('device/status', statusData);
    console.log(`📊 发送状态更新: ${status}`);
}

// 发送设备数据
function sendDeviceData(dataType, payload) {
    const deviceData = {
        type: 'data',
        deviceId: DEVICE_ID,
        clientId: CLIENT_ID,
        timestamp: Date.now(),
        data: {
            dataType: dataType,
            payload: payload
        }
    };
    
    sendMessage('device/data', deviceData);
    console.log(`📊 发送设备数据: ${dataType}`);
}

// 发送内容响应
function sendContentResponse(contentId, status, error = null) {
    const responseData = {
        type: 'content_response',
        deviceId: DEVICE_ID,
        clientId: CLIENT_ID,
        timestamp: Date.now(),
        data: {
            contentId: contentId,
            status: status,
            error: error,
            timestamp: Date.now()
        }
    };
    
    sendMessage('device/content_response', responseData);
    console.log(`📺 发送内容响应: ${contentId} -> ${status}`);
}

// 处理服务器命令
function handleCommand(commandData) {
    const { command, params } = commandData;
    
    switch (command) {
        case 'screenshot':
            console.log('📸 执行截图命令');
            // 模拟截图数据
            setTimeout(() => {
                sendDeviceData('screenshot', {
                    filename: `screenshot_${Date.now()}.jpg`,
                    base64: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQEAAA...', // 模拟数据
                    timestamp: Date.now()
                });
            }, 2000);
            break;
            
        case 'restart':
            console.log('🔄 执行重启命令');
            sendStatusUpdate('maintenance');
            setTimeout(() => {
                sendStatusUpdate('online');
            }, 5000);
            break;
            
        case 'volume':
            console.log(`🔊 设置音量: ${params.level}`);
            sendStatusUpdate('online');
            break;
            
        case 'brightness':
            console.log(`💡 设置亮度: ${params.level}`);
            sendStatusUpdate('online');
            break;
            
        default:
            console.log(`❓ 未知命令: ${command}`);
    }
}

// 发送消息辅助函数
function sendMessage(topic, message) {
    if (!client.connected) {
        console.error('❌ 客户端未连接');
        return;
    }
    
    const messageStr = JSON.stringify(message);
    client.publish(topic, messageStr, { qos: 1 }, (err) => {
        if (err) {
            console.error(`❌ 发送失败 [${topic}]:`, err);
        }
    });
}

// 控制台命令处理
process.stdin.setEncoding('utf8');
console.log('\n📋 可用命令:');
console.log('  heartbeat  - 发送心跳');
console.log('  status     - 发送状态更新');
console.log('  screenshot - 发送模拟截图');
console.log('  quit       - 退出程序');
console.log('\n输入命令后按回车键执行...\n');

process.stdin.on('readable', () => {
    const chunk = process.stdin.read();
    if (chunk !== null) {
        const command = chunk.trim().toLowerCase();
        
        switch (command) {
            case 'heartbeat':
                sendHeartbeat();
                break;
                
            case 'status':
                sendStatusUpdate('online');
                break;
                
            case 'screenshot':
                sendDeviceData('screenshot', {
                    filename: `manual_screenshot_${Date.now()}.jpg`,
                    base64: 'data:image/jpeg;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==',
                    width: 1920,
                    height: 1080,
                    timestamp: Date.now()
                });
                break;
                
            case 'quit':
            case 'exit':
                console.log('👋 断开连接并退出...');
                client.end();
                process.exit(0);
                break;
                
            default:
                if (command) {
                    console.log(`❓ 未知命令: ${command}`);
                }
        }
    }
});

// 优雅退出处理
process.on('SIGINT', () => {
    console.log('\n🔄 收到退出信号，正在断开连接...');
    client.end();
    process.exit(0);
});

process.on('SIGTERM', () => {
    console.log('\n🔄 收到终止信号，正在断开连接...');
    client.end();
    process.exit(0);
});
