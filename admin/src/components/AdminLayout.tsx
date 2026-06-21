import { useState } from 'react';
import { Layout, Menu, Button, Message, Avatar, Typography } from '@arco-design/web-react';
import {
  IconDashboard,
  IconList,
  IconGift,
  IconBook,
  IconFile,
  IconPoweroff,
  IconUser,
} from '@arco-design/web-react/icon';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';

const { Header, Content, Sider } = Layout;

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const adminUser = JSON.parse(localStorage.getItem('fluxbless_admin_user') || '{}');
  const activeKey = location.pathname.split('/').pop() || 'dashboard';

  const handleLogout = () => {
    localStorage.removeItem('fluxbless_admin_token');
    localStorage.removeItem('fluxbless_admin_user');
    Message.success('Logged out successfully');
    navigate('/login');
  };

  const handleMenuClick = (key: string) => {
    navigate(`/admin/${key}`);
  };

  return (
    <Layout style={{ minHeight: '100vh', background: '#121212' }}>
      {/* Sider Navigation */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        breakpoint='lg'
        style={{
          background: '#1a1a1a',
          borderRight: '1px solid rgba(212, 175, 55, 0.15)',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            paddingLeft: collapsed ? 0 : 20,
            borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
            background: '#0d0d0d',
          }}
        >
          <Typography.Title
            heading={5}
            style={{
              color: '#D4AF37',
              margin: 0,
              fontWeight: 'bold',
              letterSpacing: 1.5,
              display: collapsed ? 'none' : 'block',
            }}
          >
            FluxBless Admin
          </Typography.Title>
          {collapsed && (
            <span style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: 18 }}>FB</span>
          )}
        </div>
        <Menu
          selectedKeys={[activeKey]}
          onClickMenuItem={handleMenuClick}
          style={{ width: '100%', background: 'transparent' }}
          hasCollapseButton={false}
        >
          <Menu.Item
            key='dashboard'
            style={{
              color: activeKey === 'dashboard' ? '#000' : '#c5a059',
              background: activeKey === 'dashboard' ? 'linear-gradient(135deg, #AA7C11, #D4AF37)' : 'transparent',
            }}
          >
            <IconDashboard style={{ color: activeKey === 'dashboard' ? '#000' : '#AA7C11' }} />
            {!collapsed && 'Dashboard'}
          </Menu.Item>
          <Menu.Item
            key='categories'
            style={{
              color: activeKey === 'categories' ? '#000' : '#c5a059',
              background: activeKey === 'categories' ? 'linear-gradient(135deg, #AA7C11, #D4AF37)' : 'transparent',
            }}
          >
            <IconList style={{ color: activeKey === 'categories' ? '#000' : '#AA7C11' }} />
            {!collapsed && 'Categories'}
          </Menu.Item>
          <Menu.Item
            key='products'
            style={{
              color: activeKey === 'products' ? '#000' : '#c5a059',
              background: activeKey === 'products' ? 'linear-gradient(135deg, #AA7C11, #D4AF37)' : 'transparent',
            }}
          >
            <IconGift style={{ color: activeKey === 'products' ? '#000' : '#AA7C11' }} />
            {!collapsed && 'Products'}
          </Menu.Item>
          <Menu.Item
            key='orders'
            style={{
              color: activeKey === 'orders' ? '#000' : '#c5a059',
              background: activeKey === 'orders' ? 'linear-gradient(135deg, #AA7C11, #D4AF37)' : 'transparent',
            }}
          >
            <IconBook style={{ color: activeKey === 'orders' ? '#000' : '#AA7C11' }} />
            {!collapsed && 'Orders'}
          </Menu.Item>
          <Menu.Item
            key='logs'
            style={{
              color: activeKey === 'logs' ? '#000' : '#c5a059',
              background: activeKey === 'logs' ? 'linear-gradient(135deg, #AA7C11, #D4AF37)' : 'transparent',
            }}
          >
            <IconFile style={{ color: activeKey === 'logs' ? '#000' : '#AA7C11' }} />
            {!collapsed && 'System Logs'}
          </Menu.Item>
        </Menu>
      </Sider>

      {/* Main Container Layout */}
      <Layout>
        {/* Header */}
        <Header
          style={{
            height: 64,
            background: '#1a1a1a',
            borderBottom: '1px solid rgba(212, 175, 55, 0.15)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
          }}
        >
          <div>
            <Typography.Text style={{ color: '#fff', fontSize: 16 }}>
              Let positive energy flow, attract endless blessings
            </Typography.Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar style={{ background: '#AA7C11' }}>
              {adminUser.name ? adminUser.name[0].toUpperCase() : <IconUser />}
            </Avatar>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ color: '#fff', fontSize: 14, fontWeight: 'bold' }}>
                {adminUser.name || 'Admin'}
              </span>
              <span style={{ color: '#c5a059', fontSize: 12 }}>{adminUser.email}</span>
            </div>
            <Button
              type='text'
              icon={<IconPoweroff />}
              onClick={handleLogout}
              style={{ color: '#ff4d4f', marginLeft: 8 }}
            >
              Sign Out
            </Button>
          </div>
        </Header>

        {/* Content Panel */}
        <Content style={{ padding: 24, overflowY: 'auto', background: '#121212' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
