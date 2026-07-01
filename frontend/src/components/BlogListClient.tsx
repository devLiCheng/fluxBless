'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Calendar, Clock, ArrowRight } from 'lucide-react';

interface BlogPost {
  id: number;
  titleZh: string;
  titleEn: string;
  slug: string;
  summaryZh: string;
  summaryEn: string;
  coverImage?: string | null;
  author: string;
  readTime: number;
  createdAt: string;
}

interface BlogListClientProps {
  initialPosts: BlogPost[];
  lang: 'zh' | 'en';
  hasMoreInitial: boolean;
}

export const BlogListClient: React.FC<BlogListClientProps> = ({
  initialPosts,
  lang,
  hasMoreInitial,
}) => {
  const [posts, setPosts] = useState<BlogPost[]>(initialPosts);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(hasMoreInitial);
  const [loading, setLoading] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const getFullImageUrl = (url?: string | null) => {
    if (!url) return 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?q=80&w=800&auto=format&fit=crop';
    if (url.startsWith('http://') || url.startsWith('https://')) return url;
    // Relative URL from API uploads
    const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
    if (apiBase.startsWith('http')) {
      const origin = new URL(apiBase).origin;
      return `${origin}${url}`;
    }
    return url;
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const loadMorePosts = async () => {
    if (loading || !hasMore) return;
    setLoading(true);
    const nextPage = page + 1;
    try {
      const apiBase = process.env.NEXT_PUBLIC_API_URL || '/api';
      const res = await fetch(`${apiBase}/blog-posts?page=${nextPage}&limit=6`);
      if (res.ok) {
        const data = await res.json();
        const newPosts = data.items || [];
        if (newPosts.length === 0) {
          setHasMore(false);
        } else {
          setPosts((prev) => [...prev, ...newPosts]);
          setPage(nextPage);
          if (newPosts.length < 6) {
            setHasMore(false);
          }
        }
      } else {
        setHasMore(false);
      }
    } catch (err) {
      console.warn('Failed to load more blog posts', err);
      setHasMore(false);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const sentinel = sentinelRef.current;
    if (!sentinel) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore) {
          loadMorePosts();
        }
      },
      { rootMargin: '200px' }
    );

    observer.observe(sentinel);
    return () => {
      if (sentinel) observer.unobserve(sentinel);
    };
  }, [page, hasMore, loading]);

  return (
    <div className="flex flex-col">
      {/* Waterfall Masonry Layout using CSS Columns */}
      <div className="masonry-grid gap-6">
        {posts.map((post) => {
          const title = lang === 'zh' ? post.titleZh : post.titleEn;
          const summary = lang === 'zh' ? post.summaryZh : post.summaryEn;

          return (
            <article
              key={post.id}
              className="masonry-item bg-white border border-gold-primary/10 rounded-lg overflow-hidden group hover:border-gold-primary/30 transition-all duration-300 flex flex-col hover:shadow-[0_12px_40px_rgba(184,144,71,0.06)]"
            >
              {/* Cover image wrap */}
              <Link href={`/${lang}/blog/${post.slug}`} className="relative block overflow-hidden aspect-[16/10]">
                <img
                  src={getFullImageUrl(post.coverImage)}
                  alt={title}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  loading="lazy"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60"></div>
              </Link>

              {/* Card info */}
              <div className="p-6 flex-1 flex flex-col justify-between">
                <div>
                  {/* Meta items */}
                  <div className="flex items-center space-x-4 text-[10px] text-zinc-500 font-serif tracking-wider mb-3">
                    <span className="flex items-center space-x-1">
                      <Calendar className="w-3.5 h-3.5 text-gold-secondary" />
                      <span>{formatDate(post.createdAt)}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="w-3.5 h-3.5 text-gold-secondary" />
                      <span>{post.readTime} {lang === 'zh' ? '分钟阅读' : 'min read'}</span>
                    </span>
                  </div>

                  {/* Title & summary */}
                  <h3 className="font-serif text-lg text-gold-primary tracking-wide mb-3 line-clamp-2 hover:text-gold-secondary transition-colors">
                    <Link href={`/${lang}/blog/${post.slug}`}>{title}</Link>
                  </h3>

                  <p className="text-xs text-zinc-400 leading-relaxed mb-6 line-clamp-3 font-light tracking-wide">
                    {summary}
                  </p>
                </div>

                {/* Read more button link */}
                <div className="border-t border-gold-primary/5 pt-4">
                  <Link
                    href={`/${lang}/blog/${post.slug}`}
                    className="inline-flex items-center space-x-2 text-[10px] tracking-[0.2em] font-serif uppercase text-gold-secondary hover:text-gold-primary transition-colors"
                  >
                    <span>{lang === 'zh' ? '阅读全文' : 'Read Article'}</span>
                    <ArrowRight className="w-3.5 h-3.5 transform group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Infinite scrolling sentinel and spinner */}
      <div ref={sentinelRef} className="py-12 flex justify-center items-center">
        {loading && (
          <div className="flex items-center space-x-2 text-gold-secondary font-serif text-xs tracking-widest uppercase">
            <span className="w-1.5 h-1.5 bg-gold-primary rounded-full animate-ping"></span>
            <span>{lang === 'zh' ? '加载更多文章...' : 'Loading posts...'}</span>
          </div>
        )}
        {!hasMore && posts.length > 0 && (
          <p className="text-zinc-600 text-xs tracking-widest uppercase font-serif">
            {lang === 'zh' ? '— 终点 —' : '— End of Blog —'}
          </p>
        )}
      </div>

    </div>
  );
};
