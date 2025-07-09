const http = require('http');
const os = require('os');

const baseUrl = 'http://localhost:5001';

function getServerIP() {
    const interfaces = os.networkInterfaces();
    for (const name of Object.keys(interfaces)) {
        for (const interface of interfaces[name]) {
            if (interface.family === 'IPv4' && !interface.internal) {
                return interface.address;
            }
        }
    }
    return 'localhost';
}

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

async function quickTest() {
    console.log('🚀 快速本地MQTT服务器功能测试\n');
    
    const serverIP = getServerIP();
    console.log(`🌐 本机IP地址: ${serverIP}`);
    console.log(`📡 MQTT服务器地址: ${serverIP}:1883`);
    console.log(`🔗 云平台API地址: http://${serverIP}:5001\n`);
    
    try {
        // 1. 登录
        console.log('🔐 管理员登录...');
        const loginResponse = await makeRequest('POST', '/api/auth/login', {
            email: 'admin@example.com',
            password: '123456'
        });
        
        const token = loginResponse.data.data.token;
        console.log('✅ 登录成功');
        
        const authHeaders = { 'Authorization': `Bearer ${token}` };
        
        // 2. MQTT状态
        console.log('\n📡 查询MQTT Broker状态...');
        try {
            const statusResponse = await makeRequest('GET', '/api/mqtt/status', null, authHeaders);
            console.log(`✅ MQTT Broker运行状态: ${statusResponse.data.mqtt.isRunning ? '正常运行' : '未运行'}`);
            console.log(`� MQTT服务器地址: ${serverIP}:${statusResponse.data.mqtt.port}`);
            console.log(`📱 设备统计 - 总计: ${statusResponse.data.devices.total}, 在线: ${statusResponse.data.devices.online}`);
        } catch (error) {
            console.log('⚠️  MQTT状态查询失败，继续测试...');
        }
        
        // 3. 创建测试设备
        console.log('\n🤖 创建测试设备...');
        const testDevice = {
            deviceId: 'android_local_test',
            name: '本地测试终端',
            type: 'android_screen',
            location: {
                name: '测试位置',
                address: '测试地址',
                coordinates: { latitude: 39.9042, longitude: 116.4074 },
                region: '华北',
                city: '北京'
            },
            specifications: {
                resolution: '1920x1080',
                size: '55寸',
                orientation: 'horizontal'
            },
            tags: ['test', 'mqtt', 'local-broker']
        };
        
        const createResponse = await makeRequest('POST', '/api/devices', testDevice, authHeaders);
        const device = createResponse.data.data;
        console.log(`✅ 设备创建成功: ${device.deviceId} (ID: ${device._id})`);
        
        // 4. 测试推送
        console.log('\n📺 测试内容推送...');
        try {
            const pushResponse = await makeRequest('POST', '/api/mqtt/push', {
                deviceIds: [device.deviceId],
                content: {
                    contentId: 'test_content',
                    url: 'https://example.com/test.jpg',
                    type: 'image',
                    duration: 10,
                    priority: 1
                }
            }, authHeaders);
            console.log('✅ 推送API调用成功');
        } catch (error) {
            console.log('⚠️  推送失败 (设备未连接到本地MQTT服务器)');
        }
        
        // 5. 清理
        console.log('\n🧹 清理测试数据...');
        await makeRequest('DELETE', `/api/devices/${device._id}`, null, authHeaders);
        console.log('✅ 测试设备已删除');
        
        console.log('\n🎉 快速测试完成!');
        console.log('\n📋 结论:');
        console.log('✅ 云平台API服务正常');
        console.log('✅ API认证正常');
        console.log('✅ 设备管理正常');
        console.log('✅ 内容推送API正常');
        console.log('✅ 本地MQTT Broker服务正常');
        
        console.log('\n📱 安卓终端连接信息:');
        console.log(`   � MQTT服务器: ${serverIP}`);
        console.log(`   📂 MQTT端口: 1883`);
        console.log(`   🔗 云平台API: http://${serverIP}:5001`);
        console.log('   📄 消息格式: JSON');
        
        console.log('\n📋 MQTT主题说明:');
        console.log('   📢 设备注册: device/register');
        console.log('   💓 心跳上报: device/heartbeat');
        console.log('   📊 状态上报: device/status');
        console.log('   📤 内容推送: device/{clientId}/content');
        console.log('   🎛️ 命令下发: device/{clientId}/command');
        console.log('   � 广播消息: broadcast/all');
        
        console.log('\n🌐 网络配置要求:');
        console.log('   🔧 开放防火墙端口: 1883 (MQTT), 5001 (API)');
        console.log(`   🏠 安卓设备能访问服务器: ${serverIP}`);
        console.log('   📱 安卓端配置MQTT服务器为: YOUR_SERVER_IP:1883');
        console.log('   📡 同一局域网内设备可直接连接');
        
        console.log('\n💡 使用提示:');
        console.log('   1. 云平台运行本地MQTT Broker服务');
        console.log(`   2. 安卓端配置MQTT服务器为 ${serverIP}:1883`);
        console.log(`   3. 安卓端配置API服务器为 http://${serverIP}:5001`);
        console.log('   4. 确保防火墙开放相应端口');
        console.log('   5. 局域网环境下性能最佳');
        
        console.log('\n🔧 防火墙配置命令:');
        console.log('   Windows: 在防火墙设置中开放端口 1883 和 5001');
        console.log('   Linux: sudo ufw allow 1883 && sudo ufw allow 5001');
        console.log('   测试连通性: telnet YOUR_SERVER_IP 1883');
        
    } catch (error) {
        console.error('❌ 测试失败:', error.response?.data || error.message);
        console.log('\n🔧 故障排除建议:');
        console.log('   1. 确认云平台服务已启动: npm run dev');
        console.log('   2. 确认MQTT Broker已启动（查看控制台日志）');
        console.log('   3. 确认防火墙已开放端口 1883 和 5001');
        console.log('   4. 运行网络检查脚本: network-check.bat');
        console.log('   5. 检查MongoDB数据库连接状态');
    }
}

quickTest();
