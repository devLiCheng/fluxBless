import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Select,
  Popconfirm,
  Message,
  Space,
  Tag,
} from '@arco-design/web-react';
import { IconDelete, IconCheck, IconHistory } from '@arco-design/web-react/icon';
import api from '../utils/api';

export default function Inquiries() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchInquiries = async (page = 1, status = statusFilter) => {
    setLoading(true);
    try {
      const url = status === 'all'
        ? `/inquiries?page=${page}&limit=${pagination.pageSize}`
        : `/inquiries?page=${page}&limit=${pagination.pageSize}&status=${status}`;
      const res = await api.get(url);
      const { items, total } = res.data;
      setData(items || []);
      setPagination((prev) => ({ ...prev, current: page, total: total || 0 }));
    } catch (err: any) {
      console.error(err);
      Message.error('加载留言列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInquiries(1, statusFilter);
  }, [statusFilter]);

  const handleTableChange = (p: any) => fetchInquiries(p.current);

  const handleStatusChange = async (id: number, currentStatus: string) => {
    const nextStatus = currentStatus === 'pending' ? 'processed' : 'pending';
    try {
      await api.put(`/inquiries/${id}/status`, { status: nextStatus });
      Message.success(nextStatus === 'processed' ? '已标记为已处理' : '已重新标记为待处理');
      fetchInquiries(pagination.current);
    } catch (err: any) {
      console.error(err);
      Message.error(err.response?.data?.message || '状态修改失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/inquiries/${id}`);
      Message.success('删除留言成功');
      fetchInquiries(pagination.current);
    } catch (err: any) {
      console.error(err);
      Message.error(err.response?.data?.message || '删除失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 70 },
    {
      title: '客户称呼',
      dataIndex: 'name',
      width: 120,
      render: (val: string) => val || <span style={{ color: 'var(--color-text-4)' }}>匿名消费者</span>,
    },
    {
      title: '联系方式',
      dataIndex: 'contactInfo',
      width: 180,
      render: (val: string) => {
        const isEmail = val.includes('@');
        const isNumber = /^\+?[0-9\s-]{6,20}$/.test(val);
        return (
          <Space size={4} direction="vertical">
            <span style={{ fontWeight: 'bold' }}>{val}</span>
            {isEmail && <Tag size="small" color="arcoblue">Email</Tag>}
            {!isEmail && isNumber && <Tag size="small" color="green">WhatsApp/Phone</Tag>}
            {!isEmail && !isNumber && <Tag size="small" color="orangered">Other Contact</Tag>}
          </Space>
        );
      },
    },
    {
      title: '留言反馈内容',
      dataIndex: 'message',
      render: (val: string) => (
        <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', fontSize: 13 }}>
          {val}
        </div>
      ),
    },
    {
      title: '关联商品',
      dataIndex: 'product',
      width: 150,
      render: (product: any) => {
        if (!product) return <span style={{ color: 'var(--color-text-4)' }}>-</span>;
        return (
          <Space direction="vertical" size={2}>
            <span style={{ fontSize: 12 }}>{product.nameZh}</span>
            <span style={{ fontSize: 11, color: 'var(--color-text-3)' }}>ID: {product.id}</span>
          </Space>
        );
      },
    },
    {
      title: '提交时间',
      dataIndex: 'createdAt',
      width: 160,
      render: (val: string) => new Date(val).toLocaleString(),
    },
    {
      title: '状态',
      dataIndex: 'status',
      width: 100,
      render: (status: string) => (
        status === 'processed' ? (
          <Tag color="green">已处理</Tag>
        ) : (
          <Tag color="gold">待处理</Tag>
        )
      ),
    },
    {
      title: '操作',
      width: 160,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type='text'
            size='small'
            status={record.status === 'pending' ? 'success' : 'warning'}
            onClick={() => handleStatusChange(record.id, record.status)}
            icon={record.status === 'pending' ? <IconCheck /> : <IconHistory />}
          >
            {record.status === 'pending' ? '已处理' : '待处理'}
          </Button>
          <Popconfirm
            title='确定要删除这条客服留言吗？'
            onOk={() => handleDelete(record.id)}
            okText='确定'
            cancelText='取消'
          >
            <Button
              type='text'
              size='small'
              status='danger'
              icon={<IconDelete />}
            >
              删除
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24 }}>客服留言管理</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-3)' }}>
            查看消费者提交的问题反馈和联系方式，标记处理进度，协助跟进客户咨询。
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <span style={{ fontSize: 14 }}>状态筛选:</span>
          <Select
            value={statusFilter}
            onChange={setStatusFilter}
            style={{ width: 140 }}
          >
            <Select.Option value='all'>全部留言</Select.Option>
            <Select.Option value='pending'>待处理</Select.Option>
            <Select.Option value='processed'>已处理</Select.Option>
          </Select>
        </div>
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
    </div>
  );
}
