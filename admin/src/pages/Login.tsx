import { useState } from 'react';
import { Form, Input, Button, Card, Message, Typography } from '@arco-design/web-react';
import { IconLock, IconUser } from '@arco-design/web-react/icon';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

// Import Arco styles
import '@arco-design/web-react/dist/css/arco.css';

export default function Login() {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onLoginFormSubmit = async (values: any) => {
    setLoading(true);
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000/api';

    try {
      const res = await axios.post(`${apiUrl}/auth/login`, {
        email: values.email,
        password: values.password,
      });

      const { user, access_token } = res.data;

      if (user.role !== 'admin') {
        throw new Error('Access denied. Admin role required.');
      }

      localStorage.setItem('fluxbless_admin_token', access_token);
      localStorage.setItem('fluxbless_admin_user', JSON.stringify(user));
      Message.success('Welcome back to FluxBless Console');
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      Message.error(err.response?.data?.message || err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: '#121212',
      }}
    >
      <Card
        style={{
          width: 400,
          boxShadow: '0 4px 15px rgba(0,0,0,0.5)',
          border: '1px solid rgba(212, 175, 55, 0.2)',
          background: '#1a1a1a',
          borderRadius: 8,
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Typography.Title heading={3} style={{ color: '#D4AF37', margin: '0 0 8px 0' }}>
            FluxBless
          </Typography.Title>
          <Typography.Text type='secondary' style={{ color: '#C5A059' }}>
            Management Portal
          </Typography.Text>
        </div>

        <Form layout='vertical' onSubmit={onLoginFormSubmit}>
          <Form.Item
            label={<span style={{ color: '#e5e5e5' }}>Email</span>}
            field='email'
            rules={[{ required: true, message: 'Please enter your email' }]}
          >
            <Input
              prefix={<IconUser style={{ color: '#AA7C11' }} />}
              placeholder='admin@fluxbless.com'
              style={{ background: '#2a2a2a', border: '1px solid #333', color: '#fff' }}
            />
          </Form.Item>
          <Form.Item
            label={<span style={{ color: '#e5e5e5' }}>Password</span>}
            field='password'
            rules={[{ required: true, message: 'Please enter your password' }]}
          >
            <Input.Password
              prefix={<IconLock style={{ color: '#AA7C11' }} />}
              placeholder='Enter password'
              style={{ background: '#2a2a2a', border: '1px solid #333', color: '#fff' }}
            />
          </Form.Item>
          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type='primary'
              htmlType='submit'
              loading={loading}
              long
              style={{
                background: 'linear-gradient(135deg, #AA7C11 0%, #D4AF37 50%, #F3E5AB 100%)',
                border: 'none',
                color: '#000',
                fontWeight: 'bold',
              }}
            >
              Sign In
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
