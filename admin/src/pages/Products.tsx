import { useEffect, useState } from 'react';
import {
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Select,
  Modal,
  Message,
  Space,
  Popconfirm,
  Avatar,
  Grid,
} from '@arco-design/web-react';
import { IconPlus, IconEdit, IconDelete, IconSearch } from '@arco-design/web-react/icon';
import api from '../utils/api';

export default function Products() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [categories, setCategories] = useState([]);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);

  // Table pagination and filters
  const [pagination, setPagination] = useState({
    current: 1,
    pageSize: 10,
    total: 0,
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | undefined>(undefined);

  const fetchCategories = async () => {
    try {
      const res = await api.get('/categories');
      const items = Array.isArray(res.data) ? res.data : res.data.items || [];
      setCategories(items);
    } catch (err) {
      console.error('Failed to load categories for select dropdown', err);
    }
  };

  const fetchProducts = async (page = 1, search = searchQuery, catId = selectedCategory) => {
    setLoading(true);
    try {
      let url = `/products?page=${page}&limit=${pagination.pageSize}`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      if (catId) url += `&categoryId=${catId}`;

      const res = await api.get(url);
      const { items, total } = res.data;
      setData(items || []);
      setPagination((prev) => ({
        ...prev,
        current: page,
        total: total || 0,
      }));
    } catch (err: any) {
      console.error(err);
      Message.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  const handleTableChange = (p: any) => {
    fetchProducts(p.current);
  };

  const handleSearch = () => {
    fetchProducts(1, searchQuery, selectedCategory);
  };

  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory(undefined);
    fetchProducts(1, '', undefined);
  };

  const showModal = (record?: any) => {
    setVisible(true);
    if (record) {
      setEditingId(record.id);
      let imgStr = '';
      if (Array.isArray(record.images)) {
        imgStr = record.images.join(', ');
      } else if (typeof record.images === 'string') {
        try {
          const parsed = JSON.parse(record.images);
          imgStr = Array.isArray(parsed) ? parsed.join(', ') : record.images;
        } catch {
          imgStr = record.images;
        }
      }
      form.setFieldsValue({
        nameZh: record.nameZh,
        nameEn: record.nameEn,
        descriptionZh: record.descriptionZh,
        descriptionEn: record.descriptionEn,
        price: parseFloat(record.price),
        stock: record.stock,
        categoryId: record.categoryId,
        imagesStr: imgStr,
      });
    } else {
      setEditingId(null);
      form.resetFields();
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validate();
      
      // Parse imagesStr to array
      const imgArray = values.imagesStr
        ? values.imagesStr.split(',').map((img: string) => img.trim()).filter(Boolean)
        : [];

      const payload = {
        nameZh: values.nameZh,
        nameEn: values.nameEn,
        descriptionZh: values.descriptionZh,
        descriptionEn: values.descriptionEn,
        price: values.price,
        stock: values.stock,
        categoryId: values.categoryId,
        images: imgArray,
      };

      if (editingId) {
        await api.patch(`/products/${editingId}`, payload);
        Message.success('Product updated successfully');
      } else {
        await api.post('/products', payload);
        Message.success('Product created successfully');
      }
      setVisible(false);
      fetchProducts(pagination.current);
    } catch (err: any) {
      console.error(err);
      Message.error(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/products/${id}`);
      Message.success('Product deleted successfully');
      fetchProducts(pagination.current);
    } catch (err: any) {
      console.error(err);
      Message.error(err.response?.data?.message || 'Delete failed');
    }
  };

  const columns = [
    {
      title: 'Thumbnail',
      dataIndex: 'images',
      width: 100,
      render: (images: any) => {
        let url = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=100&auto=format&fit=crop';
        if (Array.isArray(images) && images.length > 0) {
          url = images[0];
        } else if (typeof images === 'string') {
          try {
            const parsed = JSON.parse(images);
            if (Array.isArray(parsed) && parsed.length > 0) {
              url = parsed[0];
            }
          } catch {
            url = images;
          }
        }
        return (
          <Avatar shape='square' size={48} style={{ border: '1px solid rgba(212, 175, 55, 0.2)' }}>
            <img src={url} alt='Product Thumbnail' style={{ objectFit: 'cover' }} />
          </Avatar>
        );
      },
    },
    {
      title: 'Bilingual Name',
      render: (_: any, record: any) => (
        <div>
          <strong style={{ color: '#D4AF37' }}>{record.nameZh}</strong>
          <div style={{ color: '#aaa', fontSize: 12 }}>{record.nameEn}</div>
        </div>
      ),
    },
    {
      title: 'Category',
      dataIndex: 'category',
      render: (cat: any) => cat?.nameZh || 'Uncategorized',
    },
    {
      title: 'Price',
      dataIndex: 'price',
      width: 100,
      render: (val: any) => <span style={{ color: '#fff', fontWeight: 'bold' }}>${parseFloat(val).toFixed(2)}</span>,
    },
    {
      title: 'Stock',
      dataIndex: 'stock',
      width: 100,
      render: (val: number) => (
        <span style={{ color: val < 25 ? '#ff4d4f' : '#52c41a', fontWeight: 'bold' }}>{val}</span>
      ),
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
            title='Are you sure to delete this product?'
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
            Product Inventory
          </h2>
          <p style={{ margin: '4px 0 0 0', color: '#c5a059' }}>
            List, update, and manage spiritual bracelets, necklaces, and accessories.
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
          Add Product
        </Button>
      </div>

      {/* Filter and Search Bar */}
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
        <Input
          prefix={<IconSearch style={{ color: '#AA7C11' }} />}
          placeholder='Search products...'
          value={searchQuery}
          onChange={setSearchQuery}
          onPressEnter={handleSearch}
          style={{ width: 250, background: '#222', border: '1px solid #333', color: '#fff' }}
        />
        <Select
          placeholder='Filter by Category'
          value={selectedCategory}
          onChange={setSelectedCategory}
          style={{ width: 200, background: '#222', border: '1px solid #333', color: '#fff' }}
          allowClear
        >
          {categories.map((cat: any) => (
            <Select.Option key={cat.id} value={cat.id}>
              {cat.nameZh} / {cat.nameEn}
            </Select.Option>
          ))}
        </Select>
        <Button
          type='primary'
          onClick={handleSearch}
          style={{
            background: '#AA7C11',
            borderColor: '#AA7C11',
            color: '#fff',
          }}
        >
          Search
        </Button>
        <Button type='secondary' onClick={handleReset} style={{ border: '1px solid #333', color: '#ccc' }}>
          Reset
        </Button>
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

      <Modal
        title={editingId ? 'Edit Product' : 'Create Product'}
        visible={visible}
        onOk={handleOk}
        onCancel={() => setVisible(false)}
        style={{ width: 650, background: '#1a1a1a', border: '1px solid rgba(212, 175, 55, 0.2)' }}
      >
        <Form
          form={form}
          layout='vertical'
          style={{ padding: '10px 0' }}
        >
          <Grid.Row gutter={16}>
            <Grid.Col span={12}>
              <Form.Item
                label='Chinese Name'
                field='nameZh'
                rules={[{ required: true, message: 'Please input Chinese name' }]}
              >
                <Input placeholder='e.g., 五行合香珠手串' style={{ background: '#222', color: '#fff', border: '1px solid #333' }} />
              </Form.Item>
            </Grid.Col>
            <Grid.Col span={12}>
              <Form.Item
                label='English Name'
                field='nameEn'
                rules={[{ required: true, message: 'Please input English name' }]}
              >
                <Input placeholder='e.g., Five Elements Incense Beads' style={{ background: '#222', color: '#fff', border: '1px solid #333' }} />
              </Form.Item>
            </Grid.Col>
          </Grid.Row>

          <Grid.Row gutter={16}>
            <Grid.Col span={8}>
              <Form.Item
                label='Price ($)'
                field='price'
                rules={[{ required: true, message: 'Please input price' }]}
              >
                <InputNumber min={0.01} step={1} style={{ width: '100%', background: '#222', color: '#fff', border: '1px solid #333' }} />
              </Form.Item>
            </Grid.Col>
            <Grid.Col span={8}>
              <Form.Item
                label='Stock Quantity'
                field='stock'
                rules={[{ required: true, message: 'Please input stock' }]}
              >
                <InputNumber min={0} step={1} style={{ width: '100%', background: '#222', color: '#fff', border: '1px solid #333' }} />
              </Form.Item>
            </Grid.Col>
            <Grid.Col span={8}>
              <Form.Item
                label='Category'
                field='categoryId'
                rules={[{ required: true, message: 'Please select category' }]}
              >
                <Select placeholder='Select Category' style={{ background: '#222', color: '#fff', border: '1px solid #333' }}>
                  {categories.map((cat: any) => (
                    <Select.Option key={cat.id} value={cat.id}>
                      {cat.nameZh}
                    </Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Grid.Col>
          </Grid.Row>

          <Form.Item
            label='Image URLs (comma-separated list)'
            field='imagesStr'
            rules={[{ required: true, message: 'Please input at least one image URL' }]}
          >
            <Input.TextArea
              placeholder='e.g., /products/red-agate-1.jpg, /products/red-agate-2.jpg'
              rows={2}
              style={{ background: '#222', color: '#fff', border: '1px solid #333', resize: 'none' }}
            />
          </Form.Item>

          <Form.Item
            label='Chinese Description'
            field='descriptionZh'
            rules={[{ required: true, message: 'Please input Chinese description' }]}
          >
            <Input.TextArea placeholder='Chinese description of the product and its spiritual details' rows={3} style={{ background: '#222', color: '#fff', border: '1px solid #333', resize: 'none' }} />
          </Form.Item>

          <Form.Item
            label='English Description'
            field='descriptionEn'
            rules={[{ required: true, message: 'Please input English description' }]}
          >
            <Input.TextArea placeholder='English description of the product and its spiritual details' rows={3} style={{ background: '#222', color: '#fff', border: '1px solid #333', resize: 'none' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
