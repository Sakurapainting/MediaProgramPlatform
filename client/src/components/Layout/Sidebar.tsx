import React from 'react';
import { Layout, Menu } from 'antd';
import { 
  DashboardOutlined,
  DesktopOutlined,
  FileImageOutlined,
  BulbOutlined,
  BarChartOutlined,
  UserOutlined
} from '@ant-design/icons';
import { useNavigate, useLocation } from 'react-router-dom';

const { Sider } = Layout;

const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      key: '/dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: '/devices',
      icon: <DesktopOutlined />,
      label: '设备管理',
    },
    {
      key: '/content',
      icon: <FileImageOutlined />,
      label: '内容管理',
    },
    {
      key: '/campaigns',
      icon: <BulbOutlined />,
      label: '投放管理',
    },
    {
      key: '/analytics',
      icon: <BarChartOutlined />,
      label: '数据统计',
    },
    {
      key: '/users',
      icon: <UserOutlined />,
      label: '用户管理',
    },
  ];

  const handleMenuClick = ({ key }: { key: string }) => {
    navigate(key);
  };

  return (
    <Sider
      width={200}
      style={{
        background: '#fff',
        borderRight: '1px solid #f0f0f0',
      }}
    >
      <Menu
        mode="inline"
        selectedKeys={[location.pathname]}
        items={menuItems}
        onClick={handleMenuClick}
        style={{ height: '100%', borderRight: 0 }}
      />
    </Sider>
  );
};

export default Sidebar;
