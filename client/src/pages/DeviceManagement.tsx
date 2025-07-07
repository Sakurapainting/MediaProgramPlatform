import React from 'react';
import { Card, Table, Button, Space, Tag, Badge } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, EyeOutlined } from '@ant-design/icons';

const DeviceManagement: React.FC = () => {
  // 模拟设备数据
  const devices = [
    {
      key: '1',
      id: 'DEV001',
      name: '商场主屏-1F',
      type: 'LED屏',
      location: '万达广场1楼大厅',
      status: 'online',
      resolution: '1920x1080',
      lastHeartbeat: '2分钟前'
    },
    {
      key: '2',
      id: 'DEV002', 
      name: '户外LED-东门',
      type: 'LED屏',
      location: '市中心东门广场',
      status: 'offline',
      resolution: '1280x720',
      lastHeartbeat: '10分钟前'
    },
    {
      key: '3',
      id: 'DEV003',
      name: '地铁屏-站台A',
      type: 'LCD显示器',
      location: '地铁1号线A站台',
      status: 'online',
      resolution: '1920x1080',
      lastHeartbeat: '1分钟前'
    }
  ];

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
