import { useEffect, useState } from 'react';
import { Table, Button, Form, Input, Modal, Message, Space, Popconfirm, Switch, DatePicker, InputNumber, Tag } from '@arco-design/web-react';
import { IconPlus, IconEdit, IconDelete } from '@arco-design/web-react/icon';
import api from '../utils/api';
import dayjs from 'dayjs';

export default function Coupons() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchCoupons = async () => {
    setLoading(true);
    try {
      const res = await api.get('/coupons/admin');
      const items = Array.isArray(res.data) ? res.data : res.data.items || [];
      setData(items);
    } catch (err: any) {
      console.error(err);
      Message.error('加载优惠券失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCoupons();
  }, []);

  const showModal = (record?: any) => {
    setVisible(true);
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue({
        code: record.code,
        discountAmount: record.discountAmount,
        minOrderAmount: record.minOrderAmount,
        expiresAt: dayjs(record.expiresAt),
        isActive: record.isActive,
      });
    } else {
      setEditingId(null);
      form.resetFields();
      form.setFieldsValue({
        isActive: true,
        minOrderAmount: 0,
      });
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validate();
      const payload = {
        ...values,
        expiresAt: values.expiresAt ? dayjs(values.expiresAt).toISOString() : null,
      };

      if (editingId) {
        await api.put(`/coupons/admin/${editingId}`, payload);
        Message.success('更新优惠券成功');
      } else {
        await api.post('/coupons/admin', payload);
        Message.success('创建优惠券成功');
      }
      setVisible(false);
      fetchCoupons();
    } catch (err: any) {
      console.error(err);
      Message.error(err.response?.data?.message || '操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/coupons/admin/${id}`);
      Message.success('删除优惠券成功');
      fetchCoupons();
    } catch (err: any) {
      console.error(err);
      Message.error(err.response?.data?.message || '删除失败');
    }
  };

  const handleToggleStatus = async (record: any, checked: boolean) => {
    try {
      await api.put(`/coupons/admin/${record.id}`, { isActive: checked });
      Message.success(`${checked ? '开启' : '下架'}优惠券成功`);
      fetchCoupons();
    } catch (err: any) {
      console.error(err);
      Message.error('更新状态失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 60,
    },
    {
      title: '优惠券代码 (Code)',
      dataIndex: 'code',
      render: (text: string) => <Tag color='gold' style={{ fontWeight: 'bold' }}>{text}</Tag>,
    },
    {
      title: '面额 (Discount)',
      dataIndex: 'discountAmount',
      render: (val: number) => <strong style={{ color: '#d2b48c' }}>${Number(val).toFixed(2)}</strong>,
    },
    {
      title: '最低起用金额 (Min Subtotal)',
      dataIndex: 'minOrderAmount',
      render: (val: number) => <span>${Number(val || 0).toFixed(2)}</span>,
    },
    {
      title: '截止有效期 (Expiry)',
      dataIndex: 'expiresAt',
      render: (text: string) => <span>{new Date(text).toLocaleString()}</span>,
    },
    {
      title: '领取次数 (Claims)',
      dataIndex: '_count.userCoupons',
      render: (val: number) => <span style={{ fontWeight: '600' }}>{val || 0} 次</span>,
    },
    {
      title: '开启状态',
      dataIndex: 'isActive',
      width: 100,
      render: (val: boolean, record: any) => (
        <Switch
          checked={val}
          onChange={(checked) => handleToggleStatus(record, checked)}
        />
      ),
    },
    {
      title: '操作',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type='text'
            size='small'
            icon={<IconEdit />}
            onClick={() => showModal(record)}
          >
            编辑
          </Button>
          <Popconfirm
            title='确定要删除该优惠券吗？'
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
          <h2 style={{ margin: 0, fontSize: 24 }}>
            促销优惠券管理
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-3)' }}>
            创建、开启、编辑与下架商城促销折价优惠券。
          </p>
        </div>
        <Button
          type='primary'
          icon={<IconPlus />}
          onClick={() => showModal()}
        >
          添加优惠券
        </Button>
      </div>

      <Table
        loading={loading}
        columns={columns}
        data={data}
        rowKey='id'
      />

      <Modal
        title={editingId ? '编辑优惠券' : '添加优惠券'}
        visible={visible}
        onOk={handleOk}
        onCancel={() => setVisible(false)}
        autoFocus={false}
        focusLock={true}
      >
        <Form form={form} layout='vertical'>
          <Form.Item
            label='优惠券代码 (唯一标识，如 WELCOME10)'
            field='code'
            rules={[{ required: true, message: '请输入券码' }]}
          >
            <Input placeholder='输入券码，如 SAVE20' style={{ textTransform: 'uppercase' }} />
          </Form.Item>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Form.Item
              label='折扣面额 (USD)'
              field='discountAmount'
              rules={[{ required: true, message: '请输入折扣金额' }]}
            >
              <InputNumber min={0.01} precision={2} placeholder='10.00' style={{ width: '100%' }} />
            </Form.Item>

            <Form.Item
              label='最低消费起用金额 (无限制填 0)'
              field='minOrderAmount'
              rules={[{ required: true }]}
            >
              <InputNumber min={0} precision={2} placeholder='0.00' style={{ width: '100%' }} />
            </Form.Item>
          </div>

          <Form.Item
            label='截止有效时间'
            field='expiresAt'
            rules={[{ required: true, message: '请选择过期时间' }]}
          >
            <DatePicker showTime style={{ width: '100%' }} />
          </Form.Item>

          <Form.Item label='是否立即开启 (上架)' field='isActive' triggerPropName='checked'>
            <Switch />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
