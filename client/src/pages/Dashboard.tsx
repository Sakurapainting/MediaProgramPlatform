import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Statistic, Table, Badge, Button, Space } from 'antd';
import { 
  DesktopOutlined, 
  PlayCircleOutlined, 
  EyeOutlined, 
  AlertOutlined,
  ReloadOutlined
} from '@ant-design/icons';
import ReactECharts from 'echarts-for-react';

const Dashboard: React.FC = () => {
  const [loading, setLoading] = useState(false);
  
  // 模拟数据
  const stats = {
    totalDevices: 156,
    onlineDevices: 142,
    activeCampaigns: 23,
    todayImpressions: 45672
  };

  const recentDevices = [
    {
      key: '1',
      name: '商场主屏-1F',
      location: '万达广场1楼',
      status: 'online',
      lastHeartbeat: '2 分钟前'
    },
    {
      key: '2', 
      name: '户外LED-东门',
      location: '市中心东门',
      status: 'offline',
      lastHeartbeat: '10 分钟前'
    },
    {
      key: '3',
      name: '地铁屏-站台A',
      location: '地铁1号线站台',
      status: 'online', 
      lastHeartbeat: '1 分钟前'
    }
  ];

  const deviceColumns = [
    {
      title: '设备名称',
      dataIndex: 'name',
      key: 'name',
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
      title: '最后心跳',
      dataIndex: 'lastHeartbeat',
      key: 'lastHeartbeat',
    }
  ];

  // 设备类型分布图表配置
  const deviceTypeOption = {
    title: {
      text: '设备类型分布',
      left: 'center'
    },
    tooltip: {
      trigger: 'item'
    },
    series: [
      {
        type: 'pie',
        radius: '50%',
        data: [
          { value: 65, name: 'LED屏' },
          { value: 45, name: 'LCD显示器' },
          { value: 28, name: '投影仪' },
          { value: 18, name: '电视机' }
        ],
        emphasis: {
          itemStyle: {
            shadowBlur: 10,
            shadowOffsetX: 0,
            shadowColor: 'rgba(0, 0, 0, 0.5)'
          }
        }
      }
    ]
  };

  // 播放量趋势图表配置
  const playTrendOption = {
    title: {
      text: '播放量趋势',
      left: 'center'
    },
    tooltip: {
      trigger: 'axis'
    },
    xAxis: {
      type: 'category',
      data: ['周一', '周二', '周三', '周四', '周五', '周六', '周日']
    },
    yAxis: {
      type: 'value'
    },
    series: [
      {
        data: [3200, 4100, 3800, 4500, 5200, 4800, 5600],
        type: 'line',
        smooth: true,
        areaStyle: {},
        color: '#667eea'
      }
    ]
  };

  const handleRefresh = () => {
    setLoading(true);
    // 模拟刷新
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  };

  return (
    <div>
      {/* 统计卡片 */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="设备总数"
              value={stats.totalDevices}
              prefix={<DesktopOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="在线设备"
              value={stats.onlineDevices}
              prefix={<PlayCircleOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="活跃投放"
              value={stats.activeCampaigns}
              prefix={<AlertOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card className="stat-card">
            <Statistic
              title="今日曝光"
              value={stats.todayImpressions}
              prefix={<EyeOutlined />}
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
      </Row>

      {/* 图表和设备列表 */}
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <Card title="设备类型分布" className="content-card">
            <ReactECharts option={deviceTypeOption} style={{ height: 300 }} />
          </Card>
        </Col>
        <Col xs={24} lg={12}>
          <Card title="播放量趋势" className="content-card">
            <ReactECharts option={playTrendOption} style={{ height: 300 }} />
          </Card>
        </Col>
      </Row>

      {/* 最近设备状态 */}
      <Card 
        title="最近设备状态" 
        className="content-card"
        style={{ marginTop: 16 }}
        extra={
          <Space>
            <Button 
              icon={<ReloadOutlined />} 
              onClick={handleRefresh}
              loading={loading}
            >
              刷新
            </Button>
          </Space>
        }
      >
        <Table 
          columns={deviceColumns} 
          dataSource={recentDevices} 
          pagination={false}
          size="small"
        />
      </Card>
    </div>
  );
};

export default Dashboard;
