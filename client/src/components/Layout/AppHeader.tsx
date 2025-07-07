import React from 'react';
import { Layout, Avatar, Dropdown, Space, Typography } from 'antd';
import { VideoCameraOutlined, UserOutlined, LogoutOutlined, SettingOutlined } from '@ant-design/icons';
import type { MenuProps } from 'antd';
import { useAuthStore } from '../../store/auth';

const { Header } = Layout;
const { Text } = Typography;

const AppHeader: React.FC = () => {
  const { user, logout } = useAuthStore();

  const userMenuItems: MenuProps['items'] = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人信息',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '系统设置',
    },
    {
      type: 'divider',
    },
    {
      key: 'logout',
      icon: <LogoutOutlined />,
      label: '退出登录',
      onClick: logout,
    },
  ];

  return (
    <Header className="app-header">
      <div className="app-logo">
        <VideoCameraOutlined className="app-logo-icon" />
        <Text strong style={{ color: 'white', fontSize: 18 }}>
          智慧融媒体云平台
        </Text>
      </div>
      
      <Space>
        <Text style={{ color: 'white' }}>
          欢迎，{user?.username || '用户'}
        </Text>
        <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
          <Avatar 
            src={user?.avatar} 
            icon={<UserOutlined />}
            style={{ cursor: 'pointer' }}
          />
        </Dropdown>
      </Space>
    </Header>
  );
};

export default AppHeader;
