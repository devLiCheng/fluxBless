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
    Message.success('成功退出登录');
    navigate('/login');
  };

  const handleMenuClick = (key: string) => {
    navigate(`/admin/${key}`);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      {/* Sider Navigation */}
      <Sider
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        breakpoint='lg'
        style={{
          borderRight: '1px solid var(--color-border)',
        }}
      >
        <div
          style={{
            height: 64,
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'flex-start',
            paddingLeft: collapsed ? 0 : 20,
            borderBottom: '1px solid var(--color-border)',
          }}
        >
          <Typography.Title
            heading={5}
            style={{
              margin: 0,
              fontWeight: 'bold',
              display: collapsed ? 'none' : 'block',
            }}
          >
            FluxBless 后台管理
          </Typography.Title>
          {collapsed && (
            <span style={{ fontWeight: 'bold', fontSize: 18 }}>FB</span>
          )}
        </div>
        <Menu
          selectedKeys={[activeKey]}
          onClickMenuItem={handleMenuClick}
          style={{ width: '100%' }}
          hasCollapseButton={false}
        >
          <Menu.Item key='dashboard'>
            <IconDashboard />
            {!collapsed && '仪表盘'}
          </Menu.Item>
          <Menu.Item key='categories'>
            <IconList />
            {!collapsed && '分类管理'}
          </Menu.Item>
          <Menu.Item key='products'>
            <IconGift />
            {!collapsed && '商品管理'}
          </Menu.Item>
          <Menu.Item key='orders'>
            <IconBook />
            {!collapsed && '订单管理'}
          </Menu.Item>
          <Menu.Item key='logs'>
            <IconFile />
            {!collapsed && '系统日志'}
          </Menu.Item>
        </Menu>
      </Sider>

      {/* Main Container Layout */}
      <Layout>
        {/* Header */}
        <Header
          style={{
            height: 64,
            borderBottom: '1px solid var(--color-border)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '0 24px',
            background: 'var(--color-bg-3)',
          }}
        >
          <div>
            <Typography.Text type='secondary'>
              让正向能量流转，吸纳源源不断好运
            </Typography.Text>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <Avatar>
              {adminUser.name ? adminUser.name[0].toUpperCase() : <IconUser />}
            </Avatar>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{ fontSize: 14, fontWeight: 'bold' }}>
                {adminUser.name || '管理员'}
              </span>
              <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>{adminUser.email}</span>
            </div>
            <Button
              type='text'
              icon={<IconPoweroff />}
              onClick={handleLogout}
              style={{ color: '#ff4d4f', marginLeft: 8 }}
            >
              退出登录
            </Button>
          </div>
        </Header>

        {/* Content Panel */}
        <Content style={{ padding: 24, overflowY: 'auto' }}>
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
}
