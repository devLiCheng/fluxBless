import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Select,
  Popconfirm,
  Message,
  Space,
} from '@arco-design/web-react';
import { IconDelete } from '@arco-design/web-react/icon';
import api from '../utils/api';

export default function Users() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchUsers = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/users?page=${page}&limit=${pagination.pageSize}`);
      const { items, total } = res.data;
      setData(items || []);
      setPagination((prev) => ({ ...prev, current: page, total: total || 0 }));
    } catch (err: any) {
      console.error(err);
      Message.error('加载用户列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleTableChange = (p: any) => fetchUsers(p.current);

  const handleRoleChange = async (id: number, newRole: string) => {
    try {
      await api.patch(`/users/${id}`, { role: newRole });
      Message.success('用户权限修改成功');
      fetchUsers(pagination.current);
    } catch (err: any) {
      console.error(err);
      Message.error(err.response?.data?.message || '操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/users/${id}`);
      Message.success('删除用户成功');
      fetchUsers(pagination.current);
    } catch (err: any) {
      console.error(err);
      Message.error(err.response?.data?.message || '删除失败');
    }
  };

  const columns = [
    { title: 'ID', dataIndex: 'id', width: 80 },
    {
      title: '用户名/姓名',
      dataIndex: 'name',
      render: (val: string) => val || <span style={{ color: 'var(--color-text-4)' }}>无名氏</span>,
    },
    { title: '电子邮箱', dataIndex: 'email' },
    {
      title: '角色/权限',
      dataIndex: 'role',
      width: 150,
      render: (role: string, record: any) => (
        <Select
          value={role}
          onChange={(val) => handleRoleChange(record.id, val)}
          style={{ width: 110 }}
        >
          <Select.Option value='user'>普通用户</Select.Option>
          <Select.Option value='admin'>管理员</Select.Option>
        </Select>
      ),
    },
    {
      title: '注册时间',
      dataIndex: 'createdAt',
      render: (val: string) => new Date(val).toLocaleString(),
    },
    {
      title: '操作',
      width: 120,
      render: (_: any, record: any) => {
        // Protect self-deletion or superadmin deletion (mock logic or prevent if id matches current admin id)
        const currentAdmin = JSON.parse(localStorage.getItem('fluxbless_admin_user') || '{}');
        const isSelf = currentAdmin.id === record.id;
        
        return (
          <Space>
            <Popconfirm
              title='确定要删除该用户吗？'
              onOk={() => handleDelete(record.id)}
              disabled={isSelf}
              okText='确定'
              cancelText='取消'
            >
              <Button
                type='text'
                size='small'
                status='danger'
                disabled={isSelf}
                icon={<IconDelete />}
              >
                删除
              </Button>
            </Popconfirm>
          </Space>
        );
      },
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24 }}>用户注册管理</h2>
        <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-3)' }}>
          列出和管理所有的消费者用户，支持角色升降权限管理及客户注销操作。
        </p>
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
