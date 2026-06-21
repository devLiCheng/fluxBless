'use client';

import React, { useState } from 'react';
import { Sparkles, ShoppingCart, ArrowLeft, ShieldCheck, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { useCart } from '../context/CartContext';

interface Product {
  id: number;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  price: number;
  stock: number;
  images: any; // string array or stringified JSON
  categoryId: number;
  category: {
    slug: string;
    nameZh: string;
    nameEn: string;
  };
}

interface ProductDetailsProps {
  product: Product;
  dict: any;
  lang: 'zh' | 'en';
}

export const ProductDetails: React.FC<ProductDetailsProps> = ({ product, dict, lang }) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

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

  // Generate spiritual meaning fallback based on category/name if not provided separately
  const getSpiritualMeaning = () => {
    if (product.category.slug === 'agate-accessories') {
      return lang === 'zh'
        ? '玛瑙是佛教七宝之一，自古以来被当做辟邪物、护身符使用，象征友善的爱心和希望，有助于消除压力、疲劳、浊气等负性能量。'
        : 'Agate is one of the seven treasures of Buddhism. Since ancient times, it has been used as an amulet symbolizing friendly love and hope. It helps clear stress, fatigue, and negative energy.';
    }
    if (product.category.slug === 'five-elements-beads') {
      return lang === 'zh'
        ? '五行合香珠融合多种名贵香材，能调和五行能量，促进身心平衡。沉静悠远的香气有助于安神静心，招来福运与祥和之气。'
        : 'Five Elements incense beads blend precious herbs to harmonize personal elements and restore body-mind balance. The tranquil aroma calms the spirit and attracts good fortune and peace.';
    }
    if (product.category.slug === 'colored-glaze-bracelets') {
      return lang === 'zh'
        ? '琉璃被誉为佛教五大名器之首。古法琉璃工艺澄澈透明，象征纯洁的精神与辟邪转运。佩戴可增强感知力，聚福纳祥。'
        : 'Colored glaze is revered as the first of the five sacred treasures of Buddhism. Ancient glaze works are transparent, symbolizing spiritual purity, evil protection, and lucky turns.';
    }
    if (product.category.slug === 'cinnabar-bracelets') {
      return lang === 'zh'
        ? '朱砂具有极强的阳气，自古被视为驱邪化煞、镇惊安神的极品。佩戴朱砂手串可护佑身心安康，开启智慧与鸿运。'
        : 'Cinnabar possesses powerful Yang energy and is regarded as the ultimate amulet to expel negative spirits. Wearing it protects health, welcomes good fortune, and awakens wisdom.';
    }
    if (product.category.slug === 'white-jade') {
      return lang === 'zh'
        ? '白玉温润无瑕，象征高洁的品德与平安祥瑞。佩戴白玉配饰可平和情绪，滋养身心，化解生活中的波折，保佑一生平安。'
        : 'White jade is warm and flawless, symbolizing moral excellence, peace, and auspiciousness. Wearing it balances emotions, nourishes the spirit, and protects against life obstacles.';
    }
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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back link */}
      <Link
        href={`/${lang}#catalog`}
        className="inline-flex items-center space-x-2 text-zinc-400 hover:text-gold-primary transition-colors text-sm mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{lang === 'zh' ? '返回商品目录' : 'Back to Catalog'}</span>
      </Link>

      {/* Main Container */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
        {/* Images Grid */}
        <div className="space-y-4">
          <div className="aspect-square bg-zinc-900 border border-gold-primary/10 rounded-2xl overflow-hidden relative">
            <img
              src={images[selectedImageIndex]}
              alt={name}
              className="w-full h-full object-cover hover:scale-[1.08] transition-transform duration-500 cursor-zoom-in"
              onError={(e) => {
                e.currentTarget.src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop';
              }}
            />
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex space-x-4">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImageIndex(idx)}
                  className={`w-20 h-20 bg-zinc-900 border rounded-xl overflow-hidden transition-all ${
                    selectedImageIndex === idx
                      ? 'border-gold-primary scale-105'
                      : 'border-gold-primary/10 hover:border-gold-primary/40'
                  }`}
                >
                  <img
                    src={img}
                    alt={`${name} thumbnail ${idx}`}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=200&auto=format&fit=crop';
                    }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details Section */}
        <div className="flex flex-col">
          {/* Category */}
          <span className="text-gold-secondary text-xs uppercase tracking-[0.2em] font-serif mb-2">
            {lang === 'zh' ? product.category.nameZh : product.category.nameEn}
          </span>

          {/* Product Name */}
          <h1 className="text-3xl sm:text-4xl font-serif tracking-widest text-gold-primary gold-text-gradient mb-4 uppercase">
            {name}
          </h1>

          {/* Price & Stock */}
          <div className="flex items-center space-x-6 border-y border-gold-primary/10 py-4 mb-6">
            <span className="text-2xl font-bold text-gold-primary">${product.price}</span>
            <span className="text-xs text-zinc-400">
              {product.stock > 0 ? (
                <span className="text-emerald-400 font-medium">● {dict.product.inStock} ({product.stock})</span>
              ) : (
                <span className="text-red-400 font-medium">● {dict.product.outOfStock}</span>
              )}
            </span>
          </div>

          {/* Description */}
          <p className="text-zinc-400 text-sm leading-relaxed mb-6 tracking-wide">
            {description}
          </p>

          {/* Spiritual Meaning */}
          <div className="gold-glass gold-border-glow p-5 rounded-xl border border-gold-primary/20 mb-6">
            <h3 className="text-xs font-serif tracking-widest text-gold-primary flex items-center space-x-2 uppercase mb-2">
              <Sparkles className="w-4 h-4 text-gold-primary animate-pulse" />
              <span>{dict.product.spiritualMeaning}</span>
            </h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {getSpiritualMeaning()}
            </p>
          </div>

          {/* Sizing Guideline */}
          <div className="bg-[#1A1A1A] p-4 rounded-xl border border-gold-primary/5 mb-8">
            <h3 className="text-xs font-medium text-cream mb-1">{dict.product.sizeSpecs}</h3>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              {dict.product.sizingDesc}
            </p>
          </div>

          {/* Action Row */}
          {product.stock > 0 ? (
            <div className="flex items-center space-x-4 mt-auto">
              {/* Quantity selectors */}
              <div className="flex items-center border border-gold-primary/20 bg-black/40 rounded-lg overflow-hidden h-14">
                <button
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 text-zinc-400 hover:text-gold-primary hover:bg-white/5 transition-all h-full"
                >
                  -
                </button>
                <span className="px-4 text-sm font-semibold text-cream">{quantity}</span>
                <button
                  onClick={() => setQuantity((q) => Math.min(product.stock, q + 1))}
                  className="px-4 text-zinc-400 hover:text-gold-primary hover:bg-white/5 transition-all h-full"
                >
                  +
                </button>
              </div>

              {/* Add to Cart button */}
              <button
                onClick={handleAddToCart}
                className="flex-1 gold-gradient hover:gold-border-glow text-black font-bold uppercase tracking-widest rounded-lg h-14 flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
              >
                <ShoppingCart className="w-5 h-5" />
                <span>{dict.product.addToCart}</span>
              </button>
            </div>
          ) : (
            <button
              disabled
              className="w-full bg-zinc-800 text-zinc-500 font-semibold uppercase tracking-widest rounded-lg h-14 cursor-not-allowed"
            >
              {dict.product.outOfStock}
            </button>
          )}

          {/* Security Features */}
          <div className="grid grid-cols-2 gap-4 mt-8 pt-6 border-t border-gold-primary/5 text-[11px] text-zinc-500">
            <div className="flex items-center space-x-2">
              <ShieldCheck className="w-4 h-4 text-gold-secondary" />
              <span>{lang === 'zh' ? '安全加密支付' : 'Secured SSL Payments'}</span>
            </div>
            <div className="flex items-center space-x-2">
              <RefreshCw className="w-4 h-4 text-gold-secondary" />
              <span>{lang === 'zh' ? '能量开光净化' : 'Aura blessed & purified'}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
