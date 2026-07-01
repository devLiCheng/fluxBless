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
  Upload,
} from '@arco-design/web-react';
import { IconPlus, IconEdit, IconDelete, IconSearch, IconEye, IconPlayArrow } from '@arco-design/web-react/icon';
import api from '../utils/api';

const getFullImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  // Relative URL like /api/uploads/...
  const apiBase = api.defaults.baseURL || '';
  if (apiBase.startsWith('http')) {
    const origin = new URL(apiBase).origin;
    return `${origin}${url}`;
  }
  return url;
};

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

  const [fileList, setFileList] = useState<any[]>([]);
  const [externalUrl, setExternalUrl] = useState('');

  const [previewVisible, setPreviewVisible] = useState(false);
  const [previewUrl, setPreviewUrl] = useState('');
  const [previewType, setPreviewType] = useState<'image' | 'video'>('image');

  const handlePreview = (file: any) => {
    const url = file.url || (file.response && file.response.url);
    if (!url) return;
    setPreviewUrl(url);
    const isVideo = url.match(/\.(mp4|webm|ogg|mov)$/i) || (url.includes('/uploads/') && !url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i));
    setPreviewType(isVideo ? 'video' : 'image');
    setPreviewVisible(true);
  };

  const customRequest = async (option: any) => {
    const { file, onProgress, onSuccess, onError } = option;
    const formData = new FormData();
    formData.append('file', file);
    try {
      const res = await api.post('/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        onUploadProgress: (event) => {
          let percent = 0;
          if (event.total && event.total > 0) {
            percent = Math.round((event.loaded / event.total) * 100);
          }
          onProgress(percent, event);
        },
      });
      onSuccess(res.data);
    } catch (err) {
      onError(err);
    }
  };

  const handleAddExternalUrl = () => {
    if (!externalUrl.trim()) return;
    const newFile = {
      uid: String(Date.now()),
      name: `external-image-${Date.now()}`,
      status: 'done' as const,
      url: externalUrl.trim(),
    };
    setFileList((prev) => [...prev, newFile]);
    setExternalUrl('');
    Message.success('成功添加网络图片');
  };

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
      let url = `/products?page=${page}&limit=${pagination.pageSize}&isAdmin=true`;
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
        specWristSizeZh: record.specWristSizeZh || '',
        specWristSizeEn: record.specWristSizeEn || '',
        sizingDescZh: record.sizingDescZh || '',
        sizingDescEn: record.sizingDescEn || '',
        purchaseUrl: record.purchaseUrl || '',
        tagsZh: record.tagsZh || '',
        tagsEn: record.tagsEn || '',
      });
      let imgs: string[] = [];
      if (Array.isArray(record.images)) {
        imgs = record.images;
      } else if (typeof record.images === 'string') {
        try {
          const parsed = JSON.parse(record.images);
          if (Array.isArray(parsed)) imgs = parsed;
        } catch {
          if (record.images) imgs = [record.images];
        }
      }
      const initialFiles = imgs.map((url: string, index: number) => ({
        uid: String(-index - 1),
        name: `image-${index + 1}`,
        status: 'done' as const,
        url: url,
      }));
      setFileList(initialFiles);
    } else {
      setEditingId(null);
      form.resetFields();
      setFileList([]);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validate();
      const imgArray = fileList
        .map((file) => {
          if (file.response && file.response.url) {
            return file.response.url;
          }
          return file.url;
        })
        .filter(Boolean);

      if (imgArray.length === 0) {
        Message.error('请至少上传或添加一张商品图片');
        return;
      }

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
        'specWristSizeZh', 'specWristSizeEn', 'sizingDescZh', 'sizingDescEn',
        'purchaseUrl', 'tagsZh', 'tagsEn', 'ratingOverride', 'salesOverride',
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
        let list: string[] = [];
        if (Array.isArray(images)) {
          list = images;
        } else if (typeof images === 'string') {
          try {
            const parsed = JSON.parse(images);
            if (Array.isArray(parsed)) list = parsed;
          } catch {
            if (images) list = [images];
          }
        }
        
        const isVideoUrl = (url: string) => url && (url.match(/\.(mp4|webm|ogg|mov)$/i) || (url.includes('/uploads/') && !url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)));
        const firstImage = list.find((url) => !isVideoUrl(url)) || list[0];
        
        let url = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=100&auto=format&fit=crop';
        if (firstImage) {
          url = getFullImageUrl(firstImage);
        }
        
        const isVideo = isVideoUrl(url);
        
        return (
          <Avatar shape='square' size={48} style={{ background: '#000' }}>
            {isVideo ? (
              <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <img src={url} alt='商品缩略图' style={{ objectFit: 'cover' }} />
            )}
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

          <Form.Item label='采购来源网址 (URL)' field='purchaseUrl'>
            <Input placeholder='例如：https://detail.1688.com/offer/12345678.html' />
          </Form.Item>

          <Grid.Row gutter={16}>
            <Grid.Col span={12}>
              <Form.Item label='商品标签 (中文，英文逗号隔开)' field='tagsZh'>
                <Input placeholder='例如：手工甄选,最新上货' />
              </Form.Item>
            </Grid.Col>
            <Grid.Col span={12}>
              <Form.Item label='商品标签 (英文，英文逗号隔开)' field='tagsEn'>
                <Input placeholder='e.g. Premium Selected,New Arrival' />
              </Form.Item>
            </Grid.Col>
          </Grid.Row>

          <Form.Item label='商品图片与视频 (支持 mp4 等视频格式)' required>
            <Upload
              listType='picture-card'
              multiple
              fileList={fileList}
              onChange={setFileList}
              customRequest={customRequest}
              onPreview={handlePreview}
              renderUploadItem={(originNode, file) => {
                const url = file.url || (file.response && (file.response as any).url);
                const isVideo = url && (url.match(/\.(mp4|webm|ogg|mov)$/i) || (url.includes('/uploads/') && !url.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)));
                if (isVideo) {
                  return (
                    <div 
                      className="arco-upload-list-item arco-upload-list-item-done" 
                      style={{ 
                        position: 'relative', 
                        width: 112, 
                        height: 112, 
                        borderRadius: 4, 
                        overflow: 'hidden', 
                        border: '1px solid var(--color-border)',
                        background: '#000',
                        marginRight: 8,
                        marginBottom: 8,
                        display: 'inline-block'
                      }}
                    >
                      <video src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
                        <IconPlayArrow style={{ fontSize: 24, color: 'rgba(255,255,255,0.8)', filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.5))' }} />
                      </div>
                      <div 
                        className="media-overlay" 
                        style={{
                          position: 'absolute',
                          inset: 0,
                          background: 'rgba(0,0,0,0.6)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: 16,
                          opacity: 0,
                          transition: 'opacity 0.2s',
                          color: '#fff',
                          pointerEvents: 'auto'
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.opacity = '1'; }}
                        onMouseLeave={(e) => { e.currentTarget.style.opacity = '0'; }}
                      >
                        <IconEye style={{ cursor: 'pointer', fontSize: 18 }} onClick={() => handlePreview(file)} />
                        <IconDelete style={{ cursor: 'pointer', fontSize: 18 }} onClick={() => {
                          setFileList((prev) => prev.filter((f) => f.uid !== file.uid));
                        }} />
                      </div>
                    </div>
                  );
                }
                return originNode;
              }}
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Input
                placeholder='输入外部图片或视频链接 (支持 mp4 等格式)'
                value={externalUrl}
                onChange={setExternalUrl}
              />
              <Button type='secondary' onClick={handleAddExternalUrl}>添加链接</Button>
            </div>
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
              <Grid.Row gutter={16}>
                <Grid.Col span={12}>
                  <Form.Item label='适合手围 (中文)' field='specWristSizeZh'>
                    <Input placeholder='例如：14cm – 18cm' />
                  </Form.Item>
                </Grid.Col>
                <Grid.Col span={12}>
                  <Form.Item label='适合手围 (英文)' field='specWristSizeEn'>
                    <Input placeholder='e.g. 14cm – 18cm' />
                  </Form.Item>
                </Grid.Col>
              </Grid.Row>
              <Form.Item label='尺寸指南说明（中文）' field='sizingDescZh'>
                <Input.TextArea placeholder='请输入中文尺寸指南详细说明...' rows={2} style={{ resize: 'none' }} />
              </Form.Item>
              <Form.Item label='尺寸指南说明（英文）' field='sizingDescEn'>
                <Input.TextArea placeholder='Describe the sizing guide in English...' rows={2} style={{ resize: 'none' }} />
              </Form.Item>
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

      {/* Media Preview Modal */}
      <Modal
        visible={previewVisible}
        footer={null}
        onCancel={() => setPreviewVisible(false)}
        style={{ width: 'auto', maxWidth: '80vw' }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#000', padding: 12 }}>
          {previewType === 'video' ? (
            <video src={previewUrl} controls style={{ maxWidth: '100%', maxHeight: '70vh' }} autoPlay />
          ) : (
            <img src={previewUrl} alt="Preview" style={{ maxWidth: '100%', maxHeight: '70vh' }} />
          )}
        </div>
      </Modal>
    </div>
  );
}

