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

async function testContentPush() {
    console.log('📺 测试内容推送到稳定设备');
    console.log('================================\n');
    
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
        
        // 2. 查看所有设备，找到稳定设备
        console.log('📱 查询所有设备...');
        const devicesResponse = await makeRequest('GET', '/api/devices', null, authHeaders);
        
        const devices = devicesResponse.data.data.devices;
        console.log(`📊 设备总数: ${devices.length}`);
        
        const stableDevice = devices.find(d => d.deviceId === 'debug_device_stable');
        if (!stableDevice) {
            console.log('❌ 未找到稳定测试设备，请先确保设备已注册');
            return;
        }
        
        console.log(`🎯 找到稳定设备: ${stableDevice.name || stableDevice.deviceId}`);
        console.log(`   设备ID: ${stableDevice.deviceId}`);
        console.log(`   状态: ${stableDevice.status}`);
        
        // 3. 推送测试内容
        console.log('\n📺 推送测试内容...');
        const pushContent = {
            deviceIds: [stableDevice.deviceId],
            content: {
                contentId: `test_push_${Date.now()}`,
                title: '🎉 恭喜！内容推送测试成功',
                url: 'https://example.com/test-content.jpg',
                type: 'image',
                duration: 30,
                priority: 1,
                description: '这是一个验证端到端MQTT内容推送功能的测试内容。如果您的Android设备收到了这条消息，说明系统工作正常！'
            }
        };
        
        try {
            const pushResponse = await makeRequest('POST', '/api/mqtt/push', pushContent, authHeaders);
            console.log('✅ 内容推送API调用成功');
            console.log(`📤 推送结果: ${pushResponse.data.message}`);
            console.log(`📝 推送详情: ${JSON.stringify(pushResponse.data.details, null, 2)}`);
        } catch (error) {
            console.log('❌ 内容推送失败:', error.response?.data || error.message);
        }
        
        // 4. 等待几秒后发送广播消息
        console.log('\n⏳ 等待3秒后发送广播消息...');
        await new Promise(resolve => setTimeout(resolve, 3000));
        
        console.log('📢 发送广播消息...');
        try {
            const broadcastResponse = await makeRequest('POST', '/api/mqtt/broadcast', {
                message: {
                    type: 'test_announcement',
                    title: '🔊 系统广播测试',
                    content: '这是一条广播测试消息！所有在线设备都应该收到这条消息。',
                    timestamp: new Date().toISOString()
                }
            }, authHeaders);
            console.log('✅ 广播消息发送成功');
            console.log(`📤 广播结果: ${broadcastResponse.data.message}`);
        } catch (error) {
            console.log('❌ 广播消息发送失败:', error.response?.data || error.message);
        }
        
        console.log('\n🎉 内容推送测试完成！');
        console.log('📋 请检查Android设备控制台是否收到了：');
        console.log('   1. 专用内容推送消息');
        console.log('   2. 广播消息');
        console.log('\n💡 如果收到了这些消息，说明端到端MQTT通信完全正常！');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.response?.data || error.message);
    }
}

testContentPush();
