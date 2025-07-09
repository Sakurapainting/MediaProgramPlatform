#!/usr/bin/env node

/**
 * 本地MQTT端到端测试脚本
 * 测试本地Aedes broker与模拟安卓设备的完整通信流程
 */

const mqtt = require('mqtt');
const axios = require('axios');
const os = require('os');

// 配置信息
const SERVER_IP = '127.0.0.1'; // 本地测试
const MQTT_PORT = 1883;
const API_PORT = 5001;
const MQTT_URL = `mqtt://${SERVER_IP}:${MQTT_PORT}`;
const API_BASE_URL = `http://${SERVER_IP}:${API_PORT}`;

console.log('🚀 本地MQTT broker端到端测试开始...\n');

// 获取本机IP地址
function getLocalIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }
    return '127.0.0.1';
}

const LOCAL_IP = getLocalIP();

console.log('📋 测试配置:');
console.log(`   MQTT Broker: ${MQTT_URL}`);
console.log(`   API Server: ${API_BASE_URL}`);
console.log(`   本机IP: ${LOCAL_IP}`);
console.log(`   安卓设备配置: tcp://${LOCAL_IP}:1883\n`);

// 模拟设备数据
const DEVICE_ID = 'android_test_001';
const CLIENT_ID = `mqtt_client_${Date.now()}`;

let mqttClient;
let testResults = {
    connection: false,
    registration: false,
    heartbeat: false,
    contentPush: false,
    command: false
};

// MQTT连接测试
async function testMqttConnection() {
    return new Promise((resolve, reject) => {
        console.log('1️⃣ 测试MQTT连接...');
        
        mqttClient = mqtt.connect(MQTT_URL, {
            clientId: CLIENT_ID,
            clean: true,
            connectTimeout: 5000,
            keepalive: 60
        });

        mqttClient.on('connect', () => {
            console.log('   ✅ MQTT连接成功');
            testResults.connection = true;
            resolve();
        });

        mqttClient.on('error', (error) => {
            console.log('   ❌ MQTT连接失败:', error.message);
            reject(error);
        });

        setTimeout(() => {
            if (!testResults.connection) {
                reject(new Error('连接超时'));
            }
        }, 5000);
    });
}

// 设备注册测试
async function testDeviceRegistration() {
    return new Promise((resolve) => {
        console.log('2️⃣ 测试设备注册...');
        
        const registerMessage = {
            type: 'register',
            deviceId: DEVICE_ID,
            clientId: CLIENT_ID,
            timestamp: Date.now(),
            data: {
                deviceId: DEVICE_ID,
                name: '测试安卓屏幕终端',
                type: 'android_screen',
                location: {
                    name: '测试位置',
                    address: '测试地址'
                },
                specifications: {
                    resolution: '1920x1080',
                    size: '55寸',
                    orientation: 'horizontal'
                },
                version: '1.0.0',
                capabilities: ['display', 'audio', 'touch']
            }
        };

        mqttClient.publish('device/register', JSON.stringify(registerMessage), { qos: 1 }, (error) => {
            if (error) {
                console.log('   ❌ 设备注册失败:', error.message);
            } else {
                console.log('   ✅ 设备注册消息发送成功');
                testResults.registration = true;
            }
            resolve();
        });
    });
}

// 心跳测试
async function testHeartbeat() {
    return new Promise((resolve) => {
        console.log('3️⃣ 测试心跳消息...');
        
        const heartbeatMessage = {
            type: 'heartbeat',
            deviceId: DEVICE_ID,
            clientId: CLIENT_ID,
            timestamp: Date.now(),
            data: {
                uptime: 12345,
                memoryUsage: 45.6,
                cpuUsage: 23.1,
                temperature: 35,
                brightness: 80
            }
        };

        mqttClient.publish('device/heartbeat', JSON.stringify(heartbeatMessage), { qos: 1 }, (error) => {
            if (error) {
                console.log('   ❌ 心跳消息发送失败:', error.message);
            } else {
                console.log('   ✅ 心跳消息发送成功');
                testResults.heartbeat = true;
            }
            resolve();
        });
    });
}

