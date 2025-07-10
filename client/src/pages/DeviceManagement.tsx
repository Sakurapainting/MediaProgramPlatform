import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Badge, message } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { deviceAPI } from '../services/api';

const DeviceManagement: React.FC = () => {
  // 设备数据状态
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchDevices = async () => {
      setLoading(true);
      try {
        // 调用后端API获取设备列表
        const res = await deviceAPI.getDevices();
        // 兼容不同API返回结构，防止res.data为undefined
        let list: any[] = [];
        const data = res && res.data ? res.data : [];
        if (data && typeof data === 'object' && 'devices' in data && Array.isArray((data as any).devices)) {
          list = (data as any).devices;
        } else if (Array.isArray(data)) {
          list = data;
        } else {
          list = [];
        }
        // 处理数据格式
        list = list.map((item: any, idx: number) => ({
          key: item.deviceId || item.id || idx,
          id: item.deviceId || item.id,
          name: item.name,
          type: item.type,
          location: item.location?.name || item.location || '',
          status: item.status || (item.connectionStatus === 'connected' ? 'online' : 'offline'),
          resolution: item.specifications?.resolution || item.resolution || '',
          lastHeartbeat: item.lastHeartbeat || item.lastSeen || '',
        }));
        setDevices(list);
      } catch (err) {
        message.error('获取设备列表失败');
      } finally {
        setLoading(false);
      }
    };
    fetchDevices();
  }, []);

  const columns = [
    {
      title: '设备ID',
      dataIndex: 'id',
      key: 'id',
    },
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: '设备类型',
      dataIndex: 'type',
      key: 'type',
      render: (type: string) => <Tag color="blue">{type}</Tag>
    },
    {
      title: '位置',
      dataIndex: 'location',
      key: 'location',
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Badge 
          status={status === 'online' ? 'success' : 'error'} 
          text={status === 'online' ? '在线' : '离线'} 
        />
      ),
    },
    {
      title: '分辨率',
      dataIndex: 'resolution',
      key: 'resolution',
    },
    {
      title: '最后心跳',
      dataIndex: 'lastHeartbeat',
      key: 'lastHeartbeat',
    },
    {
      title: '操作',
      key: 'action',
      render: () => (
        <Space size="middle">
          <Button size="small" icon={<EyeOutlined />}>查看</Button>
          <Button size="small" icon={<EditOutlined />}>编辑</Button>
          <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
        </Space>
      ),
    },
  ];

  return (
    <Card 
      title="设备管理" 
      extra={
        <Button type="primary" icon={<PlusOutlined />}>
          添加设备
        </Button>
      }
    >
      <Table 
        columns={columns} 
        dataSource={devices} 
        loading={loading}
        pagination={{
          total: devices.length,
          pageSize: 10,
          showSizeChanger: true,
          showQuickJumper: true,
        }}
      />
    </Card>
  );
};

export default DeviceManagement;
