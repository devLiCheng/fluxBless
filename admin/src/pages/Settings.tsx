import { useEffect, useState } from 'react';
import { Card, Form, Input, Button, Message, Tabs, Spin, Typography } from '@arco-design/web-react';
import api from '../utils/api';

const { TabPane } = Tabs;

export default function Settings() {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form] = Form.useForm();

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const res = await api.get('/settings');
      form.setFieldsValue(res.data);
    } catch (err) {
      console.error(err);
      Message.error('加载系统设置失败');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  const handleSubmit = async () => {
    setSaving(true);
    try {
      const values = await form.validate();
      const res = await api.put('/settings', values);
      form.setFieldsValue(res.data);
      Message.success('系统设置已成功保存！');
    } catch (err: any) {
      console.error(err);
      Message.error(err.response?.data?.message || '保存设置失败，请重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h2 style={{ margin: 0, fontSize: 24 }}>系统设置 (System Settings)</h2>
        <p style={{ margin: '4px 0 0 0', color: 'var(--color-text-3)' }}>
          配置店铺前台各版块的文案内容、卖点特色及详情页参数。
        </p>
      </div>

      <Spin loading={loading} style={{ width: '100%' }}>
        <Card>
          <Form form={form} layout='vertical' onSubmit={handleSubmit}>
            <Tabs defaultActiveTab='1'>
              {/* Tab 1: Basic Settings */}
              <TabPane key='1' title='基础配置'>
                <div style={{ padding: '16px 0' }}>
                  <Typography.Title heading={6} style={{ marginTop: 0 }}>导航栏 Logo 配置</Typography.Title>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item label='Logo 主标题' field='header_logo_title' rules={[{ required: true }]}>
                      <Input placeholder='例如：FluxBless' />
                    </Form.Item>
                    <Form.Item label='Logo 副标题 (英文)' field='header_logo_subtitle'>
                      <Input placeholder='例如：Eastern Aesthetics' />
                    </Form.Item>
                  </div>

                  <Typography.Title heading={6}>顶部横幅 (Slogan)</Typography.Title>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item label='顶部公告文案 (中文)' field='top_slogan_zh' rules={[{ required: true }]}>
                      <Input placeholder='传统东方美学，点缀精致生活' />
                    </Form.Item>
                    <Form.Item label='顶部公告文案 (英文)' field='top_slogan_en' rules={[{ required: true }]}>
                      <Input placeholder='Traditional Eastern Aesthetics, Embellishing a Refined Life' />
                    </Form.Item>
                  </div>

                  <Typography.Title heading={6}>页脚 (Footer) 配置</Typography.Title>
                  <Form.Item label='页脚 Logo 标题' field='footer_logo_title' rules={[{ required: true }]}>
                    <Input placeholder='例如：FluxBless' />
                  </Form.Item>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item label='页脚介绍文案 (中文)' field='footer_desc_zh' rules={[{ required: true }]}>
                      <Input.TextArea rows={3} placeholder='输入页脚中文介绍文案...' style={{ resize: 'none' }} />
                    </Form.Item>
                    <Form.Item label='页脚介绍文案 (英文)' field='footer_desc_en' rules={[{ required: true }]}>
                      <Input.TextArea rows={3} placeholder='Enter footer English description...' style={{ resize: 'none' }} />
                    </Form.Item>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item label='客服联系邮箱' field='footer_contact_email' rules={[{ required: true, type: 'email' }]}>
                      <Input placeholder='contact@fluxbless.com' />
                    </Form.Item>
                    <div />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item label='版权说明 (中文)' field='footer_copyright_zh' rules={[{ required: true }]}>
                      <Input placeholder='© 2026 FluxBless. 保留所有权利。' />
                    </Form.Item>
                    <Form.Item label='版权说明 (英文)' field='footer_copyright_en' rules={[{ required: true }]}>
                      <Input placeholder='© 2026 FluxBless. All rights reserved.' />
                    </Form.Item>
                  </div>
                </div>
              </TabPane>

              {/* Tab 2: Hero Section */}
              <TabPane key='2' title='首页 Hero 区域'>
                <div style={{ padding: '16px 0' }}>
                  <Typography.Title heading={6} style={{ marginTop: 0 }}>顶部徽章标语 (Badge)</Typography.Title>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item label='徽章文案 (中文)' field='hero_badge_zh' rules={[{ required: true }]}>
                      <Input placeholder='探寻传统手工美学' />
                    </Form.Item>
                    <Form.Item label='徽章文案 (英文)' field='hero_badge_en' rules={[{ required: true }]}>
                      <Input placeholder='Explore Traditional Craft Aesthetics' />
                    </Form.Item>
                  </div>

                  <Typography.Title heading={6}>大标题 (Hero Title)</Typography.Title>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item label='大标题 (中文)' field='hero_title_zh' rules={[{ required: true }]}>
                      <Input placeholder='传统东方美学，点缀精致生活' />
                    </Form.Item>
                    <Form.Item label='大标题 (英文)' field='hero_title_en' rules={[{ required: true }]}>
                      <Input placeholder='Traditional Eastern Aesthetics, Embellishing a Refined Life' />
                    </Form.Item>
                  </div>

                  <Typography.Title heading={6}>介绍副文本 (Hero Description)</Typography.Title>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item label='介绍副文本 (中文)' field='hero_desc_zh' rules={[{ required: true }]}>
                      <Input.TextArea rows={4} placeholder='输入大标题下的说明文案...' style={{ resize: 'none' }} />
                    </Form.Item>
                    <Form.Item label='介绍副文本 (英文)' field='hero_desc_en' rules={[{ required: true }]}>
                      <Input.TextArea rows={4} placeholder='Enter hero description copy...' style={{ resize: 'none' }} />
                    </Form.Item>
                  </div>
                </div>
              </TabPane>

              {/* Tab 3: Features */}
              <TabPane key='3' title='特色卖点栏'>
                <div style={{ padding: '16px 0' }}>
                  {/* Feature 1 */}
                  <Typography.Title heading={6} style={{ marginTop: 0 }}>卖点一配置 (Feature 1)</Typography.Title>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: 16 }}>
                    <Form.Item label='图标名 (Lucide Icon)' field='feature1_icon' rules={[{ required: true }]}>
                      <Input placeholder='Gem' />
                    </Form.Item>
                    <Form.Item label='标题 (中文)' field='feature1_title_zh' rules={[{ required: true }]}>
                      <Input placeholder='天然原石' />
                    </Form.Item>
                    <Form.Item label='标题 (英文)' field='feature1_title_en' rules={[{ required: true }]}>
                      <Input placeholder='Natural Gems' />
                    </Form.Item>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                    <Form.Item label='描述 (中文)' field='feature1_desc_zh' rules={[{ required: true }]}>
                      <Input placeholder='天然玉石与玛瑙' />
                    </Form.Item>
                    <Form.Item label='描述 (英文)' field='feature1_desc_en' rules={[{ required: true }]}>
                      <Input placeholder='100% genuine crystals' />
                    </Form.Item>
                  </div>

                  {/* Feature 2 */}
                  <Typography.Title heading={6}>卖点二配置 (Feature 2)</Typography.Title>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: 16 }}>
                    <Form.Item label='图标名 (Lucide Icon)' field='feature2_icon' rules={[{ required: true }]}>
                      <Input placeholder='HeartHandshake' />
                    </Form.Item>
                    <Form.Item label='标题 (中文)' field='feature2_title_zh' rules={[{ required: true }]}>
                      <Input placeholder='匠心手作' />
                    </Form.Item>
                    <Form.Item label='标题 (英文)' field='feature2_title_en' rules={[{ required: true }]}>
                      <Input placeholder='Handcrafted' />
                    </Form.Item>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                    <Form.Item label='描述 (中文)' field='feature2_desc_zh' rules={[{ required: true }]}>
                      <Input placeholder='传统工艺纯手工打造' />
                    </Form.Item>
                    <Form.Item label='描述 (英文)' field='feature2_desc_en' rules={[{ required: true }]}>
                      <Input placeholder='Traditional handcrafted knots' />
                    </Form.Item>
                  </div>

                  {/* Feature 3 */}
                  <Typography.Title heading={6}>卖点三配置 (Feature 3)</Typography.Title>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: 16 }}>
                    <Form.Item label='图标名 (Lucide Icon)' field='feature3_icon' rules={[{ required: true }]}>
                      <Input placeholder='Sparkles' />
                    </Form.Item>
                    <Form.Item label='标题 (中文)' field='feature3_title_zh' rules={[{ required: true }]}>
                      <Input placeholder='工艺精制' />
                    </Form.Item>
                    <Form.Item label='标题 (英文)' field='feature3_title_en' rules={[{ required: true }]}>
                      <Input placeholder='Sonic Cleaned' />
                    </Form.Item>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                    <Form.Item label='描述 (中文)' field='feature3_desc_zh' rules={[{ required: true }]}>
                      <Input placeholder='手工多重清理净化' />
                    </Form.Item>
                    <Form.Item label='描述 (英文)' field='feature3_desc_en' rules={[{ required: true }]}>
                      <Input placeholder='Hand-cleaned and purified' />
                    </Form.Item>
                  </div>

                  {/* Feature 4 */}
                  <Typography.Title heading={6}>卖点四配置 (Feature 4)</Typography.Title>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 2fr', gap: 16 }}>
                    <Form.Item label='图标名 (Lucide Icon)' field='feature4_icon' rules={[{ required: true }]}>
                      <Input placeholder='ShieldCheck' />
                    </Form.Item>
                    <Form.Item label='标题 (中文)' field='feature4_title_zh' rules={[{ required: true }]}>
                      <Input placeholder='全球包邮' />
                    </Form.Item>
                    <Form.Item label='标题 (英文)' field='feature4_title_en' rules={[{ required: true }]}>
                      <Input placeholder='Free Shipping' />
                    </Form.Item>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item label='描述 (中文)' field='feature4_desc_zh' rules={[{ required: true }]}>
                      <Input placeholder='限时免运费直邮' />
                    </Form.Item>
                    <Form.Item label='描述 (英文)' field='feature4_desc_en' rules={[{ required: true }]}>
                      <Input placeholder='Free global delivery' />
                    </Form.Item>
                  </div>
                </div>
              </TabPane>

              {/* Tab 4: Product Detail Page */}
              <TabPane key='4' title='商品详情页配置'>
                <div style={{ padding: '16px 0' }}>
                  <Typography.Title heading={6} style={{ marginTop: 0 }}>手串规格参数</Typography.Title>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item label='默认适合手围' field='detail_wrist_size' rules={[{ required: true }]}>
                      <Input placeholder='例如：14cm – 18cm' />
                    </Form.Item>
                    <div />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item label='尺寸指南描述 (中文)' field='detail_sizing_desc_zh' rules={[{ required: true }]}>
                      <Input.TextArea rows={2} placeholder='默认手围尺寸说明...' style={{ resize: 'none' }} />
                    </Form.Item>
                    <Form.Item label='尺寸指南描述 (英文)' field='detail_sizing_desc_en' rules={[{ required: true }]}>
                      <Input.TextArea rows={2} placeholder='Enter wrist size guide description...' style={{ resize: 'none' }} />
                    </Form.Item>
                  </div>

                  <Typography.Title heading={6}>保养与清洁默认介绍 (Purification)</Typography.Title>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item label='保养说明 (中文)' field='detail_purification_zh' rules={[{ required: true }]}>
                      <Input.TextArea rows={3} placeholder='商品默认净化清洁保养中文说明...' style={{ resize: 'none' }} />
                    </Form.Item>
                    <Form.Item label='保养说明 (英文)' field='detail_purification_en' rules={[{ required: true }]}>
                      <Input.TextArea rows={3} placeholder='Enter default care and cleaning explanation...' style={{ resize: 'none' }} />
                    </Form.Item>
                  </div>

                  <Typography.Title heading={6}>评价区副文本 (Reviews Subtext)</Typography.Title>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                    <Form.Item label='评价副文本 (中文)' field='detail_review_subtext_zh' rules={[{ required: true }]}>
                      <Input placeholder='真实买家购买后的真实评价，百分百真实可信。' />
                    </Form.Item>
                    <Form.Item label='评价副文本 (英文)' field='detail_review_subtext_en' rules={[{ required: true }]}>
                      <Input placeholder='Authentic reviews from verified buyers.' />
                    </Form.Item>
                  </div>
                </div>
              </TabPane>
            </Tabs>

            <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end', borderTop: '1px solid var(--color-border)', paddingTop: 16 }}>
              <Button type='primary' size='large' loading={saving} style={{ width: 120 }} onClick={handleSubmit}>
                保存设置
              </Button>
            </div>
          </Form>
        </Card>
      </Spin>
    </div>
  );
}
