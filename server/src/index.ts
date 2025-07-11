import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { createServer } from 'http';

// 导入路由
import authRoutes from './routes/auth';
import userRoutes from './routes/user';
import deviceRoutes from './routes/device';
import contentRoutes from './routes/content';
import campaignRoutes from './routes/campaign';
import analyticsRoutes from './routes/analytics';
import mqttRoutes from './routes/mqtt';

// 导入服务
import MQTTService from './services/mqttService';

// 导入中间件
import { authenticateToken } from './middleware/auth';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/media-platform';
const MQTT_PORT = process.env.MQTT_PORT ? parseInt(process.env.MQTT_PORT) : 1883;

// 创建HTTP服务器
const httpServer = createServer(app);

// 中间件配置
app.use(helmet({
  crossOriginEmbedderPolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

app.use(cors({
  origin: [
    'http://localhost:3001', 
    'http://localhost:3002', 
    'http://localhost:3003',
    process.env.CLIENT_URL || 'http://localhost:3001'
  ],
  credentials: true
}));

app.use(morgan('combined'));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// 数据库连接
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB 连接成功');
  })
  .catch((error) => {
    console.error('❌ MongoDB 连接失败:', error);
    process.exit(1);
  });

// 初始化MQTT服务
console.log('🚀 初始化MQTT服务...');
const mqttService = new MQTTService(MQTT_PORT);

// 启动MQTT服务
mqttService.start();

// 将MQTT服务实例挂载到app上，供路由使用
app.set('mqttService', mqttService);

// 同时作为全局变量，供其他模块使用
(global as any).mqttService = mqttService;

// 基础健康检查路由
app.get('/health', (req, res) => {
  res.json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    services: {
      http: 'running',
      database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
      mqtt: mqttService.getStats()
    }
  });
});

// API路由
app.use('/api/auth', authRoutes);
app.use('/api/users', authenticateToken, userRoutes);
app.use('/api/devices', authenticateToken, deviceRoutes);
app.use('/api/content', authenticateToken, contentRoutes);
app.use('/api/campaigns', authenticateToken, campaignRoutes);
app.use('/api/analytics', authenticateToken, analyticsRoutes);
app.use('/api/mqtt', authenticateToken, mqttRoutes);

// 静态资源服务：视频文件
app.use('/uploads', express.static(require('path').join(__dirname, '../uploads')));

// 404 处理
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'API 路由未找到',
    message: `路径 ${req.originalUrl} 不存在`
  });
});

// 全局错误处理
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('全局错误:', err);
  
  // MongoDB 错误处理
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      error: '数据验证失败',
      details: Object.values(err.errors).map((e: any) => e.message)
    });
  }
  
  if (err.code === 11000) {
    return res.status(400).json({
      error: '数据重复',
      message: '该数据已存在'
    });
  }
  
  // JWT 错误处理
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      error: '无效的令牌'
    });
  }
  
  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: '令牌已过期'
    });
  }
  
  // 默认错误响应
  res.status(err.status || 500).json({
    error: err.message || '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 优雅关闭处理
process.on('SIGINT', async () => {
  console.log('🔄 收到 SIGINT 信号，开始优雅关闭...');
  
  // 停止MQTT服务
  console.log('⏹️ 停止MQTT服务...');
  mqttService.stop();
  
  // 关闭HTTP服务器
  console.log('⏹️ 关闭HTTP服务器...');
  httpServer.close(() => {
    console.log('✅ HTTP服务器已关闭');
  });
  
  // 关闭数据库连接
  console.log('⏹️ 关闭数据库连接...');
  await mongoose.connection.close();
  console.log('✅ 数据库连接已关闭');
  
  console.log('👋 服务器已优雅关闭');
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🔄 收到 SIGTERM 信号，开始优雅关闭...');
  
  mqttService.stop();
  httpServer.close(() => {
    console.log('✅ HTTP服务器已关闭');
  });
  
  await mongoose.connection.close();
  console.log('✅ 数据库连接已关闭');
  
  console.log('👋 服务器已优雅关闭');
  process.exit(0);
});

// 启动HTTP服务器
httpServer.listen(PORT, () => {
  console.log('🎉 智慧融媒体云平台启动成功!');
  console.log(`📡 HTTP 服务器运行在端口: ${PORT}`);
  console.log(`📱 MQTT 服务器运行在端口: ${MQTT_PORT}`);
  console.log(`🌐 API 文档: http://localhost:${PORT}/health`);
  console.log(`🔗 前端访问: ${process.env.CLIENT_URL || 'http://localhost:3001'}`);
  console.log('');
  console.log('📋 安卓终端MQTT连接信息:');
  console.log(`   服务器地址: localhost (或您的服务器IP)`);
  console.log(`   端口: ${MQTT_PORT}`);
  console.log(`   支持的消息类型: register, heartbeat, status, data, content_response`);
  console.log('');
  console.log('🚀 系统就绪，等待安卓终端连接...');
});

export default app;
