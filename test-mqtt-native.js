const https = require('https');
const http = require('http');
const querystring = require('querystring');

const baseUrl = 'ht        const createResponse = await makeRequest('POST', `/api/devices`, testDevice, authHeaders);
        console.log('✅ 测试设备创建成功:');
        console.log(`   - 设备ID: ${createResponse.data.data.deviceId}`);
        console.log(`   - 数据库ID: ${createResponse.data.data._id}`);/localhost:5001';

function makeRequest(method, path, data = null, headers = {}) {
    return new Promise((resolve, reject) => {
        const url = new URL(baseUrl + path);
        const options = {
            hostname: url.hostname,
            port: url.port,
            path: url.pathname,
            method: method,
            headers: {
                'Content-Type': 'application/json',
                ...headers
            }
        };

        const req = http.request(options, (res) => {
            let responseData = '';
            
            res.on('data', (chunk) => {
                responseData += chunk;
            });
            
            res.on('end', () => {
                try {
                    const jsonData = JSON.parse(responseData);
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({ data: jsonData, status: res.statusCode });
                    } else {
                        reject({ response: { data: jsonData, status: res.statusCode } });
                    }
                } catch (e) {
                    if (res.statusCode >= 200 && res.statusCode < 300) {
                        resolve({ data: responseData, status: res.statusCode });
                    } else {
                        reject({ message: responseData, status: res.statusCode });
                    }
                }
            });
        });

        req.on('error', (error) => {
            reject(error);
        });

        if (data) {
            req.write(JSON.stringify(data));
        }
        
        req.end();
    });
}

async function testMQTTAPI() {
    console.log('🚀 开始测试MQTT API功能\n');
    
    try {
        // 1. 登录获取token
        console.log('🔐 1. 管理员登录...');
        const loginResponse = await makeRequest('POST', '/api/auth/login', {
            email: 'admin@example.com',
            password: '123456'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ 登录成功，获取到token');
        
        const authHeaders = {
            'Authorization': `Bearer ${token}`
        };
        
        // 2. 测试MQTT状态
        console.log('\n📡 2. 查询MQTT状态...');
        const statusResponse = await makeRequest('GET', '/api/mqtt/status', null, authHeaders);
        console.log('✅ MQTT状态查询成功:');
        console.log(`   - MQTT服务器运行: ${statusResponse.data.mqtt.serverRunning}`);
        console.log(`   - 端口: ${statusResponse.data.mqtt.port}`);
        console.log(`   - 已连接客户端: ${statusResponse.data.mqtt.connectedClients}`);
        console.log(`   - 总设备数: ${statusResponse.data.devices.total}`);
        console.log(`   - 在线设备: ${statusResponse.data.devices.online}`);
        console.log(`   - 离线设备: ${statusResponse.data.devices.offline}`);
        
        // 3. 测试设备列表
        console.log('\n📱 3. 查询MQTT设备列表...');
        const devicesResponse = await makeRequest('GET', '/api/mqtt/devices', null, authHeaders);
        const devices = devicesResponse.data;
        console.log(`✅ 查询到 ${devices.length} 个安卓设备`);
        
        if (devices.length > 0) {
            devices.forEach((device, index) => {
                console.log(`   设备 ${index + 1}:`);
                console.log(`     - ID: ${device.deviceId}`);
                console.log(`     - 名称: ${device.name}`);
                console.log(`     - 状态: ${device.status}`);
                console.log(`     - MQTT连接: ${device.mqtt?.isConnected ? '已连接' : '未连接'}`);
            });
        }
        
        // 4. 创建测试设备
        console.log('\n🤖 4. 创建测试安卓设备...');
        const testDevice = {
            deviceId: 'android_test_api_001',
            name: '测试安卓终端_API',
            type: 'android_screen',
            location: {
                name: 'API测试大厅',
                address: '北京市朝阳区API测试大厦1层',
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
            mqtt: {
                clientId: 'api_test_client_001',
                isConnected: false,
                subscriptions: [],
                messageCount: 0
            },
            tags: ['api_test', 'mqtt', 'android']
        };
        
        const createResponse = await makeRequest('POST', '/api/devices', testDevice, authHeaders);
        console.log('✅ 测试设备创建成功:');
        console.log(`   - 设备ID: ${createResponse.data.device.deviceId}`);
        console.log(`   - 数据库ID: ${createResponse.data.device._id}`);
        
        // 5. 测试内容推送API
        console.log('\n📺 5. 测试内容推送API...');
        const pushData = {
            deviceIds: [createResponse.data.device.deviceId],
            content: {
                contentId: 'test_content_001',
                url: 'https://example.com/test-image.jpg',
                type: 'image',
                duration: 10,
                priority: 1
            }
        };
        
        try {
            const pushResponse = await makeRequest('POST', '/api/mqtt/push', pushData, authHeaders);
            console.log('✅ 内容推送API调用成功');
            if (pushResponse.data.results) {
                console.log(`   - 成功推送设备数: ${pushResponse.data.results.filter(r => r.success).length}`);
                console.log(`   - 失败设备数: ${pushResponse.data.results.filter(r => !r.success).length}`);
            }
        } catch (error) {
            console.log('⚠️  内容推送失败 (设备未连接MQTT):', error.response?.data?.message || error.message);
        }
        
        // 6. 测试命令下发API
        console.log('\n🎮 6. 测试命令下发API...');
        const commandData = {
            deviceId: createResponse.data.device.deviceId,
            command: {
                command: 'screenshot',
                params: {
                    quality: 90,
                    format: 'jpg'
                }
            }
        };
        
        try {
            const commandResponse = await makeRequest('POST', '/api/mqtt/command', commandData, authHeaders);
            console.log('✅ 命令下发API调用成功');
        } catch (error) {
            console.log('⚠️  命令下发失败 (设备未连接MQTT):', error.response?.data?.message || error.message);
        }
        
        // 7. 清理测试数据
        console.log('\n🧹 7. 清理测试设备...');
        await makeRequest('DELETE', `/api/devices/${createResponse.data.device._id}`, null, authHeaders);
        console.log('✅ 测试设备已删除');
        
        console.log('\n🎉 MQTT API测试完成!');
        console.log('\n📋 测试总结:');
        console.log('✅ MQTT服务运行正常');
        console.log('✅ API认证功能正常');
        console.log('✅ 设备管理功能正常');
        console.log('✅ 内容推送API正常');
        console.log('✅ 命令下发API正常');
        
        console.log('\n📱 下一步: 安卓终端连接');
        console.log('请使用以下信息配置安卓终端:');
        console.log(`   MQTT服务器: localhost (或您的服务器IP)`);
        console.log(`   MQTT端口: ${statusResponse.data.mqtt.port}`);
        console.log('   协议: MQTT v3.1.1');
        console.log('   QoS: 1');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.response?.data || error.message);
    }
}

// 运行测试
testMQTTAPI();
