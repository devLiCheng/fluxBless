import { useEffect, useState } from 'react';
import { Table, Select, Tag, Button } from '@arco-design/web-react';
import { IconRefresh } from '@arco-design/web-react/icon';
import api from '../utils/api';

export default function SystemLogs() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [levelFilter, setLevelFilter] = useState<string | undefined>(undefined);

  // Pagination state
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 15,
    total: 0,
  });

  const fetchLogs = async (page = 1, level = levelFilter) => {
    setLoading(true);
    try {
      let url = `/logs?page=${page}&limit=${pagination.pageSize}`;
      if (level) url += `&level=${level}`;

      const res = await api.get(url);
      const { items, total } = res.data;

      setData(items || []);
      setPagination((prev) => ({
        ...prev,
        current: page,
        total: total || 0,
      }));
    } catch (err) {
      console.error('加载系统日志失败', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const handleTableChange = (p: any) => {
    fetchLogs(p.current);
  };

  const handleLevelChange = (val: string) => {
    setLevelFilter(val || undefined);
    fetchLogs(1, val || undefined);
  };

  const handleRefresh = () => {
    fetchLogs(pagination.current, levelFilter);
  };

  const getLevelTag = (level: string) => {
    const lvl = level.toLowerCase();
    if (lvl === 'error') return <Tag color='red'>ERROR</Tag>;
    if (lvl === 'warn' || lvl === 'warning') return <Tag color='orange'>WARN</Tag>;
    return <Tag color='green'>INFO</Tag>;
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '日志级别',
      dataIndex: 'level',
      width: 100,
      render: (val: string) => getLevelTag(val),
    },
    {
      title: '日志内容',
      dataIndex: 'message',
    },
    {
      title: '记录时间',
      dataIndex: 'createdAt',
      width: 200,
      render: (val: string) => new Date(val).toLocaleString(),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24 }}>
            系统日志与运行监控
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-3)' }}>
            监控前台客户端崩溃、性能日志及服务器审计轨迹。
          </p>
        </div>
        <Button
          type='outline'
          icon={<IconRefresh />}
          onClick={handleRefresh}
        >
          刷新日志
        </Button>
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
        <span>按日志级别筛选：</span>
        <Select
          placeholder='全部级别'
          value={levelFilter}
          onChange={handleLevelChange}
          style={{ width: 200 }}
          allowClear
        >
          <Select.Option value='info'>INFO</Select.Option>
          <Select.Option value='warn'>WARN</Select.Option>
          <Select.Option value='error'>ERROR</Select.Option>
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
        expandedRowRender={(record: any) => {
          if (!record.meta) return <div style={{ padding: 8, color: 'var(--color-text-3)' }}>暂无记录元数据。</div>;
          try {
            const parsed = JSON.parse(record.meta);
            return (
              <pre
                style={{
                  background: 'var(--color-fill-2)',
                  color: 'var(--color-text-1)',
                  padding: 12,
                  margin: 0,
                  borderRadius: 4,
                  fontSize: 12,
                  maxHeight: 250,
                  overflowY: 'auto',
                  border: '1px solid var(--color-border)',
                }}
              >
                {JSON.stringify(parsed, null, 2)}
              </pre>
            );
          } catch {
            return (
              <pre
                style={{
                  background: 'var(--color-fill-2)',
                  color: 'var(--color-text-1)',
                  padding: 12,
                  margin: 0,
                  borderRadius: 4,
                  fontSize: 12,
                  maxHeight: 250,
                  overflowY: 'auto',
                  border: '1px solid var(--color-border)',
                }}
              >
                {record.meta}
              </pre>
            );
          }
        }}
      />
    </div>
  );
}
