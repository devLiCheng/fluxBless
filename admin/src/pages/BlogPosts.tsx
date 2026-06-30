import { useEffect, useState, useRef } from 'react';
import {
  Table,
  Button,
  Form,
  Input,
  InputNumber,
  Modal,
  Message,
  Space,
  Popconfirm,
  Avatar,
  Grid,
  Switch,
  Upload,
} from '@arco-design/web-react';
import { IconPlus, IconEdit, IconDelete, IconSearch, IconBook } from '@arco-design/web-react/icon';
import api from '../utils/api';

const getFullImageUrl = (url: string) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const apiBase = api.defaults.baseURL || '';
  if (apiBase.startsWith('http')) {
    const origin = new URL(apiBase).origin;
    return `${origin}${url}`;
  }
  return url;
};

export default function BlogPosts() {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [visible, setVisible] = useState(false);
  const [form] = Form.useForm();
  const [editingId, setEditingId] = useState<number | null>(null);

  const [pagination, setPagination] = useState({ current: 1, pageSize: 10, total: 0 });
  const [searchQuery, setSearchQuery] = useState('');

  const [fileList, setFileList] = useState<any[]>([]);
  const [externalUrl, setExternalUrl] = useState('');

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
      name: `external-cover-${Date.now()}`,
      status: 'done' as const,
      url: externalUrl.trim(),
    };
    setFileList([newFile]); // Only one cover image
    setExternalUrl('');
    Message.success('成功添加网络封面图片');
  };

  const fetchBlogPosts = async (page = 1, search = searchQuery) => {
    setLoading(true);
    try {
      let url = `/blog-posts?page=${page}&limit=${pagination.pageSize}&isAdmin=true`;
      if (search) url += `&search=${encodeURIComponent(search)}`;
      const res = await api.get(url);
      const { items, total } = res.data;
      setData(items || []);
      setPagination((prev) => ({ ...prev, current: page, total: total || 0 }));
    } catch (err: any) {
      console.error(err);
      Message.error('加载文章列表失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBlogPosts();
  }, []);

  const handleTableChange = (p: any) => fetchBlogPosts(p.current);
  const handleSearch = () => fetchBlogPosts(1, searchQuery);
  const handleReset = () => {
    setSearchQuery('');
    fetchBlogPosts(1, '');
  };

  const generateSlug = () => {
    const title = form.getFieldValue('titleEn');
    if (!title) {
      Message.warning('请先输入英文标题以生成 Slug');
      return;
    }
    const cleanSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    form.setFieldsValue({ slug: cleanSlug });
    Message.success('已自动生成 Slug');
  };

  const showModal = (record?: any) => {
    setVisible(true);
    if (record) {
      setEditingId(record.id);
      form.setFieldsValue({
        titleZh: record.titleZh,
        titleEn: record.titleEn,
        slug: record.slug,
        summaryZh: record.summaryZh,
        summaryEn: record.summaryEn,
        contentZh: record.contentZh,
        contentEn: record.contentEn,
        author: record.author,
        readTime: record.readTime,
        published: record.published,
      });
      if (record.coverImage) {
        setFileList([
          {
            uid: '-1',
            name: 'cover-image',
            status: 'done',
            url: record.coverImage,
          },
        ]);
      } else {
        setFileList([]);
      }
    } else {
      setEditingId(null);
      form.resetFields();
      form.setFieldsValue({
        author: 'FluxBless',
        readTime: 5,
        published: true,
      });
      setFileList([]);
    }
  };

  const handleOk = async () => {
    try {
      const values = await form.validate();
      const coverUrl = fileList[0]?.response?.url || fileList[0]?.url || null;

      const payload = {
        ...values,
        coverImage: coverUrl,
      };

      if (editingId) {
        await api.put(`/blog-posts/${editingId}`, payload);
        Message.success('更新文章成功');
      } else {
        await api.post('/blog-posts', payload);
        Message.success('创建文章成功');
      }
      setVisible(false);
      fetchBlogPosts(pagination.current);
    } catch (err: any) {
      console.error(err);
      Message.error(err.response?.data?.message || '操作失败');
    }
  };

  const handleDelete = async (id: number) => {
    try {
      await api.delete(`/blog-posts/${id}`);
      Message.success('删除文章成功');
      fetchBlogPosts(pagination.current);
    } catch (err: any) {
      console.error(err);
      Message.error(err.response?.data?.message || '删除失败');
    }
  };

  const columns = [
    {
      title: '封面',
      dataIndex: 'coverImage',
      width: 90,
      render: (url: string) => {
        const cover = url ? getFullImageUrl(url) : '';
        return (
          <Avatar shape='square' size={48}>
            {cover ? <img src={cover} alt='封面' style={{ objectFit: 'cover' }} /> : <IconBook style={{ fontSize: 20 }} />}
          </Avatar>
        );
      },
    },
    {
      title: '文章标题',
      render: (_: any, record: any) => (
        <div>
          <strong>{record.titleZh}</strong>
          <div style={{ color: 'var(--color-text-3)', fontSize: 12 }}>{record.titleEn}</div>
        </div>
      ),
    },
    {
      title: 'Slug',
      dataIndex: 'slug',
      render: (slug: string) => <code>{slug}</code>,
    },
    {
      title: '作者/阅读时间',
      render: (_: any, record: any) => (
        <span style={{ fontSize: 12 }}>
          {record.author} • {record.readTime} 分钟
        </span>
      ),
    },
    {
      title: '发布状态',
      dataIndex: 'published',
      width: 100,
      render: (published: boolean) => (
        <span style={{ color: published ? 'var(--color-success-6)' : 'var(--color-text-4)', fontWeight: 'bold' }}>
          {published ? '已发布' : '草稿'}
        </span>
      ),
    },
    {
      title: '操作',
      width: 150,
      render: (_: any, record: any) => (
        <Space>
          <Button type='text' size='small' icon={<IconEdit />} onClick={() => showModal(record)}>编辑</Button>
          <Popconfirm title='确定要删除该文章吗？' onOk={() => handleDelete(record.id)} okText='确定' cancelText='取消'>
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
          <h2 style={{ margin: 0, fontSize: 24 }}>博客文章管理</h2>
          <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-3)' }}>
            编写、发布和编辑博客文章，提升网站 SEO 检索和 AI 智能检索（GEO）的可见度。
          </p>
        </div>
        <Button type='primary' icon={<IconPlus />} onClick={() => showModal()}>撰写新文章</Button>
      </div>

      {/* Filter Bar */}
      <div style={{ padding: 16, borderRadius: 8, marginBottom: 16, border: '1px solid var(--color-border)', display: 'flex', gap: 16, alignItems: 'center' }}>
        <Input
          prefix={<IconSearch />}
          placeholder='搜索文章标题或摘要...'
          value={searchQuery}
          onChange={setSearchQuery}
          onPressEnter={handleSearch}
          style={{ width: 300 }}
        />
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
        title={editingId ? '编辑文章' : '撰写新文章'}
        visible={visible}
        onOk={handleOk}
        onCancel={() => setVisible(false)}
        style={{ width: 850, top: 40 }}
        okText='保存'
        cancelText='取消'
      >
        <Form form={form} layout='vertical' style={{ padding: '8px 0' }}>
          {/* Title Row */}
          <Grid.Row gutter={16}>
            <Grid.Col span={12}>
              <Form.Item label='中文标题' field='titleZh' rules={[{ required: true, message: '请输入中文标题' }]}>
                <Input placeholder='例如：传统东方配饰的现代风尚' />
              </Form.Item>
            </Grid.Col>
            <Grid.Col span={12}>
              <Form.Item label='英文标题' field='titleEn' rules={[{ required: true, message: '请输入英文标题' }]}>
                <Input placeholder='e.g. Modern Charm of Traditional Eastern Accessories' />
              </Form.Item>
            </Grid.Col>
          </Grid.Row>

          {/* Slug, Author, ReadTime */}
          <Grid.Row gutter={16}>
            <Grid.Col span={10}>
              <Form.Item label='文章 URL 标识符 (Slug)' field='slug' rules={[{ required: true, message: '请输入 Slug' }]}>
                <Input placeholder='例如：modern-charm-of-accessories' />
              </Form.Item>
            </Grid.Col>
            <Grid.Col span={4}>
              <div style={{ marginTop: 29 }}>
                <Button onClick={generateSlug} type='secondary' style={{ width: '100%' }}>生成 Slug</Button>
              </div>
            </Grid.Col>
            <Grid.Col span={5}>
              <Form.Item label='作者' field='author' rules={[{ required: true }]}>
                <Input placeholder='FluxBless' />
              </Form.Item>
            </Grid.Col>
            <Grid.Col span={5}>
              <Form.Item label='预计阅读时间 (分钟)' field='readTime' rules={[{ required: true }]}>
                <InputNumber min={1} style={{ width: '100%' }} />
              </Form.Item>
            </Grid.Col>
          </Grid.Row>

          {/* Summary Row */}
          <Grid.Row gutter={16}>
            <Grid.Col span={12}>
              <Form.Item label='中文摘要' field='summaryZh' rules={[{ required: true, message: '请输入中文摘要' }]}>
                <Input.TextArea placeholder='文章简要摘要说明，用于卡片列表显示...' rows={3} style={{ resize: 'none' }} />
              </Form.Item>
            </Grid.Col>
            <Grid.Col span={12}>
              <Form.Item label='英文摘要' field='summaryEn' rules={[{ required: true, message: '请输入英文摘要' }]}>
                <Input.TextArea placeholder='Brief English summary of the article...' rows={3} style={{ resize: 'none' }} />
              </Form.Item>
            </Grid.Col>
          </Grid.Row>

          {/* Cover Image */}
          <Form.Item label='文章封面图片'>
            <Upload
              listType='picture-card'
              limit={1}
              fileList={fileList}
              onChange={setFileList}
              customRequest={customRequest}
              imagePreview
            />
            <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
              <Input
                placeholder='或输入外部封面图片链接 (例如: https://example.com/cover.jpg)'
                value={externalUrl}
                onChange={setExternalUrl}
              />
              <Button type='secondary' onClick={handleAddExternalUrl}>使用链接</Button>
            </div>
          </Form.Item>

          {/* Published switch */}
          <Form.Item label='是否直接发布文章' field='published' triggerPropName='checked'>
            <Switch checkedText='已发布' uncheckedText='草稿' />
          </Form.Item>

          {/* Contents (Rich Text) */}
          <Grid.Row gutter={16}>
            <Grid.Col span={12}>
              <Form.Item label='中文正文内容' field='contentZh' rules={[{ required: true, message: '请输入中文正文' }]}>
                <RichTextEditor />
              </Form.Item>
            </Grid.Col>
            <Grid.Col span={12}>
              <Form.Item label='英文正文内容' field='contentEn' rules={[{ required: true, message: '请输入英文正文' }]}>
                <RichTextEditor />
              </Form.Item>
            </Grid.Col>
          </Grid.Row>
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
          minHeight: 250,
          padding: '8px 12px',
          background: 'var(--color-bg-2)',
          outline: 'none',
          maxHeight: 400,
          overflowY: 'auto',
          color: 'var(--color-text-1)',
        }}
      />
    </div>
  );
}
