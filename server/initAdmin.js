const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// 简化的用户模型
const userSchema = new mongoose.Schema({
  username: String,
  email: String,
  password: String,
  role: String,
  isActive: { type: Boolean, default: true }
});

const User = mongoose.model('User', userSchema);

async function createAdminUser() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/media-platform';
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // 清除现有的admin用户
    await User.deleteOne({ email: 'admin@example.com' });
    console.log('Cleared existing admin user');

    // 创建新的管理员账号
    const hashedPassword = await bcrypt.hash('123456', 12);
    
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: hashedPassword,
      role: 'admin',
      isActive: true
    });

    await adminUser.save();
    console.log('✅ Admin user created successfully!');
    console.log('📧 Email: admin@example.com');
    console.log('🔑 Password: 123456');
    
    // 验证用户创建
    const verifyUser = await User.findOne({ email: 'admin@example.com' });
    if (verifyUser) {
      console.log('✅ User verification successful');
      const passwordMatch = await bcrypt.compare('123456', verifyUser.password);
      console.log('✅ Password verification:', passwordMatch ? 'PASSED' : 'FAILED');
    }
    
  } catch (error) {
    console.error('❌ Error creating admin user:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

createAdminUser();
