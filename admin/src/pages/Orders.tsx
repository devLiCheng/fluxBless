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

  const fetchOrders = async (page = 1, status = statusFilter) => {
    setLoading(true);
    try {
      let url = `/orders?page=${page}&limit=${pagination.pageSize}`;
      if (status) url += `&status=${status}`;

      const res = await api.get(url);
      // Backend returns either array directly or { items, total }
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
      Message.error('Failed to load orders');
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
      Message.success('Order status updated successfully');
      setStatusVisible(false);
      fetchOrders(pagination.current);
    } catch (err: any) {
      console.error(err);
      Message.error(err.response?.data?.message || 'Failed to update order status');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge status='error' text='PENDING' />;
      case 'paid':
        return <Badge status='warning' text='PAID' />;
      case 'shipped':
        return <Badge status='processing' text='SHIPPED' />;
      case 'completed':
        return <Badge status='success' text='COMPLETED' />;
      case 'cancelled':
        return <Badge status='default' text='CANCELLED' />;
      default:
        return <Badge status='default' text={status.toUpperCase()} />;
    }
  };

  const columns = [
    {
      title: 'Order ID',
      dataIndex: 'id',
      width: 100,
      render: (val: number) => <span style={{ color: '#D4AF37' }}>#{val}</span>,
    },
    {
      title: 'Customer Email',
      dataIndex: 'contactEmail',
    },
    {
      title: 'Total Amount',
      dataIndex: 'totalAmount',
      render: (val: any) => <span style={{ color: '#fff', fontWeight: 'bold' }}>${parseFloat(val).toFixed(2)}</span>,
    },
    {
      title: 'Payment Method',
      dataIndex: 'paymentMethod',
      render: (val: string) => val.toUpperCase(),
    },
    {
      title: 'Order Status',
      dataIndex: 'status',
      render: (val: string) => getStatusBadge(val),
    },
    {
      title: 'Order Date',
      dataIndex: 'createdAt',
      render: (val: string) => new Date(val).toLocaleString(),
    },
    {
      title: 'Actions',
      width: 220,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type='text'
            size='small'
            icon={<IconEye />}
            onClick={() => showDetailModal(record)}
            style={{ color: '#D4AF37' }}
          >
            Details
          </Button>
          <Button
            type='text'
            size='small'
            icon={<IconEdit />}
            onClick={() => showStatusModal(record)}
            style={{ color: '#c5a059' }}
          >
            Update Status
          </Button>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, color: '#D4AF37', fontFamily: 'serif', fontSize: 28, letterSpacing: 1.5 }}>
          Customer Orders
        </h2>
        <p style={{ margin: '4px 0 0 0', color: '#c5a059' }}>
          Monitor transaction states and manage shipping logistics.
        </p>
      </div>

      {/* Filter Bar */}
      <div
        style={{
          background: '#1a1a1a',
          padding: 16,
          borderRadius: 8,
          marginBottom: 16,
          border: '1px solid rgba(212, 175, 55, 0.1)',
          display: 'flex',
          gap: 16,
          alignItems: 'center',
        }}
      >
        <span style={{ color: '#c5a059' }}>Filter by Status:</span>
        <Select
          placeholder='All Statuses'
          value={statusFilter}
          onChange={handleStatusFilterChange}
          style={{ width: 200, background: '#222', border: '1px solid #333', color: '#fff' }}
          allowClear
        >
          <Select.Option value='pending'>Pending</Select.Option>
          <Select.Option value='paid'>Paid</Select.Option>
          <Select.Option value='shipped'>Shipped</Select.Option>
          <Select.Option value='completed'>Completed</Select.Option>
          <Select.Option value='cancelled'>Cancelled</Select.Option>
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
        style={{
          background: '#1a1a1a',
          border: '1px solid rgba(212, 175, 55, 0.15)',
          borderRadius: 8,
        }}
      />

      {/* Detail Modal */}
      <Modal
        title='Order Details'
        visible={detailVisible}
        onOk={() => setDetailVisible(false)}
        onCancel={() => setDetailVisible(false)}
        okText='Done'
        cancelButtonProps={{ style: { display: 'none' } }}
        style={{ width: 650, background: '#1a1a1a', border: '1px solid rgba(212, 175, 55, 0.2)' }}
      >
        {selectedOrder && (
          <div style={{ color: '#fff' }}>
            <Descriptions
              column={2}
              title={<span style={{ color: '#D4AF37', fontFamily: 'serif' }}>General Info</span>}
              data={[
                { label: 'Order ID', value: `#${selectedOrder.id}` },
                { label: 'Status', value: selectedOrder.status.toUpperCase() },
                { label: 'Contact Phone', value: selectedOrder.contactPhone },
                { label: 'Contact Email', value: selectedOrder.contactEmail },
                { label: 'Shipping Address', value: selectedOrder.shippingAddress, span: 2 },
              ]}
              style={{ marginBottom: 20 }}
            />

            <h3 style={{ color: '#D4AF37', fontFamily: 'serif', marginBottom: 12, borderBottom: '1px solid #333', paddingBottom: 8 }}>
              Ordered Items
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
                    borderBottom: '1px solid #222',
                  }}
                >
                  <div>
                    <strong style={{ color: '#fff' }}>
                      {item.product?.nameZh || `Product ID: ${item.productId}`}
                    </strong>
                    <div style={{ color: '#888', fontSize: 12 }}>
                      Quantity: {item.quantity} | Unit Price: ${parseFloat(item.price).toFixed(2)}
                    </div>
                  </div>
                  <div style={{ color: '#D4AF37', fontWeight: 'bold' }}>
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
        title='Update Order Status'
        visible={statusVisible}
        onOk={handleStatusUpdate}
        onCancel={() => setStatusVisible(false)}
        style={{ background: '#1a1a1a', border: '1px solid rgba(212, 175, 55, 0.2)' }}
      >
        <div style={{ padding: '10px 0' }}>
          <p style={{ color: '#c5a059', marginBottom: 12 }}>
            Select new operational state for Order #{selectedOrder?.id}:
          </p>
          <Select
            value={newStatus}
            onChange={setNewStatus}
            style={{ width: '100%', background: '#222', border: '1px solid #333', color: '#fff' }}
          >
            <Select.Option value='pending'>Pending</Select.Option>
            <Select.Option value='paid'>Paid</Select.Option>
            <Select.Option value='shipped'>Shipped</Select.Option>
            <Select.Option value='completed'>Completed</Select.Option>
            <Select.Option value='cancelled'>Cancelled</Select.Option>
          </Select>
        </div>
      </Modal>
    </div>
  );
}
