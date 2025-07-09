import React, { useState } from 'react';
import { Form, Input, Button, Card, message, Spin } from 'antd';
import { UserOutlined, LockOutlined, VideoCameraOutlined } from '@ant-design/icons';
import { useAuthStore } from '../store/auth';

const Login: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const { login } = useAuthStore();

  const onFinish = async (values: { email: string; password: string }) => {
    setLoading(true);
    try {
      const success = await login(values.email, values.password);
      if (success) {
        message.success('登录成功');
      } else {
        message.error('登录失败，请检查邮箱和密码');
      }
    } catch (error) {
      message.error('登录失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      }}
    >
      <Card
        style={{
          width: 400,
          borderRadius: 8,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <VideoCameraOutlined 
            style={{ 
              fontSize: 48, 
              color: '#667eea',
              marginBottom: 16 
            }} 
          />
          <h1 style={{ margin: 0, color: '#333' }}>智慧融媒体云平台</h1>
          <p style={{ color: '#666', margin: '8px 0 0 0' }}>广告节目投放管理系统</p>
        </div>

        <Spin spinning={loading}>
          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            size="large"
          >
            <Form.Item
              name="email"
              rules={[
                { required: true, message: '请输入邮箱!' },
                { type: 'email', message: '请输入有效的邮箱地址!' }
              ]}
            >
              <Input 
                prefix={<UserOutlined />} 
                placeholder="邮箱" 
              />
            </Form.Item>

            <Form.Item
              name="password"
              rules={[{ required: true, message: '请输入密码!' }]}
            >
              <Input.Password
                prefix={<LockOutlined />}
                placeholder="密码"
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                block
                style={{
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  border: 'none',
                  height: 40,
                }}
              >
                登录
              </Button>
            </Form.Item>
          </Form>
        </Spin>

        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <p style={{ color: '#999', fontSize: 12 }}>
            默认账号：admin@example.com / 123456
          </p>
        </div>
      </Card>
    </div>
  );
};

export default Login;
