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
        Message.error('加载仪表盘数据失败');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '60vh' }}>
        <Spin size={40} tip='正在加载数据...' />
      </div>
    );
  }

  const getStatusText = (status: string) => {
    const mapping: Record<string, string> = {
      pending: '待处理',
      paid: '已付款',
      shipped: '已发货',
      completed: '已完成',
      cancelled: '已取消',
    };
    return mapping[status] || status;
  };

  const getStatusColor = (status: string) => {
    const mapping: Record<string, string> = {
      pending: 'red',
      paid: 'orange',
      shipped: 'blue',
      completed: 'green',
      cancelled: 'gray',
    };
    return mapping[status] || 'gray';
  };

  return (
    <div style={{ padding: '4px 0' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24 }}>
          店铺经营概览
        </h2>
        <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-3)' }}>
          FluxBless 店铺实时数据概览。
        </p>
      </div>

      {/* KPI Grid */}
      <Grid.Row gutter={24} style={{ marginBottom: 24 }}>
        <Grid.Col span={6}>
          <Card bordered={true}>
            <Statistic
              title="总销售额"
              value={stats.sales}
              precision={2}
              prefix='$'
              extra="已付款和已发货订单"
            />
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card bordered={true}>
            <Statistic
              title="总订单数"
              value={stats.ordersCount}
              prefix={<IconBook />}
            />
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card bordered={true}>
            <Statistic
              title="待处理订单"
              value={stats.pendingOrders}
              prefix={<IconThunderbolt />}
            />
          </Card>
        </Grid.Col>
        <Grid.Col span={6}>
          <Card bordered={true}>
            <Statistic
              title="在售商品数"
              value={stats.productsCount}
              prefix={<IconGift />}
            />
          </Card>
        </Grid.Col>
      </Grid.Row>

      {/* Main Content Body */}
      <Grid.Row gutter={24}>
        {/* Left Side: Recent Orders & Alerts */}
        <Grid.Col span={16}>
          <Card
            title="最近交易"
            bordered={true}
            style={{ marginBottom: 24 }}
          >
            <Table
              rowKey='id'
              loading={loading}
              columns={[
                {
                  title: '订单ID',
                  dataIndex: 'id',
                  render: (val) => <span>#{val}</span>,
                },
                {
                  title: '顾客',
                  dataIndex: 'contactEmail',
                  render: (val, record: any) => (
                    <div>
                      <div>{record.user?.name || '游客'}</div>
                      <div style={{ fontSize: 11, color: 'var(--color-text-3)' }}>{val}</div>
                    </div>
                  ),
                },
                {
                  title: '订单金额',
                  dataIndex: 'totalAmount',
                  render: (val) => <span style={{ fontWeight: 'bold' }}>${parseFloat(val).toFixed(2)}</span>,
                },
                {
                  title: '订单状态',
                  dataIndex: 'status',
                  render: (val) => {
                    const color = getStatusColor(val);
                    return (
                      <span
                        style={{
                          color: `var(--color-${color}-6)`,
                          background: `var(--color-${color}-1)`,
                          padding: '2px 8px',
                          borderRadius: 4,
                          fontSize: 12,
                          fontWeight: 'bold',
                        }}
                      >
                        {getStatusText(val)}
                      </span>
                    );
                  },
                },
              ]}
              data={recentOrders}
              pagination={false}
            />
          </Card>

          {lowStockProducts.length > 0 && (
            <Card bordered={true} style={{ border: '1px solid var(--color-warning-border)' }}>
              <Alert
                type='warning'
                showIcon
                icon={<IconSound />}
                title={<span style={{ fontWeight: 'bold' }}>库存不足警告</span>}
                content={
                  <div style={{ marginTop: 8 }}>
                    以下商品库存不足，请及时补货：
                    <ul style={{ margin: '4px 0 0 0', paddingLeft: 20 }}>
                      {lowStockProducts.map((p: any) => (
                        <li key={p.id} style={{ color: 'var(--color-warning-text)', margin: '2px 0' }}>
                          {p.nameZh} (剩余 {p.stock} 件)
                        </li>
                      ))}
                    </ul>
                  </div>
                }
              />
            </Card>
          )}
        </Grid.Col>

        {/* Right Side: Timeline & Logs */}
        <Grid.Col span={8}>
          <Card
            title="最近系统事件"
            bordered={true}
            style={{ minHeight: 400 }}
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
                        background: log.level === 'error' ? 'var(--color-danger-6)' : 'var(--color-primary-6)',
                        display: 'inline-block',
                      }}
                    />
                  }
                >
                  <div style={{ fontSize: 13 }}>{log.message}</div>
                  <div style={{ color: 'var(--color-text-3)', fontSize: 11, marginTop: 2 }}>
                    级别: {log.level.toUpperCase()}
                  </div>
                </Timeline.Item>
              ))}
              {recentLogs.length === 0 && (
                <Timeline.Item>暂无最新系统日志。</Timeline.Item>
              )}
            </Timeline>
          </Card>
        </Grid.Col>
      </Grid.Row>
    </div>
  );
}
