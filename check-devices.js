const mongoose = require('mongoose');

// MongoDB连接
const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/media-program', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB connected');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
};

// 设备模型
const deviceSchema = new mongoose.Schema({
  deviceId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  location: {
    name: String,
    address: String,
    coordinates: {
      latitude: Number,
      longitude: Number
    }
  },
  mqtt: {
    clientId: String,
    isConnected: Boolean,
    lastConnectedAt: Date
  },
  status: String,
  lastHeartbeat: Date,
  createdAt: Date,
  updatedAt: Date
});

const Device = mongoose.model('Device', deviceSchema);

async function checkDevices() {
  await connectDB();
  
  console.log('🔍 查询数据库中的设备...');
  
  try {
    const devices = await Device.find({});
    console.log(`📊 数据库中共有 ${devices.length} 个设备:`);
    
    if (devices.length === 0) {
      console.log('❌ 数据库中没有任何设备记录！');
      console.log('💡 这可能说明：');
      console.log('  1. Android设备的注册消息没有到达后端');
      console.log('  2. 后端MQTT服务没有正确处理注册消息');
      console.log('  3. 数据库连接有问题');
    } else {
      devices.forEach((device, index) => {
        console.log(`\n📱 设备 ${index + 1}:`);
        console.log(`  设备ID: ${device.deviceId}`);
        console.log(`  名称: ${device.name}`);
        console.log(`  类型: ${device.type}`);
        console.log(`  状态: ${device.status}`);
        console.log(`  位置: ${device.location?.name || '未知'}`);
        console.log(`  MQTT客户端ID: ${device.mqtt?.clientId || '无'}`);
        console.log(`  MQTT连接状态: ${device.mqtt?.isConnected ? '已连接' : '已断开'}`);
        console.log(`  最后心跳: ${device.lastHeartbeat || '无'}`);
        console.log(`  创建时间: ${device.createdAt || '无'}`);
      });
    }
  } catch (error) {
    console.error('❌ 查询设备失败:', error);
  }
  
  await mongoose.disconnect();
  console.log('🔌 数据库连接已关闭');
}

checkDevices();
