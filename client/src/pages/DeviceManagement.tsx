import React, { useEffect, useState } from 'react';
import { Card, Table, Button, Space, Tag, Badge, message, Modal, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';
import { deviceAPI } from '../services/api';

const DeviceManagement: React.FC = () => {
  // 设备数据状态
  const [devices, setDevices] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedDevice, setSelectedDevice] = useState<any>(null);

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleView = (device: any) => {
    setSelectedDevice(device);
    setIsModalVisible(true);
  };

  const fetchDevices = async () => {
    setLoading(true);
    try {
      const res = await deviceAPI.getDevices();
      let list: any[] = [];
      const data = res && res.data ? res.data : [];
      if (data && typeof data === 'object' && 'devices' in data && Array.isArray((data as any).devices)) {
        list = (data as any).devices;
      } else if (Array.isArray(data)) {
        list = data;
      } else {
        list = [];
      }
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

  const handleDelete = async (id: string) => {
    try {
      await deviceAPI.deleteDevice(id);
      message.success('设备删除成功');
      fetchDevices(); // Refresh the list
    } catch (error) {
      message.error('设备删除失败');
    }
  };

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
      render: (text: string) => {
        if (!text) return '-';
        try {
          const date = new Date(text);
          return new Intl.DateTimeFormat('zh-CN', {
            timeZone: 'Asia/Shanghai',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).format(date);
        } catch (e) {
          return '无效日期';
        }
      },
    },
    {
      title: '操作',
      key: 'action',
      render: (_: any, record: any) => (
        <Space size="middle">
          <Button size="small" icon={<EyeOutlined />} onClick={() => handleView(record)}>查看</Button>
          <Button size="small" icon={<EditOutlined />}>编辑</Button>
          <Popconfirm
            title="确定删除此设备吗？"
            onConfirm={() => handleDelete(record.id)}
            okText="是"
            cancelText="否"
          >
            <Button size="small" danger icon={<DeleteOutlined />}>删除</Button>
          </Popconfirm>
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
      {selectedDevice && (
        <Modal
          title="设备详情"
          visible={isModalVisible}
          onOk={() => setIsModalVisible(false)}
          onCancel={() => setIsModalVisible(false)}
          footer={[
            <Button key="back" onClick={() => setIsModalVisible(false)}>
              关闭
            </Button>,
          ]}
        >
          <p><strong>设备ID:</strong> {selectedDevice.id}</p>
          <p><strong>设备名称:</strong> {selectedDevice.name}</p>
          <p><strong>设备类型:</strong> {selectedDevice.type}</p>
          <p><strong>位置:</strong> {selectedDevice.location}</p>
          <p><strong>状态:</strong> {selectedDevice.status === 'online' ? '在线' : '离线'}</p>
          <p><strong>分辨率:</strong> {selectedDevice.resolution}</p>
          <p><strong>最后心跳:</strong> {selectedDevice.lastHeartbeat ? new Intl.DateTimeFormat('zh-CN', {
            timeZone: 'Asia/Shanghai',
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
          }).format(new Date(selectedDevice.lastHeartbeat)) : '-'}</p>
        </Modal>
      )}
    </Card>
  );
};

export default DeviceManagement;
