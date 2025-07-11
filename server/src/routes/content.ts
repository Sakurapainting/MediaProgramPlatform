import express from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { Content } from '../models/Content';
import mongoose from 'mongoose';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

// 配置multer用于视频上传
const uploadDir = path.resolve(process.cwd(), 'uploads');
console.log('上传目录路径:', uploadDir);

if (!fs.existsSync(uploadDir)) {
  console.log('创建上传目录:', uploadDir);
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 文件类型验证
const fileFilter = (req: any, file: any, cb: any) => {
  console.log('检查文件类型:', file.mimetype);
  const allowedTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/avi', 'video/mov', 'video/quicktime'];
  if (allowedTypes.includes(file.mimetype)) {
    console.log('文件类型验证通过');
    cb(null, true);
  } else {
    console.error('不支持的文件类型:', file.mimetype);
    cb(new Error('不支持的文件类型。支持的类型: MP4, WebM, OGG, AVI, MOV'));
  }
};

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('保存文件到目录:', uploadDir);
    // 确保目录存在
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const ext = path.extname(file.originalname);
    const basename = path.basename(file.originalname, ext);
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const filename = basename + '-' + uniqueSuffix + ext;
    console.log('生成文件名:', filename);
    cb(null, filename);
  }
});

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 1000 * 1024 * 1024, // 提升限制到1GB
    fieldNameSize: 100,
    fieldSize: 1024 * 1024,
  }
});

// 上传视频接口
router.post('/uploadVideo', (req, res) => {
  console.log('收到视频上传请求');
  console.log('请求头:', req.headers);
  
  upload.single('video')(req, res, async (err) => {
    try {
      if (err instanceof multer.MulterError) {
        console.error('Multer错误:', err);
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            message: '文件太大，最大支持1GB',
            error: err.message
          });
        }
        return res.status(400).json({
          success: false,
          message: '文件上传错误: ' + err.code,
          error: err.message
        });
      } else if (err) {
        console.error('其他错误:', err);
        return res.status(400).json({
          success: false,
          message: '上传失败',
          error: err.message
        });
      }

      if (!req.file) {
        console.error('未收到文件');
        return res.status(400).json({ 
          success: false, 
          message: '未上传文件，请选择视频文件' 
        });
      }

      console.log('文件上传成功:', req.file);
      const { title = '', description = '', category = '', tags = '' } = req.body;
      console.log('表单数据:', { title, description, category, tags });

      // 验证必要字段
      if (!title.trim()) {
        return res.status(400).json({
          success: false,
          message: '标题不能为空'
        });
      }

      const fileUrl = `/uploads/${req.file.filename}`;
      const format = path.extname(req.file.originalname).replace('.', '');
      const fileSize = req.file.size;
      const tagsArr = tags ? tags.split(',').map((t: string) => t.trim()).filter((t: string) => t) : [];

      const content = await Content.create({
        title: title.trim(),
        description: description.trim(),
        type: 'video',
        fileUrl,
        fileSize,
        format,
        tags: tagsArr,
        category: category.trim() || '默认分类', // 如果没有提供分类，使用默认值
        status: 'approved', // 改为approved，让视频立即可用
        uploadedBy: (req as any).user.id,
        metadata: {
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          uploadTime: new Date()
        },
      });

      console.log('创建内容成功:', content);
      res.json({ 
        success: true, 
        data: content,
        message: '视频上传成功'
      });
    } catch (err) {
      console.error('处理上传请求失败:', err);
      const error = err as Error;
      res.status(500).json({
        success: false,
        message: '上传失败',
        error: error.message
      });
    }
  });
});

// 获取视频列表接口
router.get('/videos', async (req, res) => {
  try {
    const videos = await Content.find({ type: 'video' }).sort({ createdAt: -1 });
    res.json({ success: true, data: videos });
  } catch (err) {
    console.error('获取视频列表失败:', err);
    const error = err as Error;
    res.status(500).json({
      success: false,
      message: '获取视频列表失败',
      error: error.message
    });
  }
});

// 下发视频到安卓终端接口
router.post('/push/:contentId', async (req, res) => {
  try {
    const { contentId } = req.params;
    const { deviceId, clientId } = req.body;

    // 验证必要参数
    if (!deviceId) {
      return res.status(400).json({
        success: false,
        message: '设备ID不能为空'
      });
    }

    // 查找内容
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({
        success: false,
        message: '内容不存在'
      });
    }

    // 构建推送消息
    const pushMessage = {
      type: 'content_push',
      timestamp: Date.now(),
      data: {
        contentId: content._id,
        title: content.title,
        description: content.description,
        type: content.type,
        fileUrl: `http://localhost:5001${content.fileUrl}`, // 完整的文件URL
        duration: content.duration || 0,
        format: content.format,
        category: content.category,
        metadata: content.metadata,
        pushTime: new Date().toISOString()
      }
    };

    console.log('准备推送内容到设备:', deviceId);
    console.log('推送内容:', pushMessage);

    // 通过MQTT推送到设备
    const mqttService = (global as any).mqttService;
    if (mqttService) {
      const topic = `device/${clientId || deviceId}/content`;
      try {
        await mqttService.publishToDevice(clientId || deviceId, topic, pushMessage);
        console.log(`内容推送成功: ${content.title} -> ${deviceId}`);
        res.json({
          success: true,
          message: '内容推送成功',
          data: {
            contentId: content._id,
            deviceId,
            title: content.title,
            pushTime: new Date()
          }
        });
      } catch (error) {
        console.error('MQTT推送失败:', error);
        res.status(500).json({
          success: false,
          message: '推送失败：设备可能未连接'
        });
      }
    } else {
      res.status(500).json({
        success: false,
        message: 'MQTT服务未启动'
      });
    }

  } catch (err) {
    console.error('推送内容失败:', err);
    const error = err as Error;
    res.status(500).json({
      success: false,
      message: '推送失败',
      error: error.message
    });
  }
});

// 获取所有在线设备列表
router.get('/devices/online', async (req, res) => {
  try {
    const mqttService = (global as any).mqttService;
    if (mqttService) {
      const devices = mqttService.getConnectedDevices();
      res.json({
        success: true,
        data: devices
      });
    } else {
      res.json({
        success: true,
        data: []
      });
    }
  } catch (err) {
    console.error('获取在线设备失败:', err);
    const error = err as Error;
    res.status(500).json({
      success: false,
      message: '获取设备列表失败',
      error: error.message
    });
  }
});

// 保持原有路由
router.get('/', (req, res) => {
  res.json({ message: 'Content routes' });
});

export default router;
