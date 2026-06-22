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
    const apiUrl = import.meta.env.VITE_API_URL || '/api';

    try {
      const res = await axios.post(`${apiUrl}/auth/login`, {
        email: values.email,
        password: values.password,
      });

      const { user, access_token } = res.data;

      if (user.role !== 'admin') {
        throw new Error('拒绝访问，需要管理员权限');
      }

      localStorage.setItem('fluxbless_admin_token', access_token);
      localStorage.setItem('fluxbless_admin_user', JSON.stringify(user));
      Message.success('欢迎回来，FluxBless 管理后台');
      navigate('/admin/dashboard');
    } catch (err: any) {
      console.error(err);
      Message.error(err.response?.data?.message || err.message || '登录失败');
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
      }}
    >
      <Card style={{ width: 400, borderRadius: 8 }}>
        <div style={{ textAlign: 'center', marginBottom: 30 }}>
          <Typography.Title heading={3} style={{ margin: '0 0 8px 0' }}>
            FluxBless
          </Typography.Title>
          <Typography.Text type='secondary'>
            管理系统
          </Typography.Text>
        </div>

        <Form layout='vertical' onSubmit={onLoginFormSubmit}>
          <Form.Item
            label="邮箱"
            field='email'
            rules={[{ required: true, message: '请输入邮箱' }]}
          >
            <Input
              prefix={<IconUser />}
              placeholder='admin@fluxbless.com'
            />
          </Form.Item>
          <Form.Item
            label="密码"
            field='password'
            rules={[{ required: true, message: '请输入密码' }]}
          >
            <Input.Password
              prefix={<IconLock />}
              placeholder='请输入密码'
            />
          </Form.Item>
          <Form.Item style={{ marginTop: 24 }}>
            <Button
              type='primary'
              htmlType='submit'
              loading={loading}
              long
            >
              登录
            </Button>
          </Form.Item>
        </Form>
      </Card>
    </div>
  );
}
