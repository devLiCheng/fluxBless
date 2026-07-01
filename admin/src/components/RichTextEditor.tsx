import { useEffect, useRef, useState, useId } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import api from '../utils/api';
import { Button, Input, Message, Space, Divider } from '@arco-design/web-react';
import { 
  AlignLeft, 
  AlignCenter, 
  AlignRight, 
  Trash2,
  Settings
} from 'lucide-react';

// Define HTML5 video embed blot to override Quill's default iframe behavior
class VideoBlot extends (Quill.import('blots/block/embed') as any) {
  static blotName = 'video';
  static tagName = 'video';

  static create(value: string) {
    const node = super.create() as HTMLElement;
    node.setAttribute('src', value);
    node.setAttribute('controls', 'true');
    node.setAttribute('style', 'max-width: 100%; border-radius: 8px; margin: 8px 0; display: block;');
    node.setAttribute('controlsList', 'nodownload');
    return node;
  }
  static value(node: HTMLElement) {
    return node.getAttribute('src');
  }
}
Quill.register(VideoBlot);

interface RichTextEditorProps {
  value?: string;
  onChange?: (val: string) => void;
}

export default function RichTextEditor({ value = '', onChange }: RichTextEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<Quill | null>(null);
  const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);
  const [imageAlt, setImageAlt] = useState('');
  const [imageWidth, setImageWidth] = useState('');
  const [imageAlign, setImageAlign] = useState<'left' | 'center' | 'right' | 'default'>('default');

  const editorId = useId().replace(/:/g, ''); 

  // Helper to strip runtime layout outline class before sending data back to form
  const cleanHTML = (html: string) => {
    return html
      .replace(/\s*selected-img-outline\s*/g, '')
      .replace(/class=""/g, '')
      .trim();
  };

  const handleContentChange = () => {
    if (quillRef.current && onChange) {
      const html = quillRef.current.root.innerHTML;
      onChange(html === '<p><br></p>' ? '' : cleanHTML(html));
    }
  };

  useEffect(() => {
    if (!containerRef.current) return;

    const quill = new Quill(containerRef.current, {
      theme: 'snow',
      modules: {
        table: true,
        toolbar: {
          container: `#toolbar-${editorId}`,
          handlers: {
            image: () => selectLocalFile('image'),
            video: () => selectLocalFile('video'),
            link: handleLink,
            table: handleTable,
          }
        }
      }
    });

    quillRef.current = quill;

    if (value) {
      quill.root.innerHTML = value;
    }

    quill.on('text-change', () => {
      handleContentChange();
    });

    // Event listener to select image and open the settings panel
    const handleEditorClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      const previousSelected = quill.root.querySelector('.selected-img-outline');
      if (previousSelected) {
        previousSelected.classList.remove('selected-img-outline');
      }

      if (target && target.tagName === 'IMG') {
        const img = target as HTMLImageElement;
        img.classList.add('selected-img-outline');
        
        setSelectedImage(img);
        setImageAlt(img.getAttribute('alt') || '');
        
        const width = img.style.width || img.getAttribute('width') || '';
        setImageWidth(width);

        const display = img.style.display;
        const marginLeft = img.style.marginLeft;
        const marginRight = img.style.marginRight;
        
        if (display === 'block' && marginLeft === '0px' && marginRight === 'auto') {
          setImageAlign('left');
        } else if (display === 'block' && marginLeft === 'auto' && marginRight === 'auto') {
          setImageAlign('center');
        } else if (display === 'block' && marginLeft === 'auto' && marginRight === '0px') {
          setImageAlign('right');
        } else {
          setImageAlign('default');
        }
      } else {
        setSelectedImage(null);
      }
    };

    quill.root.addEventListener('click', handleEditorClick);

    return () => {
      quill.root.removeEventListener('click', handleEditorClick);
      quillRef.current = null;
    };
  }, [editorId]);

  // Synchronize editor innerHTML with the value prop only when changed from outside
  useEffect(() => {
    if (quillRef.current) {
      const currentHTML = quillRef.current.root.innerHTML;
      const normalizedValue = value || '';
      const normalizedCurrent = currentHTML === '<p><br></p>' ? '' : cleanHTML(currentHTML);
      if (normalizedValue !== normalizedCurrent) {
        quillRef.current.root.innerHTML = normalizedValue;
      }
    }
  }, [value]);

  const selectLocalFile = (type: 'image' | 'video') => {
    const input = document.createElement('input');
    input.setAttribute('type', 'file');
    input.setAttribute('accept', type === 'image' ? 'image/*' : 'video/*');
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      try {
        const res = await api.post('/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
        const url = res.data.url;

        const quill = quillRef.current;
        if (quill) {
          const range = quill.getSelection(true);
          if (type === 'image') {
            quill.insertEmbed(range.index, 'image', url);
            quill.setSelection(range.index + 1);
          } else {
            quill.insertEmbed(range.index, 'video', url);
            quill.setSelection(range.index + 1);
          }
          handleContentChange();
        }
      } catch (err) {
        console.error(`${type} upload failed`, err);
        Message.error(`上传${type === 'image' ? '图片' : '视频'}失败`);
      }
    };
  };

  const handleLink = () => {
    const quill = quillRef.current;
    if (!quill) return;
    const range = quill.getSelection();
    if (!range) {
      Message.warning('请先选中要插入链接的文本');
      return;
    }
    const url = prompt('请输入链接地址 (例如 https://example.com):');
    if (url) {
      quill.format('link', url);
      handleContentChange();
    }
  };

  const handleTable = () => {
    const quill = quillRef.current;
    if (!quill) return;
    const tableModule = quill.getModule('table') as any;
    if (tableModule) {
      tableModule.insertTable(3, 2);
      handleContentChange();
    }
  };

  const updateImageAlt = (val: string) => {
    if (!selectedImage) return;
    selectedImage.setAttribute('alt', val);
    setImageAlt(val);
    handleContentChange();
  };

  const updateImageWidth = (width: string) => {
    if (!selectedImage) return;
    selectedImage.style.width = width;
    setImageWidth(width);
    handleContentChange();
  };

  const updateImageAlign = (align: 'left' | 'center' | 'right' | 'default') => {
    if (!selectedImage) return;
    
    selectedImage.style.display = '';
    selectedImage.style.marginLeft = '';
    selectedImage.style.marginRight = '';
    selectedImage.style.float = '';

    if (align === 'left') {
      selectedImage.style.display = 'block';
      selectedImage.style.marginLeft = '0';
      selectedImage.style.marginRight = 'auto';
    } else if (align === 'center') {
      selectedImage.style.display = 'block';
      selectedImage.style.marginLeft = 'auto';
      selectedImage.style.marginRight = 'auto';
    } else if (align === 'right') {
      selectedImage.style.display = 'block';
      selectedImage.style.marginLeft = 'auto';
      selectedImage.style.marginRight = '0';
    }
    
    setImageAlign(align);
    handleContentChange();
  };

  const deleteImage = () => {
    if (!selectedImage) return;
    selectedImage.remove();
    setSelectedImage(null);
    handleContentChange();
  };

  return (
    <div className="rich-text-editor-wrapper">
      <style>{`
        .rich-text-editor-wrapper {
          border: 1px solid var(--color-border);
          border-radius: 8px;
          overflow: hidden;
          background: var(--color-bg-2);
          display: flex;
          flex-direction: column;
          width: 100%;
        }
        .rich-text-editor-wrapper .ql-toolbar.ql-snow {
          border: none;
          border-bottom: 1px solid var(--color-border);
          background: var(--color-fill-2);
          padding: 6px 12px;
        }
        .rich-text-editor-wrapper .ql-container.ql-snow {
          border: none;
          min-height: 250px;
          max-height: 450px;
          overflow-y: auto;
          font-size: 14px;
          color: var(--color-text-1);
          background: var(--color-bg-2);
        }
        .rich-text-editor-wrapper .ql-editor {
          min-height: 250px;
          color: var(--color-text-1);
        }
        .rich-text-editor-wrapper .ql-editor img {
          cursor: pointer;
          transition: box-shadow 0.2s;
        }
        .rich-text-editor-wrapper .ql-editor img:hover {
          box-shadow: 0 0 0 3px var(--color-primary-light-3);
        }
        .rich-text-editor-wrapper .ql-editor img.selected-img-outline {
          box-shadow: 0 0 0 3px var(--color-primary-6) !important;
        }

        .image-settings-panel {
          background: var(--color-fill-1);
          border-top: 1px solid var(--color-border);
          padding: 12px 16px;
          animation: slideUp 0.2s ease-out;
        }
        @keyframes slideUp {
          from { transform: translateY(10px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>

      {/* Toolbar HTML Container */}
      <div id={`toolbar-${editorId}`}>
        <span className="ql-formats">
          <button className="ql-bold" title="加粗" />
          <button className="ql-italic" title="斜体" />
          <button className="ql-underline" title="下划线" />
          <button className="ql-strike" title="删除线" />
        </span>
        <span className="ql-formats">
          <select className="ql-header" defaultValue="" title="标题">
            <option value="1">标题 1</option>
            <option value="2">标题 2</option>
            <option value="3">标题 3</option>
            <option value="">正文</option>
          </select>
        </span>
        <span className="ql-formats">
          <button className="ql-list" value="ordered" title="有序列表" />
          <button className="ql-list" value="bullet" title="无序列表" />
        </span>
        <span className="ql-formats">
          <select className="ql-align" title="对齐方式" />
        </span>
        <span className="ql-formats">
          <button className="ql-link" title="插入链接" />
          <button className="ql-image" title="插入图片" />
          <button className="ql-video" title="插入视频" />
          <button className="ql-table" title="插入表格" />
        </span>
        <span className="ql-formats">
          <button className="ql-clean" title="清除格式" />
        </span>
      </div>

      {/* Quill Editor Container */}
      <div ref={containerRef} />

      {/* Inline Image Settings Panel (Shows only when an image inside the editor is clicked) */}
      {selectedImage && (
        <div className="image-settings-panel">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, color: 'var(--color-text-2)', fontWeight: 'bold', fontSize: 13 }}>
            <Settings size={14} />
            <span>图片属性设置 (Image Settings)</span>
          </div>
          
          <Space size={16} align="center" style={{ width: '100%', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-3)', whiteSpace: 'nowrap' }}>图片描述 (Alt text):</span>
              <Input
                style={{ width: 220 }}
                size="small"
                placeholder="输入描述以优化 SEO / GEO"
                value={imageAlt}
                onChange={updateImageAlt}
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>宽度:</span>
              <Space size={4}>
                {['25%', '50%', '75%', '100%', 'auto'].map((w) => (
                  <Button
                    key={w}
                    size="mini"
                    type={imageWidth === w || (w === 'auto' && !imageWidth) ? 'primary' : 'secondary'}
                    onClick={() => updateImageWidth(w === 'auto' ? '' : w)}
                  >
                    {w}
                  </Button>
                ))}
              </Space>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--color-text-3)' }}>对齐:</span>
              <Space size={4}>
                <Button
                  size="mini"
                  icon={<AlignLeft size={12} />}
                  type={imageAlign === 'left' ? 'primary' : 'secondary'}
                  onClick={() => updateImageAlign('left')}
                  title="左对齐"
                />
                <Button
                  size="mini"
                  icon={<AlignCenter size={12} />}
                  type={imageAlign === 'center' ? 'primary' : 'secondary'}
                  onClick={() => updateImageAlign('center')}
                  title="居中对齐"
                />
                <Button
                  size="mini"
                  icon={<AlignRight size={12} />}
                  type={imageAlign === 'right' ? 'primary' : 'secondary'}
                  onClick={() => updateImageAlign('right')}
                  title="右对齐"
                />
                <Button
                  size="mini"
                  type={imageAlign === 'default' ? 'primary' : 'secondary'}
                  onClick={() => updateImageAlign('default')}
                  title="默认对齐"
                >
                  默认
                </Button>
              </Space>
            </div>

            <Divider type="vertical" />

            <Button
              size="small"
              status="danger"
              type="primary"
              icon={<Trash2 size={12} />}
              onClick={deleteImage}
            >
              删除图片
            </Button>
          </Space>
        </div>
      )}
    </div>
  );
}