function RichTextEditor({ value = '', onChange }: { value?: string; onChange?: (val: string) => void }) {
  const editorRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  const innerValue = value || '';

  // Synchronize editor innerHTML with the value prop only when changed from outside
  useEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== innerValue) {
        editorRef.current.innerHTML = innerValue;
      }
    }
  }, [innerValue]);

  const handleCommand = (command: string, arg: string = '') => {
    document.execCommand(command, false, arg);
  };

  const handleInsertLink = () => {
    const url = prompt('请输入链接地址 (例如 https://example.com):');
    if (url) {
      document.execCommand('createLink', false, url);
    }
  };

  const handleInsertTable = () => {
    const tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 12px 0;"><thead><tr><th style="border: 1px solid var(--color-border); padding: 8px; background: var(--color-fill-2); font-weight: bold; text-align: left; min-width: 80px;">特征/参数</th><th style="border: 1px solid var(--color-border); padding: 8px; background: var(--color-fill-2); font-weight: bold; text-align: left;">详细说明</th></tr></thead><tbody><tr><td style="border: 1px solid var(--color-border); padding: 8px;">材质说明</td><td style="border: 1px solid var(--color-border); padding: 8px;">说明内容</td></tr><tr><td style="border: 1px solid var(--color-border); padding: 8px;">保养方式</td><td style="border: 1px solid var(--color-border); padding: 8px;">消磁碎石消磁，流水清洁</td></tr></tbody></table><p><br></p>`;
    editorRef.current?.focus();
    document.execCommand('insertHTML', false, tableHtml);
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
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
        const altText = prompt('请输入图片的替代文本 (Alt Text) 用于 SEO / GEO 检索优化:');
        const imgHtml = `<img src="${fileUrl}" alt="${altText || ''}" style="max-width: 100%; border-radius: 8px; margin: 8px 0;" /><p><br></p>`;
        document.execCommand('insertHTML', false, imgHtml);
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
        <Button size='mini' type='secondary' onClick={() => handleCommand('formatBlock', '<h2>')} style={{ fontWeight: 'bold' }}>H2</Button>
        <Button size='mini' type='secondary' onClick={() => handleCommand('formatBlock', '<h3>')} style={{ fontWeight: 'bold' }}>H3</Button>
        <Button size='mini' type='secondary' onClick={() => handleCommand('formatBlock', '<p>')}>正文</Button>
        <Button size='mini' type='secondary' onClick={handleInsertLink}>链接</Button>
        <Button size='mini' type='secondary' onClick={() => handleCommand('justifyLeft')}>左</Button>
        <Button size='mini' type='secondary' onClick={() => handleCommand('justifyCenter')}>中</Button>
        <Button size='mini' type='secondary' onClick={() => handleCommand('justifyRight')}>右</Button>
        <Button size='mini' type='secondary' onClick={handleInsertTable}>表格</Button>
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
