const http = require('http');

const baseUrl = 'http://localhost:5001';

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

async function testDeviceManagement() {
    console.log('🧪 测试已注册设备管理\n');
    
    try {
        // 1. 登录
        console.log('🔐 管理员登录...');
        const loginResponse = await makeRequest('POST', '/api/auth/login', {
            email: 'admin@example.com',
            password: '123456'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ 登录成功\n');
        
        const authHeaders = { 'Authorization': `Bearer ${token}` };
        
        // 2. 查看所有设备
        console.log('📱 查询所有设备...');
        const devicesResponse = await makeRequest('GET', '/api/devices', null, authHeaders);
        
        const devices = devicesResponse.data.data.devices;
        
        if (!Array.isArray(devices)) {
            console.log('❌ 设备数据格式错误:', typeof devices);
            return;
        }
        
        console.log(`📊 设备总数: ${devices.length}`);
        devices.forEach((device, index) => {
            console.log(`   ${index + 1}. ${device.name} (${device.deviceId}) - ${device.status}`);
            if (device.mqtt && device.mqtt.isConnected) {
                console.log(`      🟢 MQTT连接状态: 已连接 (客户端ID: ${device.mqtt.clientId})`);
            }
            if (device.lastHeartbeat) {
                console.log(`      💓 最后心跳: ${new Date(device.lastHeartbeat).toLocaleString()}`);
            }
        });
        
        // 3. 查找您的调试设备
        const debugDevice = devices.find(d => d.deviceId === 'debug_device_001');
        if (debugDevice) {
            console.log(`\n🎯 找到您的设备: ${debugDevice.name}`);
            console.log(`   设备ID: ${debugDevice.deviceId}`);
            console.log(`   设备类型: ${debugDevice.type}`);
            console.log(`   状态: ${debugDevice.status}`);
            console.log(`   数据库ID: ${debugDevice._id}`);
            
            // 4. 测试内容推送到您的设备
            console.log('\n📺 测试内容推送到您的设备...');
            const pushContent = {
                deviceIds: [debugDevice.deviceId],
                content: {
                    contentId: `test_push_${Date.now()}`,
                    title: '测试推送内容',
                    url: 'https://example.com/test-image.jpg',
                    type: 'image',
                    duration: 15,
                    priority: 1,
                    description: '这是一个测试推送给debug_device_001的内容'
                }
            };
            
            try {
                const pushResponse = await makeRequest('POST', '/api/mqtt/push', pushContent, authHeaders);
                console.log('✅ 内容推送API调用成功');
                console.log(`📤 推送结果: ${pushResponse.data.message}`);
            } catch (error) {
                console.log('❌ 内容推送失败:', error.response?.data || error.message);
            }
            
            // 5. 测试广播消息
            console.log('\n📢 测试广播消息...');
            try {
                const broadcastResponse = await makeRequest('POST', '/api/mqtt/broadcast', {
                    message: '这是一条发送给所有设备的测试广播消息',
                    type: 'announcement',
                    title: '测试广播'
                }, authHeaders);
                console.log('✅ 广播消息发送成功');
            } catch (error) {
                console.log('❌ 广播消息发送失败:', error.response?.data || error.message);
            }
            
        } else {
            console.log('\n❌ 未找到您的调试设备 (debug_device_001)');
            console.log('请确保设备已正确注册');
        }
        
    } catch (error) {
        console.error('❌ 测试失败:', error.response?.data || error.message);
    }
}

testDeviceManagement();
