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
      console.error('加载分类下拉菜单失败', err);
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
      Message.error('加载商品失败');
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
        Message.success('更新商品成功');
      } else {
        await api.post('/products', payload);
        Message.success('创建商品成功');
      }
      setVisible(false);
      fetchProducts(pagination.current);
    } catch (err: any) {
      console.error(err);
      Message.error(err.response?.data?.message || '操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/products/${id}`);
      Message.success('删除商品成功');
      fetchProducts(pagination.current);
    } catch (err: any) {
      console.error(err);
      Message.error(err.response?.data?.message || '删除失败');
    }
  };

  const columns = [
    {
      title: '缩略图',
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
          <Avatar shape='square' size={48}>
            <img src={url} alt='商品缩略图' style={{ objectFit: 'cover' }} />
          </Avatar>
        );
      },
    },
    {
      title: '商品名称',
      render: (_: any, record: any) => (
        <div>
          <strong>{record.nameZh}</strong>
          <div style={{ color: 'var(--color-text-3)', fontSize: 12 }}>{record.nameEn}</div>
        </div>
      ),
    },
    {
      title: '分类',
      dataIndex: 'category',
      render: (cat: any) => cat?.nameZh || '未分类',
    },
    {
      title: '价格',
      dataIndex: 'price',
      width: 100,
      render: (val: any) => <span style={{ fontWeight: 'bold' }}>${parseFloat(val).toFixed(2)}</span>,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      width: 100,
      render: (val: number) => (
        <span style={{ color: val < 25 ? 'var(--color-danger-6)' : 'var(--color-success-6)', fontWeight: 'bold' }}>{val}</span>
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
            title='确定要删除该商品吗？'
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
            商品库存管理
          </h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-3)' }}>
            列出、更新和管理店铺内的开运手串、吊坠及各类能量配饰。
          </p>
        </div>
        <Button
          type='primary'
          icon={<IconPlus />}
          onClick={() => showModal()}
        >
          添加商品
        </Button>
      </div>

      {/* Filter and Search Bar */}
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
        <Input
          prefix={<IconSearch />}
          placeholder='搜索商品...'
          value={searchQuery}
          onChange={setSearchQuery}
          onPressEnter={handleSearch}
          style={{ width: 250 }}
        />
        <Select
          placeholder='过滤分类'
          value={selectedCategory}
          onChange={setSelectedCategory}
          style={{ width: 200 }}
          allowClear
        >
          {categories.map((cat: any) => (
            <Select.Option key={cat.id} value={cat.id}>
              {cat.nameZh}
            </Select.Option>
          ))}
        </Select>
        <Button
          type='primary'
          onClick={handleSearch}
        >
          搜索
        </Button>
        <Button type='secondary' onClick={handleReset}>
          重置
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
      />

      <Modal
        title={editingId ? '编辑商品' : '创建商品'}
        visible={visible}
        onOk={handleOk}
        onCancel={() => setVisible(false)}
        style={{ width: 650 }}
      >
        <Form
          form={form}
          layout='vertical'
          style={{ padding: '10px 0' }}
        >
          <Grid.Row gutter={16}>
            <Grid.Col span={12}>
              <Form.Item
                label='中文名称'
                field='nameZh'
                rules={[{ required: true, message: '请输入中文名称' }]}
              >
                <Input placeholder='例如：五行合香珠手串' />
              </Form.Item>
            </Grid.Col>
            <Grid.Col span={12}>
              <Form.Item
                label='英文名称'
                field='nameEn'
                rules={[{ required: true, message: '请输入英文名称' }]}
              >
                <Input placeholder='例如：Five Elements Incense Beads' />
              </Form.Item>
            </Grid.Col>
          </Grid.Row>

          <Grid.Row gutter={16}>
            <Grid.Col span={8}>
              <Form.Item
                label='价格 ($)'
                field='price'
                rules={[{ required: true, message: '请输入价格' }]}
              >
                <InputNumber min={0.01} step={1} style={{ width: '100%' }} />
              </Form.Item>
            </Grid.Col>
            <Grid.Col span={8}>
              <Form.Item
                label='库存数量'
                field='stock'
                rules={[{ required: true, message: '请输入库存数量' }]}
              >
                <InputNumber min={0} step={1} style={{ width: '100%' }} />
              </Form.Item>
            </Grid.Col>
            <Grid.Col span={8}>
              <Form.Item
                label='所属分类'
                field='categoryId'
                rules={[{ required: true, message: '请选择分类' }]}
              >
                <Select placeholder='选择分类'>
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
            label='图片链接 (逗号分隔)'
            field='imagesStr'
            rules={[{ required: true, message: '请输入至少一张图片链接' }]}
          >
            <Input.TextArea
              placeholder='例如：/products/red-agate-1.jpg, /products/red-agate-2.jpg'
              rows={2}
              style={{ resize: 'none' }}
            />
          </Form.Item>

          <Form.Item
            label='中文描述'
            field='descriptionZh'
            rules={[{ required: true, message: '请输入中文描述' }]}
          >
            <Input.TextArea placeholder='请输入商品中文描述和开运寓意详情' rows={3} style={{ resize: 'none' }} />
          </Form.Item>

          <Form.Item
            label='英文描述'
            field='descriptionEn'
            rules={[{ required: true, message: '请输入英文描述' }]}
          >
            <Input.TextArea placeholder='请输入商品英文描述和开运寓意详情' rows={3} style={{ resize: 'none' }} />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
