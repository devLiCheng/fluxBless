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
      // Backend returns either array directly or { items, total }
      const items = Array.isArray(res.data) ? res.data : res.data.items || [];
      setData(items);
    } catch (err: any) {
      console.error(err);
      Message.error('Failed to load categories');
    } finally {
      setLoading(true); // Wait, should be false!
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
        Message.success('Category updated successfully');
      } else {
        await api.post('/categories', values);
        Message.success('Category created successfully');
      }
      setVisible(false);
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      Message.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/categories/${id}`);
      Message.success('Category deleted successfully');
      fetchCategories();
    } catch (err: any) {
      console.error(err);
      Message.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 80,
    },
    {
      title: 'Name (Chinese)',
      dataIndex: 'nameZh',
      render: (text: string) => <strong style={{ color: '#D4AF37' }}>{text}</strong>,
    },
    {
      title: 'Name (English)',
      dataIndex: 'nameEn',
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      render: (text: string) => <code style={{ color: '#fff' }}>{text}</code>,
    },
    {
      title: 'Description',
      dataIndex: 'description',
    },
    {
      title: 'Actions',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button
            type='text'
            size='small'
            icon={<IconEdit />}
            onClick={() => showModal(record)}
            style={{ color: '#D4AF37' }}
          >
            Edit
          </Button>
          <Popconfirm
            title='Are you sure to delete this category?'
            onOk={() => handleDelete(record.id)}
            okText='Yes'
            cancelText='No'
          >
            <Button
              type='text'
              size='small'
              status='danger'
              icon={<IconDelete />}
            >
              Delete
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, color: '#D4AF37', fontFamily: 'serif', fontSize: 28, letterSpacing: 1.5 }}>
            Accessory Categories
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#c5a059' }}>
            Manage classifications for spiritual accessories.
          </p>
        </div>
        <Button
          type='primary'
          icon={<IconPlus />}
          onClick={() => showModal()}
          style={{
            marginLeft: 'auto',
            background: 'linear-gradient(135deg, #AA7C11 0%, #D4AF37 50%, #F3E5AB 100%)',
            border: 'none',
            color: '#000',
            fontWeight: 'bold',
          }}
        >
          Add Category
        </Button>
      </div>

      <Table
        rowKey='id'
        loading={loading}
        columns={columns}
        data={data}
        style={{
          background: '#1a1a1a',
          border: '1px solid rgba(212, 175, 55, 0.15)',
          borderRadius: 8,
        }}
      />

      <Modal
        title={editingId ? 'Edit Category' : 'Create Category'}
        visible={visible}
        onOk={handleOk}
        onCancel={() => setVisible(false)}
        style={{ background: '#1a1a1a', border: '1px solid rgba(212, 175, 55, 0.2)' }}
      >
        <Form
          form={form}
          layout='vertical'
          style={{ padding: '10px 0' }}
        >
          <Form.Item
            label='Chinese Name'
            field='nameZh'
            rules={[{ required: true, message: 'Please input Chinese name' }]}
          >
            <Input placeholder='e.g., 琉璃手串' style={{ background: '#222', color: '#fff', border: '1px solid #333' }} />
          </Form.Item>
          <Form.Item
            label='English Name'
            field='nameEn'
            rules={[{ required: true, message: 'Please input English name' }]}
          >
            <Input placeholder='e.g., Colored Glaze Bracelets' style={{ background: '#222', color: '#fff', border: '1px solid #333' }} />
          </Form.Item>
          <Form.Item
            label='Slug'
            field='slug'
            rules={[{ required: true, message: 'Please input slug' }]}
          >
            <Input placeholder='e.g., colored-glaze-bracelets' style={{ background: '#222', color: '#fff', border: '1px solid #333' }} />
          </Form.Item>
          <Form.Item label='Description' field='description'>
            <Input.TextArea placeholder='Category description' rows={3} style={{ background: '#222', color: '#fff', border: '1px solid #333', resize: 'none' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
