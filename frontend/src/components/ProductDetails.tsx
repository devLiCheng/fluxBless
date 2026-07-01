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
  ChevronLeft,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
} from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

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
  specWristSizeZh?: string;
  specWristSizeEn?: string;
  sizingDescZh?: string;
  sizingDescEn?: string;
  purchaseUrl?: string;
  tagsZh?: string;
  tagsEn?: string;
  rating?: number;
  reviewCount?: number;
}

interface ProductDetailsProps {
  product: Product;
  dict: any;
  lang: 'zh' | 'en';
}

type Tab = 'description' | 'benefits' | 'specs';

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, dict, lang }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const { getSetting, getSettingL } = useSettings();
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

  const getFullImageUrl = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
    if (apiBase.startsWith('http')) {
      const origin = new URL(apiBase).origin;
      return `${origin}${url}`;
    }
    return url;
  };

  // Parse images
  const getImages = (): string[] => {
    try {
      let rawImages: string[] = [];
      if (Array.isArray(product.images)) {
        rawImages = product.images;
      } else if (typeof product.images === 'string') {
        const parsed = JSON.parse(product.images);
        if (Array.isArray(parsed)) rawImages = parsed;
        else rawImages = [product.images];
      } else {
        rawImages = [];
      }
      if (rawImages.length === 0) {
        return ['https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop'];
      }
      return rawImages.map(getFullImageUrl);
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

  // Lightbox states
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  // Lightbox Zoom and Drag state
  const hasDraggedRef = React.useRef(false);
  const [lightboxScale, setLightboxScale] = useState(1);
  const [lightboxPos, setLightboxPos] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const handleLightboxReset = () => {
    setLightboxScale(1);
    setLightboxPos({ x: 0, y: 0 });
    hasDraggedRef.current = false;
  };

  const handleLightboxZoomIn = () => {
    setLightboxScale((s) => (s >= 3.5 ? 1 : s + 0.5));
    if (lightboxScale >= 3.5) {
      setLightboxPos({ x: 0, y: 0 });
    }
  };

  const handleLightboxZoomOut = () => {
    setLightboxScale((s) => (s <= 1 ? 1 : s - 0.5));
    if (lightboxScale <= 1.5) {
      setLightboxPos({ x: 0, y: 0 });
    }
  };

  const handleLightboxMouseDown = (e: React.MouseEvent<HTMLImageElement>) => {
    hasDraggedRef.current = false;
    if (lightboxScale === 1) return;
    e.preventDefault();
    setIsDragging(true);
    setDragStart({ x: e.clientX - lightboxPos.x, y: e.clientY - lightboxPos.y });
  };

  const handleLightboxMouseMove = (e: React.MouseEvent<HTMLImageElement>) => {
    if (!isDragging) return;
    e.preventDefault();
    const newX = e.clientX - dragStart.x;
    const newY = e.clientY - dragStart.y;
    const deltaX = Math.abs(newX - lightboxPos.x);
    const deltaY = Math.abs(newY - lightboxPos.y);
    if (deltaX > 3 || deltaY > 3) {
      hasDraggedRef.current = true;
    }
    setLightboxPos({
      x: newX,
      y: newY,
    });
  };

  const handleLightboxMouseUp = () => {
    setIsDragging(false);
  };

  const handleLightboxTouchStart = (e: React.TouchEvent<HTMLImageElement>) => {
    hasDraggedRef.current = false;
    if (lightboxScale === 1) return;
    setIsDragging(true);
    const touch = e.touches[0];
    setDragStart({ x: touch.clientX - lightboxPos.x, y: touch.clientY - lightboxPos.y });
  };

  const handleLightboxTouchMove = (e: React.TouchEvent<HTMLImageElement>) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const newX = touch.clientX - dragStart.x;
    const newY = touch.clientY - dragStart.y;
    const deltaX = Math.abs(newX - lightboxPos.x);
    const deltaY = Math.abs(newY - lightboxPos.y);
    if (deltaX > 3 || deltaY > 3) {
      hasDraggedRef.current = true;
    }
    setLightboxPos({
      x: newX,
      y: newY,
    });
  };

  // Keyboard navigation for Lightbox
  useEffect(() => {
    if (!isLightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsLightboxOpen(false);
        handleLightboxReset();
      } else if (e.key === 'ArrowLeft' && images.length > 1) {
        setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
        handleLightboxReset();
      } else if (e.key === 'ArrowRight' && images.length > 1) {
        setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
        handleLightboxReset();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [isLightboxOpen, images.length]);

  // Hover Zoom state for main detail image
  const [zoomStyle, setZoomStyle] = useState<React.CSSProperties>({});
  const [isZoomed, setIsZoomed] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      transformOrigin: `${x}% ${y}%`,
      transform: 'scale(1.8)',
    });
  };

  const handleMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleMouseLeave = () => {
    setIsZoomed(false);
    setZoomStyle({});
  };

  const displayRating = product.rating !== undefined && product.rating !== null ? product.rating : 5.0;
  const displayReviewCount = product.reviewCount !== undefined && product.reviewCount !== null ? product.reviewCount : 0;

  // Fallback spiritual meaning based on category
  const getFallbackBenefits = () => {
    const slug = product.category.slug;
    const map: Record<string, { zh: string; en: string }> = {
      'agate-accessories': {
        zh: '玛瑙色彩斑斓，纹理独特。自古以来在东方美学中被视为优美的日常配饰，象征友善与希望，有助于舒缓压力，让人保持从容的心态。',
        en: 'Agate features beautiful colors and unique textures. Since ancient times in Eastern aesthetics, it has been worn as classic daily jewelry, symbolizing hope and friendliness, helping to soothe everyday stress.',
      },
      'five-elements-beads': {
        zh: '五行合香珠融合多种名贵木香材质，散发清新淡雅的自然芬芳。静心盘玩或日常佩戴，香气怡人，让人感到心旷神怡，展现温婉大方的气质。',
        en: 'Five Elements incense beads blend premium aromatic woods to emit a natural, calming scent. Perfect for daily wear and sensory relaxation, adding a touch of elegance to any style.',
      },
      'colored-glaze-bracelets': {
        zh: '古法琉璃工艺澄澈透亮，色彩斑斓璀璨，在中国传统工艺中代表着极高的手工审美。每一件古法琉璃均为手工精制，纹理与气泡独一无二，展现佩戴者的优雅品味。',
        en: 'Ancient colored glaze is clear and brilliant, featuring radiant colors that represent the pinnacle of traditional handcrafted aesthetics. Each piece is unique, reflecting refined personal taste.',
      },
      'cinnabar-bracelets': {
        zh: '朱砂呈现沉稳大气的朱红色，质地温润，古朴大方。其厚重端庄的色泽与经典设计相结合，既保留古典温雅气质，又具现代美感，是赠礼与佩戴的佳品。',
        en: 'Cinnabar features a classic vermilion color with a warm texture. Its elegant red shade combined with timeless design offers both traditional charm and modern beauty, making it a great gift.',
      },
      'prayer-beads': {
        zh: '108颗念珠精选优质木质材质，散发自然淡雅的芳香，有助于安定心神。木珠经过长期佩戴与盘玩后色泽更为圆润饱满，质感更佳，极具欣赏与收藏价值。',
        en: 'These 108 wood beads are selected from premium natural wood, emitting a subtle soothing fragrance. The beads develop a beautiful natural patina over time, adding unique aesthetic value.',
      },
      'white-jade': {
        zh: '白玉温润无瑕，玉质细腻，象征着温润如玉的高洁品格与古典气质。日常佩戴可点缀服饰，衬托佩戴者优雅温婉、大方得体的东方美学风采。',
        en: 'White jade is warm and smooth with a delicate texture, representing purity, elegance, and classic aesthetics. Perfect for daily wear, it complements your outfit with graceful Eastern style.',
      },
    };
    const entry = map[slug];
    if (entry) return lang === 'zh' ? entry.zh : entry.en;
    return lang === 'zh'
      ? '此款精致配饰由优质材质手工打造，做工考究，设计典雅，是展现个人独特审美与优雅气质的上佳之选。'
      : 'This premium accessory is meticulously handcrafted from selected materials, featuring a refined and elegant design that showcases your unique style.';
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
    { key: 'benefits', label: dict.product.benefits || (lang === 'zh' ? '美学与价值' : 'Aesthetics & Value') },
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
          <div 
            onMouseMove={handleMouseMove}
            onMouseEnter={handleMouseEnter}
            onMouseLeave={handleMouseLeave}
            onClick={() => {
              setLightboxIndex(selectedImageIndex);
              handleLightboxReset();
              setIsLightboxOpen(true);
            }}
            className="relative aspect-square bg-zinc-900 border border-gold-primary/10 rounded-2xl overflow-hidden group cursor-zoom-in"
          >
            <img
              src={images[selectedImageIndex]}
              alt={name}
              style={isZoomed ? zoomStyle : { transition: 'transform 0.5s ease-out' }}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop';
              }}
            />
            {/* Image Counter Badge */}
            {images.length > 0 && (
              <div className="absolute bottom-4 right-4 bg-black/60 border border-gold-primary/30 text-cream px-3 py-1 rounded-full text-[10px] tracking-widest backdrop-blur-sm select-none z-10">
                {selectedImageIndex + 1} / {images.length}
              </div>
            )}
            {/* Badge overlay */}
            <div className="absolute top-4 left-4 flex flex-col gap-2">
              {product.stock > 0 && product.stock < 20 && (
                <span className="bg-amber-900/80 border border-amber-500/40 text-amber-300 text-[10px] uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm">
                  {lang === 'zh' ? `仅剩 ${product.stock} 件` : `Only ${product.stock} left`}
                </span>
              )}
              {(() => {
                const tagsStr = lang === 'zh' ? product.tagsZh : product.tagsEn;
                if (tagsStr && tagsStr.trim()) {
                  const tagList = tagsStr.split(',').map((t) => t.trim()).filter(Boolean);
                  return tagList.map((tag, idx) => (
                    <span key={idx} className="bg-black/60 border border-gold-primary/30 text-gold-primary text-[10px] uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      {tag}
                    </span>
                  ));
                }
                return (
                  <span className="bg-black/60 border border-gold-primary/30 text-gold-primary text-[10px] uppercase tracking-widest px-3 py-1 rounded-full backdrop-blur-sm flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    {lang === 'zh' ? '手工甄选' : 'Premium Selected'}
                  </span>
                );
              })()}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex space-x-3 overflow-x-auto pb-2 scrollbar-none scroll-smooth">
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
              { icon: <Flame className="w-4 h-4 text-gold-secondary" />, title: lang === 'zh' ? '声波清洗' : 'Sonic Cleaned', desc: lang === 'zh' ? '手工清洁' : 'Hand-Cleaned' },
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

          {/* Star rating */}
          <div className="flex items-center gap-1 mb-4">
            {[1, 2, 3, 4, 5].map((s) => {
              const fillStar = s <= Math.round(displayRating);
              return (
                <Star 
                  key={s} 
                  className={`w-4 h-4 text-gold-primary transition-all ${
                    fillStar ? 'fill-gold-primary opacity-100' : 'opacity-25'
                  }`} 
                />
              );
            })}
            <span className="text-xs text-zinc-400 ml-2">
              {lang === 'zh' 
                ? `${displayRating.toFixed(1)} · ${displayReviewCount}+ 买家好评` 
                : `${displayRating.toFixed(1)} · ${displayReviewCount}+ happy buyers`}
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
            <div className="flex space-x-0 overflow-x-auto scrollbar-none pb-0.5 scroll-smooth">
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
                    value: (lang === 'zh' ? product.specWristSizeZh : product.specWristSizeEn) || '14cm – 18cm',
                  },
                  {
                    label: lang === 'zh' ? '商品来源' : 'Sourcing Link',
                    value: product.purchaseUrl ? (
                      <a href={product.purchaseUrl} target="_blank" rel="noopener noreferrer" className="text-gold-primary hover:underline">
                        {lang === 'zh' ? '点击查看' : 'Click to view'}
                      </a>
                    ) : null,
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
              { icon: <Sparkles className="w-4 h-4 text-gold-secondary flex-shrink-0" />, text: lang === 'zh' ? '手工细致清洁' : 'Hand-Cleaned & Polished' },
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
              {lang === 'zh' ? '设计与寓意' : 'Design & Meaning'}
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
                  ? '每件商品出货前均经过细致的手工清洁与声波清洗，确保展现矿石天然纯净品质。'
                  : 'Every item is carefully hand-cleaned and ultrasonic-cleansed before shipping to ensure its pure, natural quality.')}
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
          <p className="text-xs text-zinc-500 leading-relaxed">
            {(lang === 'zh' ? product.sizingDescZh : product.sizingDescEn) || dict.product.sizingDesc}
          </p>
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
                  {getSettingL('detail_review_subtext', lang, lang === 'zh' ? '真实买家购买后的真实评价，百分百真实可信。' : 'Authentic reviews from verified buyers.')}
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

      {/* ── Original Image Lightbox Overlay ── */}
      {isLightboxOpen && (
        <div 
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex flex-col items-center justify-center select-none"
          onClick={() => {
            setIsLightboxOpen(false);
            handleLightboxReset();
          }}
        >
          {/* Close Button (Top Right) */}
          <button
            onClick={() => {
              setIsLightboxOpen(false);
              handleLightboxReset();
            }}
            className="absolute top-6 right-6 text-zinc-400 hover:text-gold-primary p-2 transition-colors z-50 bg-zinc-900/40 border border-zinc-800 rounded-full hover:bg-zinc-900/80 cursor-pointer"
            aria-label="Close original view"
          >
            <X className="w-6 h-6" />
          </button>

          {/* Zoom Control Panel (Bottom Center) */}
          <div 
            className="absolute bottom-6 sm:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-zinc-900/85 border border-gold-primary/20 px-4 py-2 rounded-full backdrop-blur-sm shadow-lg z-50"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={handleLightboxZoomOut}
              disabled={lightboxScale <= 1}
              className="text-zinc-400 hover:text-gold-primary disabled:text-zinc-700 disabled:hover:text-zinc-700 transition-colors p-1 cursor-pointer"
              title={lang === 'zh' ? '缩小' : 'Zoom Out'}
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <span className="text-[10px] text-zinc-300 font-mono tracking-widest min-w-[32px] text-center select-none">
              {Math.round(lightboxScale * 100)}%
            </span>
            <button
              onClick={handleLightboxZoomIn}
              disabled={lightboxScale >= 3.5}
              className="text-zinc-400 hover:text-gold-primary disabled:text-zinc-700 disabled:hover:text-zinc-700 transition-colors p-1 cursor-pointer"
              title={lang === 'zh' ? '放大' : 'Zoom In'}
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="w-px h-3 bg-zinc-700" />
            <button
              onClick={handleLightboxReset}
              disabled={lightboxScale === 1 && lightboxPos.x === 0 && lightboxPos.y === 0}
              className="text-zinc-400 hover:text-gold-primary disabled:text-zinc-700 disabled:hover:text-zinc-700 transition-colors p-1 cursor-pointer"
              title={lang === 'zh' ? '重置' : 'Reset'}
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
 
          {/* Navigation Arrows */}
          {images.length > 1 && (
            <>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
                  handleLightboxReset();
                }}
                className="absolute left-6 text-zinc-400 hover:text-gold-primary p-3 transition-colors z-50 bg-zinc-900/40 border border-zinc-800 rounded-full hover:bg-zinc-900/80 cursor-pointer"
                aria-label="Previous image"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1));
                  handleLightboxReset();
                }}
                className="absolute right-6 text-zinc-400 hover:text-gold-primary p-3 transition-colors z-50 bg-zinc-900/40 border border-zinc-800 rounded-full hover:bg-zinc-900/80 cursor-pointer"
                aria-label="Next image"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            </>
          )}
 
          {/* Original Image Container */}
          <div 
            className="relative max-w-[90vw] max-h-[82vh] overflow-hidden flex flex-col items-center justify-center"
            onClick={(e) => e.stopPropagation()}
          >
            <img
              src={images[lightboxIndex]}
              alt={name}
              style={{
                transform: `translate(${lightboxPos.x}px, ${lightboxPos.y}px) scale(${lightboxScale})`,
                cursor: lightboxScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'zoom-in',
                transition: isDragging ? 'none' : 'transform 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
                touchAction: lightboxScale > 1 ? 'none' : 'auto',
              }}
              onMouseDown={handleLightboxMouseDown}
              onMouseMove={handleLightboxMouseMove}
              onMouseUp={handleLightboxMouseUp}
              onMouseLeave={handleLightboxMouseUp}
              onTouchStart={handleLightboxTouchStart}
              onTouchMove={handleLightboxTouchMove}
              onTouchEnd={handleLightboxMouseUp}
              onClick={() => {
                if (hasDraggedRef.current) {
                  return;
                }
                if (lightboxScale === 1) {
                  setLightboxScale(2);
                } else {
                  handleLightboxReset();
                }
              }}
              className="max-w-[90vw] max-h-[75vh] object-contain rounded-lg shadow-2xl border border-gold-primary/10 select-none pointer-events-auto"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop';
              }}
            />
            {/* Image Index Caption */}
            {images.length > 0 && (
              <span className="text-zinc-500 text-xs tracking-widest mt-4 block select-none">
                {lightboxIndex + 1} / {images.length}
              </span>
            )}
          </div>
        </div>
      )}
      </div>
  );
};
