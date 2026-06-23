import { useEffect, useState, useRef } from 'react';
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
  Collapse,
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

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
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
      setPagination((prev) => ({ ...prev, current: page, total: total || 0 }));
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

  const handleTableChange = (p: any) => fetchProducts(p.current);
  const handleSearch = () => fetchProducts(1, searchQuery, selectedCategory);
  const handleReset = () => {
    setSearchQuery('');
    setSelectedCategory(undefined);
    fetchProducts(1, '', undefined);
  };

  const parseImgStr = (images: any): string => {
    if (Array.isArray(images)) return images.join(', ');
    if (typeof images === 'string') {
      try {
        const parsed = JSON.parse(images);
        return Array.isArray(parsed) ? parsed.join(', ') : images;
      } catch {
        return images;
      }
    }
    return '';
  };

  const showModal = (record?: any) => {
    setVisible(true);
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue({
        nameZh: record.nameZh,
        nameEn: record.nameEn,
        descriptionZh: record.descriptionZh,
        descriptionEn: record.descriptionEn,
        price: parseFloat(record.price),
        stock: record.stock,
        categoryId: record.categoryId,
        imagesStr: parseImgStr(record.images),
        materialZh: record.materialZh || '',
        materialEn: record.materialEn || '',
        originZh: record.originZh || '',
        originEn: record.originEn || '',
        purificationZh: record.purificationZh || '',
        purificationEn: record.purificationEn || '',
        benefitsZh: record.benefitsZh || '',
        benefitsEn: record.benefitsEn || '',
        specWeight: record.specWeight || '',
        specBeadSize: record.specBeadSize || '',
        specBeadCount: record.specBeadCount || '',
        ratingOverride: record.ratingOverride !== null && record.ratingOverride !== undefined ? parseFloat(record.ratingOverride) : undefined,
        salesOverride: record.salesOverride !== null && record.salesOverride !== undefined ? record.salesOverride : undefined,
      });
    } else {
      setEditingId(null);
      form.resetFields();
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validate();
      const imgArray = values.imagesStr
        ? values.imagesStr.split(',').map((img: string) => img.trim()).filter(Boolean)
        : [];

      const payload: Record<string, any> = {
        nameZh: values.nameZh,
        nameEn: values.nameEn,
        descriptionZh: values.descriptionZh,
        descriptionEn: values.descriptionEn,
        price: values.price,
        stock: values.stock,
        categoryId: values.categoryId,
        images: imgArray,
      };

      const optionalFields = [
        'materialZh', 'materialEn', 'originZh', 'originEn',
        'purificationZh', 'purificationEn', 'benefitsZh', 'benefitsEn',
        'specWeight', 'specBeadSize', 'specBeadCount',
        'ratingOverride', 'salesOverride',
      ];
      optionalFields.forEach((f) => {
        payload[f] = values[f] !== undefined && values[f] !== '' && values[f] !== null ? values[f] : null;
      });

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
      width: 80,
      render: (images: any) => {
        let url = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=100&auto=format&fit=crop';
        if (Array.isArray(images) && images.length > 0) {
          url = images[0];
        } else if (typeof images === 'string') {
          try {
            const parsed = JSON.parse(images);
            if (Array.isArray(parsed) && parsed.length > 0) url = parsed[0];
          } catch { url = images; }
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
    { title: '分类', dataIndex: 'category', render: (cat: any) => cat?.nameZh || '未分类' },
    {
      title: '材质',
      dataIndex: 'materialZh',
      render: (val: string) =>
        val
          ? <span style={{ fontSize: 12 }}>{val}</span>
          : <span style={{ color: 'var(--color-text-4)', fontSize: 12 }}>—</span>,
    },
    {
      title: '价格',
      dataIndex: 'price',
      width: 100,
      render: (val: any) => <span style={{ fontWeight: 'bold' }}>¥{parseFloat(val).toFixed(2)}</span>,
    },
    {
      title: '库存',
      dataIndex: 'stock',
      width: 80,
      render: (val: number) => (
        <span style={{ color: val < 25 ? 'var(--color-danger-6)' : 'var(--color-success-6)', fontWeight: 'bold' }}>
          {val}
        </span>
      ),
    },
    {
      title: '操作',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button type='text' size='small' icon={<IconEdit />} onClick={() => showModal(record)}>编辑</Button>
          <Popconfirm title='确定要删除该商品吗？' onOk={() => handleDelete(record.id)} okText='确定' cancelText='取消'>
            <Button type='text' size='small' status='danger' icon={<IconDelete />}>删除</Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <h2 style={{ margin: 0, fontSize: 24 }}>商品库存管理</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-3)' }}>
            列出、更新和管理店铺内的精致手串、吊坠及各类经典配饰。
          </p>
        </div>
        <Button type='primary' icon={<IconPlus />} onClick={() => showModal()}>添加商品</Button>
      </div>

      {/* Filter Bar */}
      <div style={{ padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid var(--color-border)', display: 'flex', gap: 16, alignItems: 'center' }}>
        <Input
          prefix={<IconSearch />}
          placeholder='搜索商品...'
          value={searchQuery}
          onChange={setSearchQuery}
          onPressEnter={handleSearch}
          style={{ width: 250 }}
        />
        <Select placeholder='过滤分类' value={selectedCategory} onChange={setSelectedCategory} style={{ width: 200 }} allowClear>
          {categories.map((cat: any) => (
            <Select.Option key={cat.id} value={cat.id}>{cat.nameZh}</Select.Option>
          ))}
        </Select>
        <Button type='primary' onClick={handleSearch}>搜索</Button>
        <Button type='secondary' onClick={handleReset}>重置</Button>
      </div>

      <Table
        rowKey='id'
        loading={loading}
        columns={columns}
        data={data}
        pagination={{ current: pagination.current, pageSize: pagination.pageSize, total: pagination.total, showTotal: true }}
        onChange={handleTableChange}
      />

      <Modal
        title={editingId ? '编辑商品' : '创建商品'}
        visible={visible}
        onOk={handleOk}
        onCancel={() => setVisible(false)}
        style={{ width: 720 }}
        okText='保存'
        cancelText='取消'
      >
        <Form form={form} layout='vertical' style={{ padding: '8px 0' }}>
          {/* ── 基础信息 ── */}
          <Grid.Row gutter={16}>
            <Grid.Col span={12}>
              <Form.Item label='中文名称' field='nameZh' rules={[{ required: true, message: '请输入中文名称' }]}>
                <Input placeholder='例如：五行合香珠手串' />
              </Form.Item>
            </Grid.Col>
            <Grid.Col span={12}>
              <Form.Item label='英文名称' field='nameEn' rules={[{ required: true, message: '请输入英文名称' }]}>
                <Input placeholder='e.g. Five Elements Incense Beads' />
              </Form.Item>
            </Grid.Col>
          </Grid.Row>

          <Grid.Row gutter={16}>
            <Grid.Col span={8}>
              <Form.Item label='价格 (¥)' field='price' rules={[{ required: true, message: '请输入价格' }]}>
                <InputNumber min={0.01} step={1} style={{ width: '100%' }} />
              </Form.Item>
            </Grid.Col>
            <Grid.Col span={8}>
              <Form.Item label='库存数量' field='stock' rules={[{ required: true, message: '请输入库存' }]}>
                <InputNumber min={0} step={1} style={{ width: '100%' }} />
              </Form.Item>
            </Grid.Col>
            <Grid.Col span={8}>
              <Form.Item label='所属分类' field='categoryId' rules={[{ required: true, message: '请选择分类' }]}>
                <Select placeholder='选择分类'>
                  {categories.map((cat: any) => (
                    <Select.Option key={cat.id} value={cat.id}>{cat.nameZh}</Select.Option>
                  ))}
                </Select>
              </Form.Item>
            </Grid.Col>
          </Grid.Row>

          <Form.Item label='图片链接 (逗号分隔)' field='imagesStr' rules={[{ required: true, message: '请输入至少一张图片链接' }]}>
            <Input.TextArea placeholder='例如：https://example.com/img1.jpg, https://example.com/img2.jpg' rows={2} style={{ resize: 'none' }} />
          </Form.Item>

          <Grid.Row gutter={16}>
            <Grid.Col span={12}>
              <Form.Item label='中文描述' field='descriptionZh' rules={[{ required: true, message: '请输入中文描述' }]}>
                <RichTextEditor />
              </Form.Item>
            </Grid.Col>
            <Grid.Col span={12}>
              <Form.Item label='英文描述' field='descriptionEn' rules={[{ required: true, message: '请输入英文描述' }]}>
                <RichTextEditor />
              </Form.Item>
            </Grid.Col>
          </Grid.Row>

          {/* ── 扩展字段（折叠面板）── */}
          <Collapse style={{ marginTop: 8 }} bordered={false}>
            <Collapse.Item header='📦 材质与产地（选填）' name='origin'>
              <Grid.Row gutter={16}>
                <Grid.Col span={12}>
                  <Form.Item label='材质（中文）' field='materialZh'>
                    <Input placeholder='例如：天然红玛瑙' />
                  </Form.Item>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Form.Item label='材质（英文）' field='materialEn'>
                    <Input placeholder='e.g. Natural Red Agate' />
                  </Form.Item>
                </Grid.Col>
              </Grid.Row>
              <Grid.Row gutter={16}>
                <Grid.Col span={12}>
                  <Form.Item label='产地（中文）' field='originZh'>
                    <Input placeholder='例如：云南省腾冲市' />
                  </Form.Item>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Form.Item label='产地（英文）' field='originEn'>
                    <Input placeholder='e.g. Tengchong, Yunnan, China' />
                  </Form.Item>
                </Grid.Col>
              </Grid.Row>
            </Collapse.Item>

            <Collapse.Item header='✨ 材质与设计（选填）' name='benefits'>
              <Form.Item label='材质与设计（中文）' field='benefitsZh'>
                <Input.TextArea placeholder='请输入中文材质与设计说明，可包含材质特性与设计细节...' rows={4} style={{ resize: 'none' }} />
              </Form.Item>
              <Form.Item label='材质与设计（英文）' field='benefitsEn'>
                <Input.TextArea placeholder='Describe the materials and design details in English...' rows={4} style={{ resize: 'none' }} />
              </Form.Item>
            </Collapse.Item>

            <Collapse.Item header='🔮 清洁保养方式（选填）' name='purification'>
              <Grid.Row gutter={16}>
                <Grid.Col span={12}>
                  <Form.Item label='清洁保养（中文）' field='purificationZh'>
                    <Input.TextArea placeholder='例如：声波清洗，手工擦拭保养...' rows={3} style={{ resize: 'none' }} />
                  </Form.Item>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Form.Item label='清洁保养（英文）' field='purificationEn'>
                    <Input.TextArea placeholder='e.g. Ultrasonic cleaned, hand polished...' rows={3} style={{ resize: 'none' }} />
                  </Form.Item>
                </Grid.Col>
              </Grid.Row>
            </Collapse.Item>

            <Collapse.Item header='📐 规格参数（选填）' name='specs'>
              <Grid.Row gutter={16}>
                <Grid.Col span={8}>
                  <Form.Item label='珠径' field='specBeadSize'>
                    <Input placeholder='例如：8mm' />
                  </Form.Item>
                </Grid.Col>
                <Grid.Col span={8}>
                  <Form.Item label='珠数' field='specBeadCount'>
                    <Input placeholder='例如：18颗' />
                  </Form.Item>
                </Grid.Col>
                <Grid.Col span={8}>
                  <Form.Item label='重量' field='specWeight'>
                    <Input placeholder='例如：约15g' />
                  </Form.Item>
                </Grid.Col>
              </Grid.Row>
            </Collapse.Item>

            <Collapse.Item header='⭐ 评分与销量人工干预（选填）' name='overrides'>
              <Grid.Row gutter={16}>
                <Grid.Col span={12}>
                  <Form.Item label='人工干预评分 (1.0 - 5.0)' field='ratingOverride'>
                    <InputNumber min={1.0} max={5.0} step={0.1} placeholder='留空则根据真实买家评价自动计算' style={{ width: '100%' }} />
                  </Form.Item>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Form.Item label='人工干预买家数' field='salesOverride'>
                    <InputNumber min={0} step={1} placeholder='留空则按真实买家评价数量统计' style={{ width: '100%' }} />
                  </Form.Item>
                </Grid.Col>
              </Grid.Row>
            </Collapse.Item>
          </Collapse>
        </Form>
      </Modal>
    </div>
  );
}

function RichTextEditor({ value = '', onChange }: { value?: string; onChange?: (val: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  const handleCommand = (command: string, arg: string = '') => {
    document.execCommand(command, false, arg);
  };

  const handleUploadClick = (type: 'image' | 'video') => {
    setMediaType(type);
    setTimeout(() => {
      fileInputRef.current?.click();
    }, 50);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      const fileUrl = res.data.url;
      
      editorRef.current?.focus();
      
      if (mediaType === 'image') {
        document.execCommand('insertImage', false, fileUrl);
      } else {
        const videoHtml = `<video src="${fileUrl}" controls style="max-width: 100%; border-radius: 8px; margin: 8px 0;" controlsList="nodownload"></video><p><br></p>`;
        document.execCommand('insertHTML', false, videoHtml);
      }
      
      if (editorRef.current && onChange) {
        onChange(editorRef.current.innerHTML);
      }
    } catch (err) {
      console.error('Upload failed', err);
      Message.error('上传文件失败');
    }
    
    e.target.value = '';
  };

  const onBlur = () => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  };

  return (
    <div style={{ border: '1px solid var(--color-border)', borderRadius: 8, overflow: 'hidden', width: '100%' }}>
      {/* Toolbar */}
      <div style={{ background: 'var(--color-fill-2)', borderBottom: '1px solid var(--color-border)', padding: '4px 8px', display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        <Button size='mini' type='secondary' onClick={() => handleCommand('bold')} style={{ fontWeight: 'bold' }}>B</Button>
        <Button size='mini' type='secondary' onClick={() => handleCommand('italic')} style={{ fontStyle: 'italic' }}>I</Button>
        <Button size='mini' type='secondary' onClick={() => handleCommand('underline')} style={{ textDecoration: 'underline' }}>U</Button>
        <Button size='mini' type='secondary' onClick={() => handleCommand('justifyLeft')}>左</Button>
        <Button size='mini' type='secondary' onClick={() => handleCommand('justifyCenter')}>中</Button>
        <Button size='mini' type='secondary' onClick={() => handleCommand('justifyRight')}>右</Button>
        <Button size='mini' type='secondary' onClick={() => handleCommand('insertHorizontalRule')}>分割线</Button>
        <Button size='mini' type='secondary' onClick={() => handleUploadClick('image')}>图片</Button>
        <Button size='mini' type='secondary' onClick={() => handleUploadClick('video')}>视频</Button>
        <input
          type='file'
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept={mediaType === 'image' ? 'image/*' : 'video/*'}
          onChange={handleFileChange}
        />
      </div>
      {/* Editor Content Area */}
      <div
        ref={editorRef}
        contentEditable
        onBlur={onBlur}
        onInput={() => {
          if (editorRef.current && onChange) {
            onChange(editorRef.current.innerHTML);
          }
        }}
        dangerouslySetInnerHTML={{ __html: value }}
        style={{
          minHeight: 120,
          padding: '8px 12px',
          background: 'var(--color-bg-2)',
          outline: 'none',
          maxHeight: 300,
          overflowY: 'auto',
          color: 'var(--color-text-1)',
        }}
      />
    </div>
  );
}
