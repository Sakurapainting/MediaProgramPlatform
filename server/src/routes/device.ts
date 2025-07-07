import express from 'express';
import { Device } from '../models/Device';
import { requireRole } from '../middleware/auth';

const router = express.Router();

// 获取所有设备
router.get('/', async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      type,
      region,
      city,
      search
    } = req.query;

    const filter: any = {};
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    if (region) filter['location.region'] = region;
    if (city) filter['location.city'] = city;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { deviceId: { $regex: search, $options: 'i' } },
        { 'location.name': { $regex: search, $options: 'i' } }
      ];
    }

    const devices = await Device.find(filter)
      .populate('currentContent.campaignId', 'name type')
      .populate('currentContent.contentId', 'title type')
      .sort({ createdAt: -1 })
      .limit(Number(limit) * 1)
      .skip((Number(page) - 1) * Number(limit));

    const total = await Device.countDocuments(filter);

    res.json({
      success: true,
      data: {
        devices,
        pagination: {
          current: Number(page),
          pageSize: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit))
        }
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: '获取设备列表失败',
      error: error.message
    });
  }
});

// 创建新设备
router.post('/', requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const device = new Device(req.body);
    await device.save();

    res.status(201).json({
      success: true,
      message: '设备创建成功',
      data: device
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: '设备创建失败',
      error: error.message
    });
  }
});

// 更新设备信息
router.put('/:id', requireRole(['admin', 'operator']), async (req, res) => {
  try {
    const device = await Device.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );

    if (!device) {
      return res.status(404).json({
        success: false,
        message: '设备不存在'
      });
    }

    res.json({
      success: true,
      message: '设备更新成功',
      data: device
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      message: '设备更新失败',
      error: error.message
    });
  }
});

// 删除设备
router.delete('/:id', requireRole(['admin']), async (req, res) => {
  try {
    const device = await Device.findByIdAndDelete(req.params.id);

    if (!device) {
      return res.status(404).json({
        success: false,
        message: '设备不存在'
      });
    }

    res.json({
      success: true,
      message: '设备删除成功'
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: '设备删除失败',
      error: error.message
    });
  }
});

// 设备心跳更新
router.post('/:deviceId/heartbeat', async (req, res) => {
  try {
    const { deviceId } = req.params;
    const { status, currentContent } = req.body;

    const device = await Device.findOneAndUpdate(
      { deviceId },
      {
        status: status || 'online',
        lastHeartbeat: new Date(),
        ...(currentContent && { currentContent })
      },
      { new: true }
    );

    if (!device) {
      return res.status(404).json({
        success: false,
        message: '设备不存在'
      });
    }

    res.json({
      success: true,
      message: '心跳更新成功',
      data: device
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: '心跳更新失败',
      error: error.message
    });
  }
});

// 获取设备统计信息
router.get('/stats', async (req, res) => {
  try {
    const stats = await Device.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const typeStats = await Device.aggregate([
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 }
        }
      }
    ]);

    const totalDevices = await Device.countDocuments();
    const onlineDevices = await Device.countDocuments({ status: 'online' });

    res.json({
      success: true,
      data: {
        total: totalDevices,
        online: onlineDevices,
        offline: totalDevices - onlineDevices,
        statusStats: stats,
        typeStats
      }
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      message: '获取设备统计信息失败',
      error: error.message
    });
  }
});

export default router;
