import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Select,
  Modal,
  Message,
  Space,
  Descriptions,
  List,
  Badge,
} from '@arco-design/web-react';
import { IconEye, IconEdit } from '@arco-design/web-react/icon';
import api from '../utils/api';

export default function Orders() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [detailVisible, setDetailVisible] = useState(false);
  const [statusVisible, setStatusVisible] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });

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

  const fetchOrders = async (page = 1, status = statusFilter) => {
    setLoading(true);
    try {
      let url = `/orders?page=${page}&limit=${pagination.pageSize}`;
      if (status) url += `&status=${status}`;

      const res = await api.get(url);
      const items = Array.isArray(res.data) ? res.data : res.data.items || [];
      const total = Array.isArray(res.data) ? res.data.length : res.data.total || 0;

      setData(items);
      setPagination((prev) => ({
        ...prev,
        current: page,
        total: total,
      }));
    } catch (err: any) {
      console.error(err);
      Message.error('加载订单失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleTableChange = (p: any) => {
    fetchOrders(p.current);
  };

  const handleStatusFilterChange = (val: string) => {
    setStatusFilter(val || undefined);
    fetchOrders(1, val || undefined);
  };

  const showDetailModal = (record: any) => {
    setSelectedOrder(record);
    setDetailVisible(true);
  };

  const showStatusModal = (record: any) => {
    setSelectedOrder(record);
    setNewStatus(record.status);
    setStatusVisible(true);
  };

  const handleStatusUpdate = async () => {
    if (!selectedOrder) return;
    try {
      await api.put(`/orders/${selectedOrder.id}/status`, { status: newStatus });
      Message.success('更新订单状态成功');
      setStatusVisible(false);
      fetchOrders(pagination.current);
    } catch (err: any) {
      console.error(err);
      Message.error(err.response?.data?.message || '更新订单状态失败');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge status='error' text='待处理' />;
      case 'paid':
        return <Badge status='warning' text='已付款' />;
      case 'shipped':
        return <Badge status='processing' text='已发货' />;
      case 'completed':
        return <Badge status='success' text='已完成' />;
      case 'cancelled':
        return <Badge status='default' text='已取消' />;
      default:
        return <Badge status='default' text={status} />;
    }
  };

  const columns = [
    {
      title: '订单ID',
      dataIndex: 'id',
      width: 100,
      render: (val: number) => <span>#{val}</span>,
    },
    {
      title: '顾客邮箱',
      dataIndex: 'contactEmail',
    },
    {
      title: '总金额',
      dataIndex: 'totalAmount',
      render: (val: any) => <span style={{ fontWeight: 'bold' }}>${parseFloat(val).toFixed(2)}</span>,
    },
    {
      title: '支付方式',
      dataIndex: 'paymentMethod',
      render: (val: string) => val === 'stripe' ? 'Stripe 支付' : val,
    },
    {
      title: '订单状态',
      dataIndex: 'status',
      render: (val: string) => getStatusBadge(val),
    },
    {
      title: '下单时间',
      dataIndex: 'createdAt',
      render: (val: string) => new Date(val).toLocaleString(),
    },
    {
      title: '操作',
      width: 220,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type='text'
            size='small'
            icon={<IconEye />}
            onClick={() => showDetailModal(record)}
          >
            详情
          </Button>
          <Button
            type='text'
            size='small'
            icon={<IconEdit />}
            onClick={() => showStatusModal(record)}
          >
            更新状态
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24 }}>
          订单管理
        </h2>
        <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-3)' }}>
          监控交易状态并管理发货物流信息。
        </p>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          padding: 16,
          borderRadius: 8,
          marginBottom: 16,
          border: '1px solid var(--color-border)',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <span>订单状态筛选：</span>
        <Select
          placeholder='全部状态'
          value={statusFilter}
          onChange={handleStatusFilterChange}
          style={{ width: 200 }}
          allowClear
        >
          <Select.Option value='pending'>待处理</Select.Option>
          <Select.Option value='paid'>已付款</Select.Option>
          <Select.Option value='shipped'>已发货</Select.Option>
          <Select.Option value='completed'>已完成</Select.Option>
          <Select.Option value='cancelled'>已取消</Select.Option>
        </Select>
      </div>

      <Table
        rowKey='id'
        loading={loading}
        columns={columns}
        data={data}
        pagination={{
          current: pagination.current,
          pageSize: pagination.pageSize,
          total: pagination.total,
          showTotal: true,
        }}
        onChange={handleTableChange}
      />

      {/* Detail Modal */}
      <Modal
        title='订单详情'
        visible={detailVisible}
        onOk={() => setDetailVisible(false)}
        onCancel={() => setDetailVisible(false)}
        okText='确定'
        cancelButtonProps={{ style: { display: 'none' } }}
        style={{ width: 650 }}
      >
        {selectedOrder && (
          <div>
            <Descriptions
              column={2}
              title="基本信息"
              data={[
                { label: '订单ID', value: `#${selectedOrder.id}` },
                { label: '状态', value: getStatusText(selectedOrder.status) },
                { label: '联系电话', value: selectedOrder.contactPhone },
                { label: '联系邮箱', value: selectedOrder.contactEmail },
                { label: '收货地址', value: selectedOrder.shippingAddress, span: 2 },
              ]}
              style={{ marginBottom: 20 }}
            />

            <h3 style={{ marginBottom: 12, borderBottom: '1px solid var(--color-border)', paddingBottom: 8 }}>
              订单商品列表
            </h3>
            <List
              dataSource={selectedOrder.items || []}
              render={(item: any, index) => (
                <List.Item
                  key={index}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    padding: '12px 0',
                    borderBottom: '1px solid var(--color-border)',
                  }}
                >
                  <div>
                    <strong>
                      {item.product?.nameZh || `商品 ID: ${item.productId}`}
                    </strong>
                    <div style={{ color: 'var(--color-text-3)', fontSize: 12 }}>
                      数量: {item.quantity} | 单价: ${parseFloat(item.price).toFixed(2)}
                    </div>
                  </div>
                  <div style={{ fontWeight: 'bold' }}>
                    ${(parseFloat(item.price) * item.quantity).toFixed(2)}
                  </div>
                </List.Item>
              )}
            />
          </div>
        )}
      </Modal>

      {/* Update Status Modal */}
      <Modal
        title='更新订单状态'
        visible={statusVisible}
        onOk={handleStatusUpdate}
        onCancel={() => setStatusVisible(false)}
      >
        <div style={{ padding: '10px 0' }}>
          <p style={{ marginBottom: 12 }}>
            请选择订单 #{selectedOrder?.id} 的新状态：
          </p>
          <Select
            value={newStatus}
            onChange={setNewStatus}
            style={{ width: '100%' }}
          >
            <Select.Option value='pending'>待处理</Select.Option>
            <Select.Option value='paid'>已付款</Select.Option>
            <Select.Option value='shipped'>已发货</Select.Option>
            <Select.Option value='completed'>已完成</Select.Option>
            <Select.Option value='cancelled'>已取消</Select.Option>
          </Select>
        </div>
      </Modal>
    </div>
  );
}
