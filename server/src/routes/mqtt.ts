import express from 'express';
import { Device } from '../models/Device';
import { Content } from '../models/Content';
import MQTTService, { ContentPushMessage } from '../services/mqttService';

const router = express.Router();

// 获取MQTT连接状态和统计信息
router.get('/status', async (req, res) => {
  try {
    const mqttService: MQTTService = req.app.get('mqttService');
    
    if (!mqttService) {
      return res.status(500).json({ error: 'MQTT服务未启动' });
    }

    const stats = mqttService.getStats();
    const connectedDevices = mqttService.getConnectedDevices();
    
    // 获取数据库中的安卓设备统计
    const androidDevices = await Device.find({ type: 'android_screen' });
    const onlineDevices = androidDevices.filter(d => d.mqtt?.isConnected);
    
    const response = {
      mqtt: {
        isRunning: stats.isRunning,
        serverRunning: stats.serverRunning,
        port: stats.port,
        connectedClients: stats.totalConnectedDevices
      },
      devices: {
        total: androidDevices.length,
        online: onlineDevices.length,
        offline: androidDevices.length - onlineDevices.length
      },
      connectedDevices: connectedDevices.map((cd: any) => {
        const device = androidDevices.find(d => d.mqtt?.clientId === cd.clientId);
        return {
          ...cd,
          deviceId: device?.deviceId,
          deviceName: device?.name,
          location: device?.location.name
        };
      })
    };

    res.json(response);
  } catch (error: any) {
    console.error('获取MQTT状态失败:', error);
    res.status(500).json({ error: '获取MQTT状态失败' });
  }
});

// 获取所有安卓终端设备
router.get('/devices', async (req, res) => {
  try {
    const devices = await Device.find({ 
      type: 'android_screen'
    }).select('deviceId name location status mqtt lastHeartbeat currentContent createdAt');

    console.log(`📱 Found ${devices.length} Android devices`);
    const devicesWithStatus = devices.map(device => ({
      ...device.toObject(),
      connectionStatus: device.mqtt?.isConnected ? 'connected' : 'disconnected',
      lastSeen: device.mqtt?.lastConnectedAt || device.lastHeartbeat,
      messageCount: device.mqtt?.messageCount || 0
    }));

    res.json(devicesWithStatus);
  } catch (error: any) {
    console.error('获取安卓设备失败:', error);
    res.status(500).json({ error: '获取设备列表失败' });
  }
});

// 获取特定安卓终端的详细信息
router.get('/devices/:deviceId', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const device = await Device.findOne({ 
      deviceId, 
      type: 'android_screen' 
    });

    if (!device) {
      return res.status(404).json({ error: '安卓终端设备不存在' });
    }

    const deviceInfo = {
      ...device.toObject(),
      connectionStatus: device.mqtt?.isConnected ? 'connected' : 'disconnected',
      lastSeen: device.mqtt?.lastConnectedAt || device.lastHeartbeat,
      messageCount: device.mqtt?.messageCount || 0,
      lastMessage: device.mqtt?.lastMessage ? JSON.parse(device.mqtt.lastMessage) : null
    };

    res.json(deviceInfo);
  } catch (error: any) {
    console.error('获取设备信息失败:', error);
    res.status(500).json({ error: '获取设备信息失败' });
  }
});

// 向安卓终端推送内容
router.post('/devices/:deviceId/push-content', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { contentId, duration, priority, schedule } = req.body;

    // 验证设备存在且为安卓终端
    const device = await Device.findOne({ deviceId, type: 'android_screen' });
    if (!device) {
      return res.status(404).json({ error: '安卓终端设备不存在' });
    }

    // 验证内容存在
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ error: '内容不存在' });
    }

    // 构造推送消息
    const pushMessage: ContentPushMessage = {
      messageType: 'content',
      content: {
        id: contentId,
        title: content.title,
        type: content.type,
        url: content.fileUrl,
        content: content.description,
        duration: duration || content.duration || 30,
        size: content.fileSize
      },
      schedule
    };

    // 获取MQTT服务实例
    const mqttService: MQTTService = req.app.get('mqttService');
    if (!mqttService) {
      return res.status(500).json({ error: 'MQTT服务未启动' });
    }

    // 推送内容
    const success = await mqttService.pushContentToDevice(deviceId, pushMessage);
    
    if (success) {
      res.json({ 
        success: true, 
        message: '内容推送成功', 
        deviceId, 
        contentId,
        contentTitle: content.title 
      });
    } else {
      res.status(400).json({ error: '内容推送失败，设备可能未连接' });
    }
  } catch (error: any) {
    console.error('推送内容失败:', error);
    res.status(500).json({ error: '推送内容失败' });
  }
});

