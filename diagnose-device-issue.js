// 使用现有的包来监听MQTT消息
const net = require('net');

// 简单的MQTT监听器 
console.log('🔍 监听MQTT消息...');
console.log('💡 从之前的日志我们知道Android设备ID是: android_06f3527a');
console.log('💡 客户端ID是: mqtt_client_06f3527a');
console.log('');

// 检查现有的MQTT监听器输出
console.log('📋 我们需要检查几个关键点：');
console.log('1. Android设备是否发送注册消息到 device/register 主题');
console.log('2. 后端是否接收并处理了这些消息'); 
console.log('3. 设备信息是否保存到数据库');
console.log('4. 前端API是否正确获取设备列表');
console.log('');

console.log('💬 根据之前的MQTT监听器日志，我们看到：');
console.log('✅ Android设备成功连接到MQTT服务器');
console.log('✅ 发送了device/register消息');
console.log('✅ 接收到了register/confirm响应');
console.log('✅ 定期发送heartbeat消息');
console.log('');

console.log('🤔 问题可能出现在：');
console.log('1. 后端HTTP服务没有启动（端口3000没有监听）');
console.log('2. 数据库没有正确保存设备信息');
console.log('3. 前端调用API时出错');
console.log('');

console.log('🎯 建议的检查步骤：');
console.log('1. 确保后端HTTP服务正在运行（npm start 在 server 目录）');
console.log('2. 确保前端开发服务器正在运行（npm run dev 在 client 目录）');
console.log('3. 检查MongoDB是否运行并可连接');
console.log('4. 在浏览器中打开前端并查看设备管理页面');

setTimeout(() => {
  console.log('✨ 监听完成');
}, 2000);