// 内容推送测试
async function testContentPush() {
    return new Promise((resolve) => {
        console.log('4️⃣ 测试内容推送订阅...');
        
        // 订阅内容推送主题
        const contentTopic = `device/${CLIENT_ID}/content`;
        
        mqttClient.subscribe(contentTopic, { qos: 1 }, (error) => {
            if (error) {
                console.log('   ❌ 订阅内容推送主题失败:', error.message);
                resolve();
            } else {
                console.log('   ✅ 订阅内容推送主题成功');
                testResults.contentPush = true;
                resolve();
            }
        });
    });
}

// 命令订阅测试
async function testCommandSubscription() {
    return new Promise((resolve) => {
        console.log('5️⃣ 测试命令订阅...');
        
        // 订阅命令主题
        const commandTopic = `device/${CLIENT_ID}/commands`;
        
        mqttClient.subscribe(commandTopic, { qos: 1 }, (error) => {
            if (error) {
                console.log('   ❌ 订阅命令主题失败:', error.message);
                resolve();
            } else {
                console.log('   ✅ 订阅命令主题成功');
                testResults.command = true;
                resolve();
            }
        });
    });
}

// API连接测试
async function testAPIConnection() {
    console.log('6️⃣ 测试API连接...');
    
    try {
        const response = await axios.get(`${API_BASE_URL}/health`, { timeout: 5000 });
        console.log('   ✅ API连接成功');
        console.log('   📊 API状态:', response.data);
        return true;
    } catch (error) {
        console.log('   ❌ API连接失败:', error.message);
        return false;
    }
}

// 显示测试结果
function showResults() {
    console.log('\n📊 测试结果汇总:');
    console.log('========================');
    
    Object.entries(testResults).forEach(([test, result]) => {
        const status = result ? '✅ 通过' : '❌ 失败';
        const testName = {
            connection: 'MQTT连接',
            registration: '设备注册',
            heartbeat: '心跳消息',
            contentPush: '内容推送订阅',
            command: '命令订阅'
        }[test];
        
        console.log(`   ${testName}: ${status}`);
    });
    
    const passedTests = Object.values(testResults).filter(result => result).length;
    const totalTests = Object.keys(testResults).length;
    
    console.log(`\n通过率: ${passedTests}/${totalTests} (${Math.round(passedTests/totalTests*100)}%)`);
}

// 配置建议
function showConfigurationAdvice() {
    console.log('\n🔧 安卓设备配置建议:');
    console.log('========================');
    console.log('在安卓App中配置以下参数:');
    console.log(`   MQTT服务器: ${LOCAL_IP}`);
    console.log(`   MQTT端口: 1883`);
    console.log(`   API服务器: http://${LOCAL_IP}:5001`);
    
    console.log('\n📱 代码配置示例:');
    console.log('```java');
    console.log(`String MQTT_BROKER_URL = "tcp://${LOCAL_IP}:1883";`);
    console.log(`String API_BASE_URL = "http://${LOCAL_IP}:5001";`);
    console.log('```');
    
    console.log('\n🔥 防火墙端口开放 (Windows):');
    console.log('```powershell');
    console.log('New-NetFirewallRule -DisplayName "MQTT Server" -Direction Inbound -Protocol TCP -LocalPort 1883 -Action Allow');
    console.log('New-NetFirewallRule -DisplayName "Media Platform API" -Direction Inbound -Protocol TCP -LocalPort 5001 -Action Allow');
    console.log('```');
    
    console.log('\n🔥 防火墙端口开放 (Linux):');
    console.log('```bash');
    console.log('sudo ufw allow 1883');
    console.log('sudo ufw allow 5001');
    console.log('```');
}

// 主测试流程
async function runTests() {
    try {
        await testMqttConnection();
        await testDeviceRegistration();
        await testHeartbeat();
        await testContentPush();
        await testCommandSubscription();
        await testAPIConnection();
        
        // 等待一下让所有消息处理完成
        await new Promise(resolve => setTimeout(resolve, 1000));
        
    } catch (error) {
        console.log('\n❌ 测试过程中出现错误:', error.message);
    } finally {
        if (mqttClient) {
            mqttClient.end();
        }
        
        showResults();
        showConfigurationAdvice();
        
        console.log('\n🎉 本地MQTT broker端到端测试完成!');
        
        if (Object.values(testResults).every(result => result)) {
            console.log('✅ 所有测试通过! 您的本地MQTT broker配置正确。');
        } else {
            console.log('⚠️  部分测试失败，请检查配置。');
        }
    }
}

// 运行测试
if (require.main === module) {
    runTests();
}

module.exports = { runTests };
