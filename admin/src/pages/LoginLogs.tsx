import { useEffect, useState } from 'react';
import { Table, Message, Tag } from '@arco-design/web-react';
import api from '../utils/api';

export default function LoginLogs() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const res = await api.get(`/login-logs?page=${page}&limit=${pagination.pageSize}`);
      const { items, total } = res.data;
      setData(items || []);
      setPagination((prev) => ({ ...prev, current: page, total: total || 0 }));
    } catch (err: any) {
      console.error(err);
      Message.error('加载登录日志失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleTableChange = (p: any) => fetchLogs(p.current);

  const columns = [
    {
      title: '登录时间',
      dataIndex: 'loginTime',
      width: 180,
      render: (val: string) => new Date(val).toLocaleString(),
    },
    {
      title: '用户名/姓名',
      dataIndex: 'user',
      render: (user: any) => user?.name || <span style={{ color: 'var(--color-text-4)' }}>无名氏</span>,
    },
    {
      title: '电子邮箱',
      dataIndex: 'user',
      render: (user: any) => user?.email || '',
    },
    {
      title: 'IP 地址',
      dataIndex: 'ip',
      width: 140,
      render: (ip: string) => <Tag color='arcoblue'>{ip}</Tag>,
    },
    {
      title: '归属国家/地区',
      dataIndex: 'country',
      width: 160,
      render: (country: string) => {
        const isLocal = country === '本地开发/局域网';
        return <Tag color={isLocal ? 'orange' : 'green'}>{country || '未知国家'}</Tag>;
      },
    },
    {
      title: '浏览器 UA',
      dataIndex: 'userAgent',
      ellipsis: true,
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24 }}>用户登录日志</h2>
        <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-3)' }}>
          展示所有用户的每次登录记录，包括登录IP地址、所在地区、UA设备信息等。
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
