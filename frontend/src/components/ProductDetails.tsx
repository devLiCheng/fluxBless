'use client';

import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  ShoppingCart,
  ArrowLeft,
  ShieldCheck,
  RefreshCw,
  MapPin,
  Gem,
  Star,
  Package,
  Flame,
  Award,
  ChevronRight,
  X,
} from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';

interface Product {
  id: number;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  price: number;
  stock: number;
  images: any;
  categoryId: number;
  category: {
    slug: string;
    nameZh: string;
    nameEn: string;
  };
  // Rich detail fields
  materialZh?: string;
  materialEn?: string;
  originZh?: string;
  originEn?: string;
  purificationZh?: string;
  purificationEn?: string;
  benefitsZh?: string;
  benefitsEn?: string;
  specWeight?: string;
  specBeadSize?: string;
  specBeadCount?: string;
}

interface ProductDetailsProps {
  product: Product;
  dict: any;
  lang: 'zh' | 'en';
}

type Tab = 'description' | 'benefits' | 'specs';

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, dict, lang }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [activeTab, setActiveTab] = useState<Tab>('description');
  const { addToCart } = useCart();
  const { user } = useAuth();

  // Review states
  const [reviews, setReviews] = useState<any[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState('');

  // Contact customer service states
  const [isContactModalOpen, setIsContactModalOpen] = useState(false);
  const [contactName, setContactName] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [contactMessage, setContactMessage] = useState('');
  const [submittingInquiry, setSubmittingInquiry] = useState(false);
  const [inquiryStatus, setInquiryStatus] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchReviews = async () => {
    setReviewsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/products/${product.id}/reviews`);
      if (res.ok) {
        const data = await res.json();
        setReviews(data);
      }
    } catch (err) {
      console.warn('Failed to load reviews', err);
    } finally {
      setReviewsLoading(false);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, [product.id]);

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setReviewError('');
    setSubmittingReview(true);
    const token = localStorage.getItem('fluxbless_token');
    if (!token) {
      setReviewError(lang === 'zh' ? '请先登录' : 'Please log in first');
      setSubmittingReview(false);
      return;
    }
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiUrl}/products/${product.id}/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ rating: newRating, comment: newComment }),
      });
      if (res.ok) {
        setNewComment('');
        setNewRating(5);
        fetchReviews();
      } else {
        const error = await res.json();
        throw new Error(error.message || 'Failed to submit review');
      }
    } catch (err: any) {
      setReviewError(err.message || 'Error submitting review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const handleInquirySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactInfo.trim() || !contactMessage.trim()) {
      setInquiryStatus({
        type: 'error',
        text: lang === 'zh' ? '请填写联系方式和留言内容。' : 'Please fill out contact info and message.',
      });
      return;
    }

    setSubmittingInquiry(true);
    setInquiryStatus(null);

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const token = localStorage.getItem('fluxbless_token');
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const res = await fetch(`${apiUrl}/inquiries`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          name: contactName || undefined,
          contactInfo,
          message: contactMessage,
          productId: product.id,
        }),
      });

      if (res.ok) {
        setInquiryStatus({
          type: 'success',
          text: lang === 'zh' ? '您的留言已成功提交，我们将尽快与您联系！' : 'Message submitted successfully. We will get back to you soon!',
        });
        setContactName('');
        setContactInfo('');
        setContactMessage('');
        setTimeout(() => {
          setIsContactModalOpen(false);
          setInquiryStatus(null);
        }, 2200);
      } else {
        const errData = await res.json();
        throw new Error(errData.message || 'Submission failed');
      }
    } catch (err: any) {
      setInquiryStatus({
        type: 'error',
        text: err.message || (lang === 'zh' ? '提交留言失败，请稍后重试。' : 'Failed to submit. Please try again later.'),
      });
    } finally {
      setSubmittingInquiry(false);
    }
  };

  // Parse images
  const getImages = (): string[] => {
    try {
      if (Array.isArray(product.images)) return product.images;
      if (typeof product.images === 'string') {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed)) return parsed;
        return [product.images];
      }
      return ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop'];
    } catch {
      return ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop'];
    }
  };

  const images = getImages();
  const name = lang === 'zh' ? product.nameZh : product.nameEn;
  const description = lang === 'zh' ? product.descriptionZh : product.descriptionEn;
  const material = lang === 'zh' ? product.materialZh : product.materialEn;
  const origin = lang === 'zh' ? product.originZh : product.originEn;
  const purification = lang === 'zh' ? product.purificationZh : product.purificationEn;
  const benefits = lang === 'zh' ? product.benefitsZh : product.benefitsEn;

  // Fallback spiritual meaning based on category
  const getFallbackBenefits = () => {
    const slug = product.category.slug;
    const map: Record<string, { zh: string; en: string }> = {
      'agate-accessories': {
        zh: '玛瑙是佛教七宝之一，自古以来被当做辟邪物、护身符使用，象征友善的爱心和希望，有助于消除压力、疲劳、浊气等负性能量。红玛瑙尤为适合增强自信心与行动力，助佩戴者在事业与感情上双双顺遂。',
        en: 'Agate is one of the seven treasures of Buddhism. Since ancient times, it has been used as an amulet symbolizing friendly love and hope. It helps clear stress, fatigue, and negative energy. Red agate especially boosts confidence and action, bringing success in career and relationships.',
      },
      'five-elements-beads': {
        zh: '五行合香珠融合多种名贵香材，能调和五行能量，促进身心平衡。沉静悠远的香气有助于安神静心，招来福运与祥和之气。长期佩戴可净化磁场，使气场清明，贵人相助。',
        en: 'Five Elements incense beads blend precious herbs to harmonize personal elements and restore body-mind balance. The tranquil aroma calms the spirit and attracts good fortune and peace. Regular wear purifies your energy field, attracting helpful people.',
      },
      'colored-glaze-bracelets': {
        zh: '琉璃被誉为佛教五大名器之首。古法琉璃工艺澄澈透明，象征纯洁的精神与辟邪转运。佩戴可增强感知力，聚福纳祥，尤其适合希望改变运势、提升财运者。',
        en: 'Colored glaze is revered as the first of the five sacred treasures of Buddhism. Ancient glaze works are transparent, symbolizing spiritual purity, evil protection, and lucky turns. Ideal for those wishing to change fortunes and enhance wealth luck.',
      },
      'cinnabar-bracelets': {
        zh: '朱砂具有极强的阳气，自古被视为驱邪化煞、镇惊安神的极品。佩戴朱砂手串可护佑身心安康，开启智慧与鸿运。适合经常出行、从事特殊职业或需要身心保护的人士。',
        en: 'Cinnabar possesses powerful Yang energy and is regarded as the ultimate amulet to expel negative spirits. Wearing it protects health, welcomes good fortune, and awakens wisdom. Perfect for frequent travelers and those needing strong protection.',
      },
      'prayer-beads': {
        zh: '小叶紫檀香气浓郁，蕴含强大的辟邪能量。108颗念珠对应一百零八种烦恼，每日诵念可消除业障，积累功德。此外，盘玩时间越长，包浆越美，具有极高的收藏价值。',
        en: 'Red sandalwood emits a powerful fragrance with strong protective energy. 108 beads correspond to 108 afflictions; daily chanting dissolves karma and accumulates merit. The longer you handle them, the more beautiful the patina becomes, adding collectible value.',
      },
      'white-jade': {
        zh: '白玉温润无瑕，象征高洁的品德与平安祥瑞。佩戴白玉配饰可平和情绪，滋养身心，化解生活中的波折，保佑一生平安。和田玉尤为珍贵，具有极高保值与升值空间。',
        en: 'White jade is warm and flawless, symbolizing moral excellence, peace, and auspiciousness. Wearing it balances emotions, nourishes the spirit, and protects against life obstacles. Hetian jade is particularly precious with exceptional investment value.',
      },
    };
    const entry = map[slug];
    if (entry) return lang === 'zh' ? entry.zh : entry.en;
    return lang === 'zh'
      ? '此开运配饰汇聚吉祥能量，具有辟邪挡灾、凝聚福缘、保佑身心安康之神效。'
      : 'This blessed accessory gathers auspicious energy, offering protection, attracting fortune, and bringing tranquility to the wearer.';
  };

  const handleAddToCart = () => {
    for (let i = 0; i < quantity; i++) {
      addToCart({
        id: product.id,
        nameZh: product.nameZh,
        nameEn: product.nameEn,
        price: product.price,
        image: images[0],
        stock: product.stock,
      });
    }
  };

  const tabs: { key: Tab; label: string }[] = [
    { key: 'description', label: lang === 'zh' ? '商品描述' : 'Description' },
    { key: 'benefits', label: lang === 'zh' ? '功效寓意' : 'Spiritual Benefits' },
    { key: 'specs', label: lang === 'zh' ? '规格参数' : 'Specifications' },
  ];

  const hasSpecs = product.specWeight || product.specBeadSize || product.specBeadCount || material || origin || purification;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-xs text-zinc-500 mb-8">
        <Link href={`/${lang}`} className="hover:text-gold-primary transition-colors">
          {lang === 'zh' ? '首页' : 'Home'}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <Link href={`/${lang}#catalog`} className="hover:text-gold-primary transition-colors">
          {lang === 'zh' ? product.category.nameZh : product.category.nameEn}
        </Link>
        <ChevronRight className="w-3 h-3" />
        <span className="text-zinc-300 truncate max-w-[200px]">{name}</span>
      </nav>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* ── Left: Image Gallery ── */}
        <div className="space-y-4">
          {/* Main Image */}
          <div className="relative aspect-square bg-zinc-900 border border-gold-primary/10 rounded-2xl overflow-hidden group">
            <img
              src={images[selectedImageIndex]}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-[1.06] transition-transform duration-700 cursor-zoom-in"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop';
              }}
            />
            {/* Badge overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.stock > 0 && product.stock < 20 && (
                <span className="bg-amber-900/80 border border-amber-500/40 text-amber-300 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm">
                  {lang === 'zh' ? `仅剩 ${product.stock} 件` : `Only ${product.stock} left`}
                </span>
              )}
              <span className="bg-black/60 border border-gold-primary/30 text-gold-primary text-[10px] uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                {lang === 'zh' ? '已开光' : 'Energy Blessed'}
              </span>
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex space-x-3">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 bg-zinc-900 border rounded-xl overflow-hidden transition-all flex-shrink-0 ${
                    selectedImageIndex === idx
                      ? 'border-gold-primary shadow-[0_0_12px_rgba(212,175,55,0.3)] scale-105'
                      : 'border-gold-primary/10 hover:border-gold-primary/40'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${name} ${idx + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=200&auto=format&fit=crop';
                    }}
                  />
                </button>
              ))}
            </div>
          )}

          {/* Trust badges */}
          <div className="grid grid-cols-3 gap-3 mt-2">
            {[
              { icon: <Award className="w-4 h-4 text-gold-secondary" />, title: lang === 'zh' ? '正品保证' : 'Authentic', desc: lang === 'zh' ? '专业鉴定' : 'Certified' },
              { icon: <Flame className="w-4 h-4 text-gold-secondary" />, title: lang === 'zh' ? '能量开光' : 'Blessed', desc: lang === 'zh' ? '传统仪式' : 'Traditional rite' },
              { icon: <Package className="w-4 h-4 text-gold-secondary" />, title: lang === 'zh' ? '精心包装' : 'Gift Ready', desc: lang === 'zh' ? '礼盒发货' : 'Box included' },
            ].map((badge, i) => (
              <div
                key={i}
                className="flex flex-col items-center text-center p-3 bg-zinc-900/60 border border-gold-primary/10 rounded-xl gap-1"
              >
                {badge.icon}
                <span className="text-[11px] font-semibold text-cream">{badge.title}</span>
                <span className="text-[10px] text-zinc-500">{badge.desc}</span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Right: Product Info ── */}
        <div className="flex flex-col">
          {/* Category tag */}
          <span className="text-gold-secondary text-xs uppercase tracking-[0.2em] font-serif mb-2 flex items-center gap-2">
            <Gem className="w-3 h-3" />
            {lang === 'zh' ? product.category.nameZh : product.category.nameEn}
          </span>

          {/* Name */}
          <h1 className="text-3xl sm:text-4xl font-serif tracking-widest text-gold-primary gold-text-gradient mb-2 leading-tight">
            {name}
          </h1>

          {/* Star rating (decorative) */}
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((s) => (
              <Star key={s} className="w-4 h-4 fill-gold-primary text-gold-primary" />
            ))}
            <span className="text-xs text-zinc-400 ml-2">
              {lang === 'zh' ? '5.0 · 108+ 买家好评' : '5.0 · 108+ happy buyers'}
            </span>
          </div>

          {/* Price & Stock */}
          <div className="flex items-center space-x-6 border-y border-gold-primary/10 py-4 mb-6">
            <span className="text-3xl font-bold text-gold-primary">
              ¥{parseFloat(String(product.price)).toFixed(2)}
            </span>
            <span className="text-xs">
              {product.stock > 0 ? (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse inline-block" />
                  {dict.product.inStock} ({product.stock})
                </span>
              ) : (
                <span className="text-red-400 font-medium">● {dict.product.outOfStock}</span>
              )}
            </span>
          </div>

          {/* Quick info pills */}
          {(material || origin) && (
            <div className="flex flex-wrap gap-2 mb-6">
              {material && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-800 border border-gold-primary/15 rounded-full text-zinc-300">
                  <Gem className="w-3 h-3 text-gold-secondary" />
                  {material}
                </span>
              )}
              {origin && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-800 border border-gold-primary/15 rounded-full text-zinc-300">
                  <MapPin className="w-3 h-3 text-gold-secondary" />
                  {origin}
                </span>
              )}
              {product.specBeadSize && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-800 border border-gold-primary/15 rounded-full text-zinc-300">
                  ⬤ {product.specBeadSize}
                </span>
              )}
              {product.specBeadCount && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs bg-zinc-800 border border-gold-primary/15 rounded-full text-zinc-300">
                  × {product.specBeadCount}
                </span>
              )}
            </div>
          )}

          {/* Tabs */}
          <div className="border-b border-gold-primary/10 mb-6">
            <div className="flex space-x-0">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-5 py-2.5 text-xs font-medium tracking-widest uppercase transition-all border-b-2 -mb-px ${
                    activeTab === tab.key
                      ? 'border-gold-primary text-gold-primary'
                      : 'border-transparent text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* Tab Panels */}
          <div className="mb-6 min-h-[120px]">
            {activeTab === 'description' && (
              <div 
                className="text-zinc-300 text-sm leading-relaxed tracking-wide rich-description space-y-4"
                dangerouslySetInnerHTML={{ __html: description }}
              />
            )}

            {activeTab === 'benefits' && (
              <div className="gold-glass gold-border-glow p-5 rounded-xl border border-gold-primary/20">
                <h3 className="text-xs font-serif tracking-widest text-gold-primary flex items-center space-x-2 uppercase mb-3">
                  <Sparkles className="w-4 h-4 animate-pulse" />
                  <span>{dict.product.benefits}</span>
                </h3>
                <p className="text-sm text-zinc-300 leading-relaxed">
                  {benefits || getFallbackBenefits()}
                </p>
              </div>
            )}

            {activeTab === 'specs' && (
              <div className="space-y-1">
                {[
                  { label: dict.product.material, value: material },
                  { label: dict.product.origin, value: origin },
                  { label: dict.product.purification, value: purification },
                  { label: dict.product.specBeadSize, value: product.specBeadSize },
                  { label: dict.product.specBeadCount, value: product.specBeadCount },
                  { label: dict.product.specWeight, value: product.specWeight },
                  {
                    label: lang === 'zh' ? '适合手围' : 'Wrist Size',
                    value: '14cm – 18cm',
                  },
                ]
                  .filter((row) => row.value)
                  .map((row, i) => (
                    <div
                      key={i}
                      className={`flex items-start justify-between py-2.5 px-3 rounded-lg text-sm ${
                        i % 2 === 0 ? 'bg-zinc-900/80' : 'bg-transparent'
                      }`}
                    >
                      <span className="text-zinc-400 text-xs">{row.label}</span>
                      <span className="text-zinc-200 text-xs font-medium text-right max-w-[60%]">
                        {row.value}
                      </span>
                    </div>
                  ))}
                {!hasSpecs && (
                  <p className="text-zinc-500 text-sm py-2">
                    {lang === 'zh' ? '暂无详细规格信息' : 'No specification data available yet.'}
                  </p>
                )}
              </div>
            )}


          </div>

          {/* Quantity & CTA */}
          {product.stock > 0 ? (
            <div className="space-y-3 mt-auto">
              <div className="flex items-center space-x-4">
                {/* Quantity */}
                <div className="flex items-center border border-gold-primary/20 bg-black/40 rounded-lg overflow-hidden h-12">
                  <button
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="px-4 text-zinc-400 hover:text-gold-primary hover:bg-white/5 transition-all h-full text-lg"
                  >
                    −
                  </button>
                  <span className="px-5 text-sm font-semibold text-cream">{quantity}</span>
                  <button
                    onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                    className="px-4 text-zinc-400 hover:text-gold-primary hover:bg-white/5 transition-all h-full text-lg"
                  >
                    +
                  </button>
                </div>

                {/* Add to Cart */}
                <button
                  onClick={handleAddToCart}
                  className="flex-1 gold-gradient hover:gold-border-glow text-black font-bold uppercase tracking-widest rounded-lg h-12 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
                >
                  <ShoppingCart className="w-5 h-5" />
                  <span>{dict.product.addToCart}</span>
                </button>
              </div>

              {/* Total price hint */}
              {quantity > 1 && (
                <p className="text-xs text-zinc-500 text-center">
                  {lang === 'zh' ? '合计：' : 'Total: '}
                  <span className="text-gold-primary font-semibold">
                    ¥{(parseFloat(String(product.price)) * quantity).toFixed(2)}
                  </span>
                </p>
              )}
            </div>
          ) : (
            <button
              disabled
              className="w-full bg-zinc-800 text-zinc-500 font-semibold uppercase tracking-widest rounded-lg h-12 cursor-not-allowed mt-auto"
            >
              {dict.product.outOfStock}
            </button>
          )}

          {/* Guarantees */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-gold-primary/5 text-[11px] text-zinc-500">
            {[
              { icon: <ShieldCheck className="w-4 h-4 text-gold-secondary flex-shrink-0" />, text: lang === 'zh' ? '安全加密支付' : 'Secure SSL Payment' },
              { icon: <RefreshCw className="w-4 h-4 text-gold-secondary flex-shrink-0" />, text: lang === 'zh' ? '7天无理由退换' : '7-Day Easy Returns' },
              { icon: <Sparkles className="w-4 h-4 text-gold-secondary flex-shrink-0" />, text: lang === 'zh' ? '能量开光净化' : 'Energy Purified & Blessed' },
              { icon: <Package className="w-4 h-4 text-gold-secondary flex-shrink-0" />, text: lang === 'zh' ? '精美礼盒包装' : 'Premium Gift Packaging' },
            ].map((g, i) => (
              <div key={i} className="flex items-center gap-2">
                {g.icon}
                <span>{g.text}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Full-width Bottom Section ── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
        {/* Benefits card */}
        <div className="md:col-span-2 gold-glass border border-gold-primary/15 rounded-2xl p-8">
          <div className="flex items-center gap-3 mb-5">
            <div className="w-8 h-8 rounded-full bg-gold-primary/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-gold-primary" />
            </div>
            <h2 className="text-sm font-serif tracking-widest text-gold-primary uppercase">
              {lang === 'zh' ? '能量与寓意' : 'Energy & Meaning'}
            </h2>
          </div>
          <p className="text-zinc-300 text-sm leading-loose">
            {benefits || getFallbackBenefits()}
          </p>
        </div>

        {/* Side info */}
        <div className="space-y-4">
          {/* Purification info */}
          <div className="bg-zinc-900 border border-gold-primary/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Flame className="w-4 h-4 text-gold-secondary" />
              <h3 className="text-xs font-semibold text-cream uppercase tracking-widest">
                {dict.product.purification}
              </h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {purification ||
                (lang === 'zh'
                  ? '每件商品出货前均经传统寺院净化仪式与大师开光加持，激活石材内在灵性能量。'
                  : 'Every item undergoes a traditional temple purification and master blessing ceremony before shipping to activate its inner spiritual energy.')}
            </p>
          </div>

          {/* Authenticity */}
          <div className="bg-zinc-900 border border-gold-primary/10 rounded-2xl p-6">
            <div className="flex items-center gap-2 mb-3">
              <Award className="w-4 h-4 text-gold-secondary" />
              <h3 className="text-xs font-semibold text-cream uppercase tracking-widest">
                {dict.product.authenticity}
              </h3>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {dict.product.authenticityDesc}
            </p>
          </div>
        </div>
      </div>

      {/* Sizing guide banner */}
      <div className="bg-[#1A1A1A] border border-gold-primary/5 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="w-10 h-10 rounded-full bg-gold-primary/10 flex items-center justify-center flex-shrink-0">
          <RefreshCw className="w-5 h-5 text-gold-primary" />
        </div>
        <div>
          <h3 className="text-sm font-medium text-cream mb-1">{dict.product.sizeSpecs}</h3>
          <p className="text-xs text-zinc-500 leading-relaxed">{dict.product.sizingDesc}</p>
        </div>
        <button
          onClick={() => setIsContactModalOpen(true)}
          className="sm:ml-auto text-xs text-gold-primary border border-gold-primary/30 px-4 py-2 rounded-lg hover:bg-gold-primary/10 transition-colors uppercase tracking-widest flex-shrink-0 cursor-pointer"
        >
          {lang === 'zh' ? '联系客服' : 'Contact Us'}
        </button>
      </div>

      {/* ── User Reviews Section (At the bottom, below specs/sizing guide) ── */}
      <div className="mt-12 bg-[#1A1A1A] border border-gold-primary/10 rounded-2xl p-8">
        <div className="flex items-center gap-3 mb-6 border-b border-gold-primary/10 pb-4">
          <div className="w-8 h-8 rounded-full bg-gold-primary/10 flex items-center justify-center">
            <Star className="w-4 h-4 text-gold-primary fill-gold-primary" />
          </div>
          <h2 className="text-lg font-serif tracking-widest text-gold-primary uppercase">
            {lang === 'zh' ? '用户真实评价' : 'Customer Reviews'}
          </h2>
        </div>

        {/* Inner grid to split: left summary & form, right review list */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Col: Overall Rating & Write Review Form */}
          <div className="space-y-6 lg:border-r lg:border-gold-primary/10 lg:pr-8">
            {/* Average Rating Block */}
            <div className="flex items-center gap-4 bg-zinc-900/60 border border-gold-primary/10 p-5 rounded-xl">
              <div className="text-center px-4 border-r border-gold-primary/10">
                <div className="text-3xl font-bold text-gold-primary font-serif">
                  {reviews.length > 0
                    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                    : '5.0'}
                </div>
                <div className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">
                  {lang === 'zh' ? `${reviews.length} 条评价` : `${reviews.length} Reviews`}
                </div>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-1 mb-1">
                  {[1, 2, 3, 4, 5].map((s) => {
                    const avg = reviews.length > 0 ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length) : 5.0;
                    return (
                      <Star
                        key={s}
                        className={`w-3.5 h-3.5 ${
                          s <= Math.round(avg) ? 'fill-gold-primary text-gold-primary' : 'text-zinc-600'
                        }`}
                      />
                    );
                  })}
                </div>
                <p className="text-xs text-zinc-400">
                  {lang === 'zh' ? '真实买家购买后的真实评价，百分百真实可信。' : 'Authentic reviews from verified buyers.'}
                </p>
              </div>
            </div>

            {/* Write a Review form */}
            {user ? (
              <form onSubmit={handleReviewSubmit} className="bg-zinc-900/40 border border-gold-primary/5 p-5 rounded-xl space-y-4">
                <h3 className="text-xs font-serif tracking-widest text-gold-secondary uppercase">
                  {lang === 'zh' ? '撰写您的评价' : 'Write a Review'}
                </h3>
                {reviewError && (
                  <div className="bg-red-950/40 border border-red-500/40 text-red-300 text-[11px] px-3 py-2 rounded-lg">
                    {reviewError}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <span className="text-xs text-zinc-400">{lang === 'zh' ? '评分：' : 'Rating: '}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        key={s}
                        type="button"
                        onClick={() => setNewRating(s)}
                        className="p-0.5 hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-4 h-4 ${
                            s <= newRating ? 'fill-gold-primary text-gold-primary' : 'text-zinc-600'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <textarea
                    required
                    rows={3}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    placeholder={lang === 'zh' ? '说说您的佩戴体验和感受吧...' : 'Share your wearing experience...'}
                    className="w-full bg-black/60 border border-gold-primary/20 focus:border-gold-primary text-xs text-cream px-3 py-2 rounded-lg focus:outline-none resize-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="gold-gradient hover:gold-border-glow text-black font-semibold text-[10px] tracking-widest uppercase px-4 py-2.5 rounded-lg transition-all disabled:opacity-50 w-full"
                >
                  {submittingReview ? (lang === 'zh' ? '提交中...' : 'Submitting...') : (lang === 'zh' ? '提交评价' : 'Submit Review')}
                </button>
              </form>
            ) : (
              <div className="bg-zinc-900/20 border border-gold-primary/5 p-4 rounded-xl text-center">
                <p className="text-xs text-zinc-500">
                  {lang === 'zh' ? '请登录后发表评价。' : 'Please log in to submit a review.'}
                </p>
              </div>
            )}
          </div>

          {/* Right Col: Reviews List */}
          <div className="lg:col-span-2 space-y-4 divide-y divide-gold-primary/10 max-h-[500px] overflow-y-auto pr-2 custom-scrollbar">
            {reviewsLoading ? (
              <div className="flex justify-center py-12">
                <div className="w-6 h-6 border-2 border-gold-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : reviews.length === 0 ? (
              <div className="py-12 text-center text-zinc-500 text-xs">
                {lang === 'zh' ? '暂无评价，欢迎您成为首位评价者！' : 'No reviews yet. Be the first to review!'}
              </div>
            ) : (
              reviews.map((r, i) => (
                <div key={r.id} className={`pt-4 ${i === 0 ? 'pt-0' : ''}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-cream">{r.user?.name || 'Anonymous'}</span>
                      <div className="flex items-center gap-0.5">
                        {[1, 2, 3, 4, 5].map((s) => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${
                              s <= r.rating ? 'fill-gold-primary text-gold-primary' : 'text-zinc-700'
                            }`}
                          />
                        ))}
                      </div>
                    </div>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(r.createdAt).toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US')}
                    </span>
                  </div>
                  <p className="text-zinc-300 text-xs leading-relaxed">{r.comment}</p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* ── Contact Customer Service Modal ── */}
      {isContactModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm transition-opacity duration-300">
          <div 
            className="relative w-full max-w-md bg-[#161616] border border-gold-primary/20 rounded-2xl p-6 shadow-2xl overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Background design elements */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gold-primary/5 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gold-primary/5 rounded-full blur-3xl pointer-events-none" />

            {/* Header */}
            <div className="flex items-center justify-between mb-6 pb-3 border-b border-gold-primary/10">
              <h3 className="text-base font-serif font-semibold tracking-widest text-gold-primary uppercase">
                {lang === 'zh' ? '联系客服 / 问题反馈' : 'Contact Support'}
              </h3>
              <button
                onClick={() => {
                  setIsContactModalOpen(false);
                  setInquiryStatus(null);
                }}
                className="text-zinc-400 hover:text-gold-primary transition-colors p-1 cursor-pointer"
                aria-label="Close modal"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleInquirySubmit} className="space-y-4">
              <div>
                <label className="block text-[10px] text-zinc-400 mb-1.5 uppercase tracking-wider">
                  {lang === 'zh' ? '您的称呼 (选填)' : 'Your Name (Optional)'}
                </label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder={lang === 'zh' ? '例如：张先生 / 李女士' : 'e.g. John Doe'}
                  className="w-full text-xs text-cream bg-[#222] border border-gold-primary/10 rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-gold-primary transition-all placeholder-zinc-600"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 mb-1.5 uppercase tracking-wider">
                  {lang === 'zh' ? '联系方式 (必填)' : 'Contact Info (Required)'}
                </label>
                <input
                  type="text"
                  required
                  value={contactInfo}
                  onChange={(e) => setContactInfo(e.target.value)}
                  placeholder={lang === 'zh' ? 'Email, WhatsApp, 微信等' : 'Email, WhatsApp, WeChat, etc.'}
                  className="w-full text-xs text-cream bg-[#222] border border-gold-primary/10 rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-gold-primary transition-all placeholder-zinc-600"
                />
              </div>

              <div>
                <label className="block text-[10px] text-zinc-400 mb-1.5 uppercase tracking-wider">
                  {lang === 'zh' ? '咨询内容 / 问题反馈 (必填)' : 'Inquiry / Feedback (Required)'}
                </label>
                <textarea
                  required
                  rows={4}
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder={lang === 'zh' ? '请详细描述您想咨询的问题或特别定制的需求...' : 'Describe your questions or customization requests in detail...'}
                  className="w-full text-xs text-cream bg-[#222] border border-gold-primary/10 rounded-lg px-3.5 py-2.5 focus:outline-none focus:border-gold-primary focus:ring-1 focus:ring-gold-primary transition-all placeholder-zinc-600 resize-none custom-scrollbar"
                />
              </div>

              {inquiryStatus && (
                <div 
                  className={`p-3 rounded-lg text-[11px] leading-relaxed ${
                    inquiryStatus.type === 'success' 
                      ? 'bg-green-500/10 border border-green-500/20 text-green-400' 
                      : 'bg-red-500/10 border border-red-500/20 text-red-400'
                  }`}
                >
                  {inquiryStatus.text}
                </div>
              )}

              <button
                type="submit"
                disabled={submittingInquiry}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-gold-primary/80 to-gold-primary text-black font-semibold text-xs tracking-widest uppercase py-3 rounded-lg hover:from-gold-primary hover:to-gold-primary/90 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg cursor-pointer"
              >
                {submittingInquiry ? (
                  <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></span>
                ) : (
                  lang === 'zh' ? '提交咨询' : 'Submit Inquiry'
                )}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
