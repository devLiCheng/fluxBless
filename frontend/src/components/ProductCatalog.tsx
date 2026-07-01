'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ShoppingCart, Eye, Sparkles } from 'lucide-react';
import { useCart } from '../context/CartContext';

interface Product {
  id: number;
  nameZh: string;
  nameEn: string;
  descriptionZh: string;
  descriptionEn: string;
  price: number;
  stock: number;
  images: any; // string or array of strings
  categoryId: number;
  category: {
    slug: string;
    nameZh: string;
    nameEn: string;
  };
  tagsZh?: string | null;
  tagsEn?: string | null;
}

interface ProductCatalogProps {
  products: Product[];
  dict: any;
  lang: 'zh' | 'en';
}

export const ProductCatalog: React.FC<ProductCatalogProps> = ({ products, dict, lang }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const { addToCart } = useCart();

  const categories = [
    { slug: 'all', name: dict.categories.all },
    { slug: 'agate-accessories', name: dict.categories['agate-accessories'] },
    { slug: 'five-elements-beads', name: dict.categories['five-elements-beads'] },
    { slug: 'colored-glaze-bracelets', name: dict.categories['colored-glaze-bracelets'] },
    { slug: 'cinnabar-bracelets', name: dict.categories['cinnabar-bracelets'] },
    { slug: 'prayer-beads', name: dict.categories['prayer-beads'] },
    { slug: 'white-jade', name: dict.categories['white-jade'] },
  ];

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

  // Parse images helper
  const getProductImage = (images: any): string => {
    try {
      let rawUrl = '';
      if (Array.isArray(images)) {
        rawUrl = images[0];
      } else if (typeof images === 'string') {
        const parsed = JSON.parse(images);
        if (Array.isArray(parsed)) rawUrl = parsed[0];
        else rawUrl = images;
      }
      return getFullImageUrl(rawUrl || 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop');
    } catch {
      return 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=600&auto=format&fit=crop';
    }
  };

  // Filter products
  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category.slug === selectedCategory;
    const name = lang === 'zh' ? p.nameZh : p.nameEn;
    const desc = lang === 'zh' ? p.descriptionZh : p.descriptionEn;
    const matchesSearch =
      name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      desc.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="catalog" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 mb-12 border-b border-gold-primary/10 pb-8">
        {/* Category tags */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-4 md:pb-0 scrollbar-none scroll-smooth w-full max-w-full min-w-0">
          {categories.map((cat) => (
            <button
              key={cat.slug}
              onClick={() => setSelectedCategory(cat.slug)}
              className={`whitespace-nowrap px-4 py-2 text-xs tracking-widest uppercase border rounded-full transition-all duration-300 ${
                selectedCategory === cat.slug
                  ? 'bg-gold-primary border-gold-primary text-black font-semibold'
                  : 'border-gold-primary/20 text-zinc-400 hover:text-gold-primary hover:border-gold-primary/40'
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Search Input */}
        <div className="relative max-w-xs w-full">
          <input
            type="text"
            placeholder={lang === 'zh' ? '搜索精选手串...' : 'Search accessories...'}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#1A1A1A] border border-gold-primary/20 hover:border-gold-primary/40 focus:border-gold-primary text-sm text-cream px-4 py-2.5 rounded-full focus:outline-none transition-colors"
          />
        </div>
      </div>

      {/* Grid Wrapper to prevent page height collapse and layout shift */}
      <div className="min-h-[600px]">
        {filteredProducts.length === 0 ? (
          <div className="min-h-[500px] flex flex-col items-center justify-center text-center">
            <p className="text-zinc-500 tracking-wider">
              {lang === 'zh' ? '未找到符合条件的精致配饰' : 'No matching items found'}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-8">
            {filteredProducts.map((p) => {
              const imageSrc = getProductImage(p.images);
              const name = lang === 'zh' ? p.nameZh : p.nameEn;

              return (
                <div
                  key={p.id}
                  className="group relative bg-[#1A1A1A] border border-gold-primary/10 hover:border-gold-primary/30 rounded-2xl overflow-hidden transition-all duration-300 flex flex-col justify-between"
                >
                  {/* Image & Badges */}
                  <div className="aspect-square bg-zinc-900 overflow-hidden relative">
                    <img
                      src={imageSrc}
                      alt={name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=800&auto=format&fit=crop';
                      }}
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center space-x-4">
                      <Link
                        href={`/${lang}/products/${p.id}`}
                        className="p-3 bg-black/80 hover:bg-gold-primary text-cream hover:text-black rounded-full border border-gold-primary/30 transition-all scale-90 group-hover:scale-100 duration-300"
                        title={dict.product.details}
                      >
                        <Eye className="w-5 h-5" />
                      </Link>
                      <button
                        onClick={() =>
                          addToCart({
                            id: p.id,
                            nameZh: p.nameZh,
                            nameEn: p.nameEn,
                            price: p.price,
                            image: imageSrc,
                            stock: p.stock,
                          })
                        }
                        className="p-3 bg-gold-primary hover:bg-gold-light text-black rounded-full border border-gold-primary/30 transition-all scale-90 group-hover:scale-100 duration-300"
                        title={dict.product.addToCart}
                      >
                        <ShoppingCart className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Dynamic tags overlay */}
                    {(() => {
                      const tagsStr = lang === 'zh' ? p.tagsZh : p.tagsEn;
                      if (tagsStr && tagsStr.trim()) {
                        const tagList = tagsStr.split(',').map((t) => t.trim()).filter(Boolean);
                        return (
                          <div className="absolute top-4 left-4 flex flex-col gap-1 z-10">
                            {tagList.map((tag, idx) => (
                              <span key={idx} className="bg-black/85 backdrop-blur-sm text-gold-secondary text-[10px] tracking-widest px-2.5 py-1 rounded-full border border-gold-primary/20 flex items-center space-x-1 uppercase">
                                <Sparkles className="w-2.5 h-2.5 text-gold-primary" />
                                <span>{tag}</span>
                              </span>
                            ))}
                          </div>
                        );
                      }
                      return (
                        <span className="absolute top-4 left-4 bg-black/85 backdrop-blur-sm text-gold-secondary text-[10px] tracking-widest px-2.5 py-1 rounded-full border border-gold-primary/20 flex items-center space-x-1 uppercase z-10">
                          <Sparkles className="w-2.5 h-2.5 text-gold-primary animate-pulse" />
                          <span>{lang === 'zh' ? '精选' : 'Selected'}</span>
                        </span>
                      );
                    })()}
                  </div>

                  {/* Details */}
                  <div className="p-3 sm:p-5 flex flex-col justify-between flex-1">
                    <div className="mb-4">
                      <h3 className="text-sm text-cream font-medium line-clamp-1 mb-1 group-hover:text-gold-primary transition-colors">
                        {name}
                      </h3>
                      <p className="text-[11px] text-zinc-500 tracking-wider line-clamp-2 min-h-[2rem]">
                        {lang === 'zh' ? p.descriptionZh : p.descriptionEn}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-auto">
                      <span className="text-gold-primary font-bold text-base">${p.price}</span>
                      <span className="text-[10px] text-zinc-500 tracking-wider">
                        {p.stock > 0 ? dict.product.inStock : dict.product.outOfStock}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};
