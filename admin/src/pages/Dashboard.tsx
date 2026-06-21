import { useEffect, useState } from 'react';
import { Grid, Card, Statistic, Table, Timeline, Alert, Message, Spin } from '@arco-design/web-react';
import { IconBook, IconGift, IconSound, IconThunderbolt } from '@arco-design/web-react/icon';
import api from '../utils/api';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    sales: 0,
    ordersCount: 0,
    pendingOrders: 0,
    productsCount: 0,
  });
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [recentLogs, setRecentLogs] = useState([]);

  useEffect(() => {
    async function fetchData() {
      try {
        setLoading(true);
        const [ordersRes, productsRes, logsRes] = await Promise.all([
          api.get('/orders'),
          api.get('/products?limit=100'),
          api.get('/logs?limit=5'),
        ]);

        const orders = ordersRes.data || [];
        const productsObj = productsRes.data || { items: [] };
        const products = productsObj.items || [];
        const logsObj = logsRes.data || { items: [] };
        const logs = logsObj.items || [];

        // Compute KPIs
        const paidOrders = orders.filter((o: any) => ['paid', 'shipped', 'completed'].includes(o.status));
        const sales = paidOrders.reduce((sum: number, o: any) => sum + parseFloat(o.totalAmount), 0);
        const pending = orders.filter((o: any) => o.status === 'pending').length;

        setStats({
          sales,
          ordersCount: orders.length,
          pendingOrders: pending,
          productsCount: products.length,
        });

        // Low stock products
        const lowStock = products.filter((p: any) => p.stock < 25);
        setLowStockProducts(lowStock);

        // Recent orders
        setRecentOrders(orders.slice(0, 5));

        // Recent logs
        setRecentLogs(logs);

      } catch (err: any) {
        console.error(err);
        Message.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size={40} tip='Loading energy grid...' style={{ color: '#D4AF37' }} />
      </div>
    );
  }

  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: '#D4AF37', fontFamily: 'serif', fontSize: 28, letterSpacing: 1.5 }}>
          Store Energy Aura
        </h2>
        <p style={{ margin: '4px 0 0 0', color: '#c5a059' }}>
          Real-time snapshot of the FluxBless spiritual storefront.
        </p>
      </div>

      {/* KPI Grid */}
      <Grid.Row gutter={24} style={{ marginBottom: 24 }}>
        <Grid.Col span={6}>
          <Card
            bordered={false}
            style={{
              background: '#1a1a1a',
              border: '1px solid rgba(212, 175, 55, 0.15)',
              borderRadius: 8,
            }}
          >
            <Statistic
              title={<span style={{ color: '#c5a059', fontWeight: 600 }}>Total Revenue</span>}
              value={stats.sales}
              precision={2}
              prefix='$'
              extra={<span style={{ color: '#D4AF37' }}>Paid & Shipped Orders</span>}
              style={{ color: '#D4AF37', fontSize: 24, fontWeight: 'bold' }}
            />
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card
            bordered={false}
            style={{
              background: '#1a1a1a',
              border: '1px solid rgba(212, 175, 55, 0.15)',
              borderRadius: 8,
            }}
          >
            <Statistic
              title={<span style={{ color: '#c5a059', fontWeight: 600 }}>Total Orders</span>}
              value={stats.ordersCount}
              prefix={<IconBook style={{ color: '#AA7C11' }} />}
              style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}
            />
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card
            bordered={false}
            style={{
              background: '#1a1a1a',
              border: '1px solid rgba(212, 175, 55, 0.15)',
              borderRadius: 8,
            }}
          >
            <Statistic
              title={<span style={{ color: '#c5a059', fontWeight: 600 }}>Pending Orders</span>}
              value={stats.pendingOrders}
              prefix={<IconThunderbolt style={{ color: '#ff4d4f' }} />}
              style={{ color: stats.pendingOrders > 0 ? '#ff4d4f' : '#52c41a', fontSize: 24, fontWeight: 'bold' }}
            />
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card
            bordered={false}
            style={{
              background: '#1a1a1a',
              border: '1px solid rgba(212, 175, 55, 0.15)',
              borderRadius: 8,
            }}
          >
            <Statistic
              title={<span style={{ color: '#c5a059', fontWeight: 600 }}>Active Listings</span>}
              value={stats.productsCount}
              prefix={<IconGift style={{ color: '#AA7C11' }} />}
              style={{ color: '#fff', fontSize: 24, fontWeight: 'bold' }}
            />
          </Card>
        </Grid.Col>
      </Grid.Row>

      {/* Main Content Body */}
      <Grid.Row gutter={24}>
        {/* Left Side: Recent Orders & Alerts */}
        <Grid.Col span={16}>
          <Card
            title={<span style={{ color: '#D4AF37', fontFamily: 'serif' }}>Recent Transactions</span>}
            bordered={false}
            style={{
              background: '#1a1a1a',
              border: '1px solid rgba(212, 175, 55, 0.15)',
              borderRadius: 8,
              marginBottom: 24,
            }}
          >
            <Table
              rowKey='id'
              loading={loading}
              columns={[
                {
                  title: 'Order ID',
                  dataIndex: 'id',
                  render: (val) => <span style={{ color: '#D4AF37' }}>#{val}</span>,
                },
                {
                  title: 'Customer',
                  dataIndex: 'contactEmail',
                  render: (val, record: any) => (
                    <div>
                      <div style={{ color: '#fff' }}>{record.user?.name || 'Guest'}</div>
                      <div style={{ fontSize: 11, color: '#888' }}>{val}</div>
                    </div>
                  ),
                },
                {
                  title: 'Amount',
                  dataIndex: 'totalAmount',
                  render: (val) => <span style={{ color: '#fff', fontWeight: 'bold' }}>${parseFloat(val).toFixed(2)}</span>,
                },
                {
                  title: 'Status',
                  dataIndex: 'status',
                  render: (val) => {
                    let color = '#fff';
                    let bg = '#333';
                    if (val === 'pending') { color = '#ff4d4f'; bg = 'rgba(255,77,79,0.1)'; }
                    else if (val === 'paid') { color = '#faad14'; bg = 'rgba(250,173,20,0.1)'; }
                    else if (val === 'shipped') { color = '#1890ff'; bg = 'rgba(24,144,255,0.1)'; }
                    else if (val === 'completed') { color = '#52c41a'; bg = 'rgba(82,196,26,0.1)'; }
                    return (
                      <span
                        style={{
                          color,
                          background: bg,
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 'bold',
                        }}
                      >
                        {val.toUpperCase()}
                      </span>
                    );
                  },
                },
              ]}
              data={recentOrders}
              pagination={false}
              style={{ background: 'transparent' }}
            />
          </Card>

          {lowStockProducts.length > 0 && (
            <Alert
              type='warning'
              showIcon
              icon={<IconSound />}
              title={<span style={{ fontWeight: 'bold' }}>Inventory Energy Low Warning</span>}
              content={
                <div style={{ marginTop: 8 }}>
                  The following items have low stock. Plan replenishment to maintain spiritual presence:
                  <ul style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
                    {lowStockProducts.map((p: any) => (
                      <li key={p.id} style={{ color: '#ffad14', margin: '2px 0' }}>
                        {p.nameZh} / {p.nameEn} ({p.stock} units remaining)
                      </li>
                    ))}
                  </ul>
                </div>
              }
              style={{
                background: 'rgba(250, 173, 20, 0.08)',
                border: '1px solid rgba(250, 173, 20, 0.3)',
                borderRadius: 8,
              }}
            />
          )}
        </Grid.Col>

        {/* Right Side: Timeline & Logs */}
        <Grid.Col span={8}>
          <Card
            title={<span style={{ color: '#D4AF37', fontFamily: 'serif' }}>Recent Aura Events</span>}
            bordered={false}
            style={{
              background: '#1a1a1a',
              border: '1px solid rgba(212, 175, 55, 0.15)',
              borderRadius: 8,
              minHeight: 400,
            }}
          >
            <Timeline style={{ paddingLeft: 10 }}>
              {recentLogs.map((log: any) => (
                <Timeline.Item
                  key={log.id}
                  label={new Date(log.createdAt).toLocaleTimeString()}
                  dot={
                    <span
                      style={{
                        width: 8,
                        height: 8,
                        borderRadius: '50%',
                        background: log.level === 'error' ? '#ff4d4f' : '#D4AF37',
                        display: 'inline-block',
                      }}
                    />
                  }
                >
                  <div style={{ color: '#fff', fontSize: 13 }}>{log.message}</div>
                  <div style={{ color: '#888', fontSize: 11, marginTop: 2 }}>
                    Level: {log.level.toUpperCase()}
                  </div>
                </Timeline.Item>
              ))}
              {recentLogs.length === 0 && (
                <Timeline.Item>No recent events recorded in the logger.</Timeline.Item>
              )}
            </Timeline>
          </Card>
        </Grid.Col>
      </Grid.Row>
    </div>
  );
}