// 向安卓终端发送控制命令
router.post('/devices/:deviceId/command', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { command, params } = req.body;

    // 验证设备存在且为安卓终端
    const device = await Device.findOne({ deviceId, type: 'android_screen' });
    if (!device) {
      return res.status(404).json({ error: '安卓终端设备不存在' });
    }

    // 获取MQTT服务实例
    const mqttService: MQTTService = req.app.get('mqttService');
    if (!mqttService) {
      return res.status(500).json({ error: 'MQTT服务未启动' });
    }

    // 发送命令
    const commandData = {
      command,
      params: params || {},
      timestamp: Date.now()
    };

    const success = await mqttService.sendCommandToDevice(deviceId, commandData);
    
    if (success) {
      res.json({ 
        success: true, 
        message: '命令发送成功', 
        deviceId, 
        command 
      });
    } else {
      res.status(400).json({ error: '命令发送失败，设备可能未连接' });
    }
  } catch (error: any) {
    console.error('发送命令失败:', error);
    res.status(500).json({ error: '发送命令失败' });
  }
});

// 广播消息到所有安卓终端
router.post('/broadcast', async (req, res) => {
  try {
    const { message, type, title } = req.body;

    if (!message) {
      return res.status(400).json({ error: '广播消息不能为空' });
    }

    // 获取MQTT服务实例
    const mqttService: MQTTService = req.app.get('mqttService');
    if (!mqttService) {
      return res.status(500).json({ error: 'MQTT服务未启动' });
    }

    // 广播消息
    const broadcastData = {
      type: type || 'announcement',
      title: title || '系统通知',
      message,
      timestamp: Date.now()
    };

    mqttService.broadcastToAllDevices(broadcastData);
    
    res.json({ 
      success: true, 
      message: '广播发送成功',
      recipients: mqttService.getStats().totalConnectedDevices
    });
  } catch (error: any) {
    console.error('广播发送失败:', error);
    res.status(500).json({ error: '广播发送失败' });
  }
});

// 批量推送内容到多个安卓终端
router.post('/devices/batch-push', async (req, res) => {
  try {
    const { deviceIds, contentId, duration, priority, schedule } = req.body;

    if (!Array.isArray(deviceIds) || deviceIds.length === 0) {
      return res.status(400).json({ error: '设备ID列表不能为空' });
    }

    // 验证内容存在
    const content = await Content.findById(contentId);
    if (!content) {
      return res.status(404).json({ error: '内容不存在' });
    }

    // 验证所有设备都是安卓终端
    const devices = await Device.find({ 
      deviceId: { $in: deviceIds }, 
      type: 'android_screen' 
    });

    const foundDeviceIds = devices.map(d => d.deviceId);
    const notFoundDeviceIds = deviceIds.filter((id: string) => !foundDeviceIds.includes(id));

    // 构造推送消息
    const pushMessage: ContentPushMessage = {
      messageType: 'content',
      content: {
        id: contentId,
        title: content.title,
        type: content.type,
        url: content.fileUrl,
        content: content.description,
        duration: duration || content.duration || 30,
        size: content.fileSize
      },
      schedule
    };

    // 获取MQTT服务实例
    const mqttService: MQTTService = req.app.get('mqttService');
    if (!mqttService) {
      return res.status(500).json({ error: 'MQTT服务未启动' });
    }

    // 批量推送
    const results = await Promise.all(
      foundDeviceIds.map(async (deviceId: string) => {
        try {
          const success = await mqttService.pushContentToDevice(deviceId, pushMessage);
          return { deviceId, success, error: null };
        } catch (error: any) {
          return { deviceId, success: false, error: error?.message || '未知错误' };
        }
      })
    );

    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    res.json({
      success: true,
      message: '批量推送完成',
      summary: {
        totalRequested: deviceIds.length,
        found: foundDeviceIds.length,
        notFound: notFoundDeviceIds.length,
        successCount,
        failCount
      },
      results: results,
      notFoundDevices: notFoundDeviceIds,
      contentTitle: content.title
    });
  } catch (error: any) {
    console.error('批量推送失败:', error);
    res.status(500).json({ error: '批量推送失败' });
  }
});

