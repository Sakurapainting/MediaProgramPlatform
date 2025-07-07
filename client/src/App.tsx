import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from 'antd';
import AppHeader from './components/Layout/Header';
import Sidebar from './components/Layout/Sidebar';
import Dashboard from './pages/Dashboard';
import DeviceManagement from './pages/DeviceManagement';
import ContentManagement from './pages/ContentManagement';
import CampaignManagement from './pages/CampaignManagement';
import Analytics from './pages/Analytics';
import UserManagement from './pages/UserManagement';
import Login from './pages/Login';
import { useAuthStore } from './store/auth';

const { Content } = Layout;

const App: React.FC = () => {
  const { isAuthenticated } = useAuthStore();

  if (!isAuthenticated) {
    return <Login />;
  }

  return (
    <Router>
      <Layout style={{ minHeight: '100vh' }}>
        <AppHeader />
        <Layout>
          <Sidebar />
          <Layout style={{ padding: '0' }}>
            <Content className="page-container">
              <Routes>
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/devices" element={<DeviceManagement />} />
                <Route path="/content" element={<ContentManagement />} />
                <Route path="/campaigns" element={<CampaignManagement />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/users" element={<UserManagement />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </Content>
          </Layout>
        </Layout>
      </Layout>
    </Router>
  );
};

export default App;
