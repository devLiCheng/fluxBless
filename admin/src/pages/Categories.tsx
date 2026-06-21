import { useEffect, useState } from 'react';
import { Table, Button, Form, Input, Modal, Message, Space, Popconfirm } from '@arco-design/web-react';
import { IconPlus, IconEdit, IconDelete } from '@arco-design/web-react/icon';
import api from '../utils/api';

export default function Categories() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const res = await api.get('/categories');
      const items = Array.isArray(res.data) ? res.data : res.data.items || [];
      setData(items);
    } catch (err: any) {
      console.error(err);
      Message.error('加载分类失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const showModal = (record?: any) => {
    setVisible(true);
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue({
        nameZh: record.nameZh,
        nameEn: record.nameEn,
        slug: record.slug,
        description: record.description,
      });
    } else {
      setEditingId(null);
      form.resetFields();
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validate();
      if (editingId) {
        await api.patch(`/categories/${editingId}`, values);
        Message.success('更新分类成功');
      } else {
        await api.post('/categories', values);
        Message.success('创建分类成功');
      }
      setVisible(false);
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      Message.error(err.response?.data?.message || '操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/categories/${id}`);
      Message.success('删除分类成功');
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      Message.error(err.response?.data?.message || '删除失败');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: '分类名称(中文)',
      dataIndex: 'nameZh',
      render: (text: string) => <strong>{text}</strong>,
    },
    {
      title: '分类名称(英文)',
      dataIndex: 'nameEn',
    },
    {
      title: '标识符 (Slug)',
      dataIndex: 'slug',
      render: (text: string) => <code>{text}</code>,
    },
    {
      title: '描述',
      dataIndex: 'description',
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
            title='确定要删除该分类吗？'
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
            商品分类管理
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-3)' }}>
            管理店铺内手串配饰的分类等级。
          </p>
        </div>
        <Button
          type='primary'
          icon={<IconPlus />}
          onClick={() => showModal()}
        >
          添加分类
        </Button>
      </div>

      <Table
        rowKey='id'
        loading={loading}
        columns={columns}
        data={data}
      />

      <Modal
        title={editingId ? '编辑分类' : '创建分类'}
        visible={visible}
        onOk={handleOk}
        onCancel={() => setVisible(false)}
      >
        <Form
          form={form}
          layout='vertical'
          style={{ padding: '10px 0' }}
        >
          <Form.Item
            label='中文名称'
            field='nameZh'
            rules={[{ required: true, message: '请输入中文名称' }]}
          >
            <Input placeholder='例如：琉璃手串' />
          </Form.Item>
          <Form.Item
            label='英文名称'
            field='nameEn'
            rules={[{ required: true, message: '请输入英文名称' }]}
          >
            <Input placeholder='例如：Colored Glaze Bracelets' />
          </Form.Item>
          <Form.Item
            label='标识符'
            field='slug'
            rules={[{ required: true, message: '请输入标识符' }]}
          >
            <Input placeholder='例如：colored-glaze-bracelets' />
          </Form.Item>
          <Form.Item label='分类描述' field='description'>
            <Input.TextArea placeholder='分类描述' rows={3} style={{ resize: 'none' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