// 重启安卓终端
router.post('/devices/:deviceId/reboot', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { delay = 5 } = req.body;

    const mqttService: MQTTService = req.app.get('mqttService');
    if (!mqttService) {
      return res.status(500).json({ error: 'MQTT服务未启动' });
    }

    const success = await mqttService.sendCommandToDevice(deviceId, {
      command: 'reboot',
      params: { delay }
    });

    if (success) {
      res.json({ success: true, message: `设备将在${delay}秒后重启` });
    } else {
      res.status(400).json({ error: '重启命令发送失败，设备可能未连接' });
    }
  } catch (error: any) {
    console.error('发送重启命令失败:', error);
    res.status(500).json({ error: '发送重启命令失败' });
  }
});

// 获取安卓终端截图
router.post('/devices/:deviceId/screenshot', async (req, res) => {
  try {
    const { deviceId } = req.params;

    const mqttService: MQTTService = req.app.get('mqttService');
    if (!mqttService) {
      return res.status(500).json({ error: 'MQTT服务未启动' });
    }

    const success = await mqttService.sendCommandToDevice(deviceId, {
      command: 'screenshot',
      params: { quality: 80 }
    });

    if (success) {
      res.json({ success: true, message: '截图命令已发送，请稍后查看设备响应' });
    } else {
      res.status(400).json({ error: '截图命令发送失败，设备可能未连接' });
    }
  } catch (error: any) {
    console.error('发送截图命令失败:', error);
    res.status(500).json({ error: '发送截图命令失败' });
  }
});

// 通用内容推送接口 (兼容测试脚本)
router.post('/push', async (req, res) => {
  try {
    const { deviceIds, content } = req.body;

    if (!deviceIds || !Array.isArray(deviceIds) || deviceIds.length === 0) {
      return res.status(400).json({ error: '设备ID列表不能为空' });
    }

    if (!content || !content.contentId) {
      return res.status(400).json({ error: '内容信息不完整' });
    }

    const mqttService: MQTTService = req.app.get('mqttService');
    if (!mqttService) {
      return res.status(500).json({ error: 'MQTT服务未启动' });
    }

    const pushMessage: ContentPushMessage = {
      messageType: 'content',
      content: {
        id: content.contentId,
        title: content.title || '无标题',
        url: content.url || '',
        type: content.type || 'image',
        duration: content.duration || 10,
        size: content.size || 0
      }
    };

    const results = [];
    for (const deviceId of deviceIds) {
      try {
        const success = await mqttService.pushContentToDevice(deviceId, pushMessage);
        results.push({
          deviceId: deviceId,
          success: success,
          message: success ? '推送成功' : '推送失败'
        });
      } catch (error: any) {
        results.push({
          deviceId: deviceId,
          success: false,
          message: `推送失败: ${error.message}`
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    
    res.json({
      success: successCount > 0,
      message: `成功推送到 ${successCount}/${deviceIds.length} 个设备`,
      results: results,
      content: pushMessage.content
    });

  } catch (error: any) {
    console.error('内容推送失败:', error);
    res.status(500).json({ error: '内容推送失败', details: error.message });
  }
});

export default router;
