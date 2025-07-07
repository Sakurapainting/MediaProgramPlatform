import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { User } from '../models/User';
import { Device } from '../models/Device';
import { Content } from '../models/Content';
import { Campaign } from '../models/Campaign';

// Load environment variables
dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/media-platform';

async function initializeDatabase() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data (development only)
    if (process.env.NODE_ENV === 'development') {
      await User.deleteMany({});
      await Device.deleteMany({});
      await Content.deleteMany({});
      await Campaign.deleteMany({});
      console.log('Cleared existing data');
    }

    // Create admin user
    const adminPassword = await bcrypt.hash('123456', 10);
    const adminUser = new User({
      username: 'admin',
      email: 'admin@example.com',
      password: adminPassword,
      role: 'admin',
      isActive: true
    });
    await adminUser.save();
    console.log('Created admin user: admin@example.com / 123456');

    // Create operator user
    const operatorPassword = await bcrypt.hash('123456', 10);
    const operatorUser = new User({
      username: 'operator',
      email: 'operator@example.com',
      password: operatorPassword,
      role: 'operator',
      isActive: true
    });
    await operatorUser.save();
    console.log('Created operator user: operator@example.com / 123456');

    // Create sample devices
    const sampleDevices = [
      {
        deviceId: 'DEV001',
        name: '商场主屏-1F',
        type: 'led_screen',
        location: {
          name: '万达广场1楼大厅',
          address: '北京市朝阳区万达广场1号',
          coordinates: {
            latitude: 39.9042,
            longitude: 116.4074
          },
          region: '华北',
          city: '北京'
        },
        specifications: {
          resolution: '1920x1080',
          size: '55英寸',
          orientation: 'horizontal'
        },
        status: 'online',
        isActive: true,
        tags: ['商场', '室内', '高清']
      },
      {
        deviceId: 'DEV002',
        name: '户外LED-东门',
        type: 'led_screen',
        location: {
          name: '市中心东门广场',
          address: '北京市东城区东门大街88号',
          coordinates: {
            latitude: 39.9028,
            longitude: 116.4074
          },
          region: '华北',
          city: '北京'
        },
        specifications: {
          resolution: '1280x720',
          size: '120英寸',
          orientation: 'horizontal'
        },
        status: 'offline',
        isActive: true,
        tags: ['户外', '大屏', '广场']
      },
      {
        deviceId: 'DEV003',
        name: '地铁屏-站台A',
        type: 'lcd_display',
        location: {
          name: '地铁1号线A站台',
          address: '北京市海淀区地铁1号线',
          coordinates: {
            latitude: 39.9085,
            longitude: 116.3974
          },
          region: '华北',
          city: '北京'
        },
        specifications: {
          resolution: '1920x1080',
          size: '32英寸',
          orientation: 'horizontal'
        },
        status: 'online',
        isActive: true,
        tags: ['地铁', '交通', '人流密集']
      }
    ];

    for (const deviceData of sampleDevices) {
      const device = new Device(deviceData);
      await device.save();
    }
    console.log('Created sample devices');

    // Create sample content
    const sampleContent = [
      {
        title: '春季促销广告',
        description: '春季商品促销活动宣传视频',
        type: 'video',
        fileUrl: '/uploads/spring-sale.mp4',
        thumbnailUrl: '/uploads/spring-sale-thumb.jpg',
        duration: 30,
        fileSize: 50000000,
        format: 'mp4',
        resolution: '1920x1080',
        tags: ['促销', '春季', '商品'],
        category: '广告',
        status: 'approved',
        uploadedBy: adminUser._id,
        approvedBy: adminUser._id,
        approvedAt: new Date(),
        metadata: {
          codec: 'H.264',
          bitrate: '2000kbps'
        }
      },
      {
        title: '企业形象宣传',
        description: '公司品牌形象宣传片',
        type: 'video',
        fileUrl: '/uploads/company-intro.mp4',
        thumbnailUrl: '/uploads/company-intro-thumb.jpg',
        duration: 60,
        fileSize: 80000000,
        format: 'mp4',
        resolution: '1920x1080',
        tags: ['企业', '品牌', '形象'],
        category: '宣传',
        status: 'approved',
        uploadedBy: adminUser._id,
        approvedBy: adminUser._id,
        approvedAt: new Date(),
        metadata: {
          codec: 'H.264',
          bitrate: '3000kbps'
        }
      }
    ];

    for (const contentData of sampleContent) {
      const content = new Content(contentData);
      await content.save();
    }
    console.log('Created sample content');

    console.log('Database initialization completed successfully!');
    
  } catch (error) {
    console.error('Database initialization failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run initialization
initializeDatabase();
