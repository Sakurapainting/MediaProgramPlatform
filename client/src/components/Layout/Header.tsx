import React from 'react';
import { Layout, Avatar, Dropdown, Space } from 'antd';
import { 
  UserOutlined, 
  LogoutOutlined, 
  SettingOutlined,
  VideoCameraOutlined 
} from '@ant-design/icons';
import { useAuthStore } from '../../store/auth';

const { Header } = Layout;

const AppHeader: React.FC = () => {
  const { user, logout } = useAuthStore();

  const userMenuItems = [
    {
      key: 'profile',
      icon: <UserOutlined />,
      label: '个人资料',
    },
    {
      key: 'settings',
      icon: <SettingOutlined />,
      label: '设置',
    },
    {
      type: 'divider' as const,
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
        智慧融媒体云平台
      </div>
      
      <Space>
        <span>欢迎，{user?.username}</span>
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
