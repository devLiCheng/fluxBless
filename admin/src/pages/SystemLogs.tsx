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
      console.error('Failed to load system logs', err);
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
      title: 'Level',
      dataIndex: 'level',
      width: 100,
      render: (val: string) => getLevelTag(val),
    },
    {
      title: 'Message',
      dataIndex: 'message',
      render: (val: string) => <span style={{ color: '#fff' }}>{val}</span>,
    },
    {
      title: 'Logged At',
      dataIndex: 'createdAt',
      width: 200,
      render: (val: string) => new Date(val).toLocaleString(),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, color: '#D4AF37', fontFamily: 'serif', fontSize: 28, letterSpacing: 1.5 }}>
            System Logs & Telemetry
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#c5a059' }}>
            Monitor C-end client crashes, performance logging, and server audit trails.
          </p>
        </div>
        <Button
          type='outline'
          icon={<IconRefresh />}
          onClick={handleRefresh}
          style={{
            marginLeft: 'auto',
            borderColor: '#AA7C11',
            color: '#D4AF37',
          }}
        >
          Refresh Logs
        </Button>
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
        <span style={{ color: '#c5a059' }}>Filter by Severity:</span>
        <Select
          placeholder='All Levels'
          value={levelFilter}
          onChange={handleLevelChange}
          style={{ width: 200, background: '#222', border: '1px solid #333', color: '#fff' }}
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
          if (!record.meta) return <div style={{ padding: 8, color: '#888' }}>No metadata recorded.</div>;
          try {
            const parsed = JSON.parse(record.meta);
            return (
              <pre
                style={{
                  background: '#0d0d0d',
                  color: '#a3be8c',
                  padding: 12,
                  margin: 0,
                  borderRadius: 4,
                  fontSize: 12,
                  maxHeight: 250,
                  overflowY: 'auto',
                  border: '1px solid #333',
                }}
              >
                {JSON.stringify(parsed, null, 2)}
              </pre>
            );
          } catch {
            return (
              <pre
                style={{
                  background: '#0d0d0d',
                  color: '#a3be8c',
                  padding: 12,
                  margin: 0,
                  borderRadius: 4,
                  fontSize: 12,
                  maxHeight: 250,
                  overflowY: 'auto',
                  border: '1px solid #333',
                }}
              >
                {record.meta}
              </pre>
            );
          }
        }}
        style={{
          background: '#1a1a1a',
          border: '1px solid rgba(212, 175, 55, 0.15)',
          borderRadius: 8,
        }}
      />
    </div>
  );
}
