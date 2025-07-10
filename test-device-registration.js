const mqtt = require('mqtt');

// 测试连接到本地MQTT服务器并检查设备注册
async function testDeviceRegistration() {
  console.log('🔍 开始测试设备注册流程...');
  
  // 连接到MQTT服务器
  const client = mqtt.connect('mqtt://localhost:1883', {
    clientId: 'test_device_checker'
  });
  
  client.on('connect', () => {
    console.log('✅ 连接到MQTT服务器成功');
    
    // 订阅设备相关主题
    client.subscribe('device/+/register/confirm', (err) => {
      if (err) {
        console.error('❌ 订阅失败:', err);
      } else {
        console.log('📋 已订阅设备注册确认主题');
      }
    });
    
    // 监听一段时间查看是否有设备活动
    console.log('👀 监听设备活动中...');
    setTimeout(() => {
      console.log('⏰ 监听结束');
      client.end();
    }, 10000);
  });
  
  client.on('message', (topic, message) => {
    console.log(`📨 收到消息 - 主题: ${topic}`);
    console.log(`📄 内容: ${message.toString()}`);
  });
  
  client.on('error', (err) => {
    console.error('❌ MQTT连接错误:', err);
  });
}

testDeviceRegistration();
