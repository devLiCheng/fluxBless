import React from 'react';
import { Metadata } from 'next';
import Link from 'next/link';
import { getDictionary } from '../../../../lib/dictionary';
import { Calendar, Clock, ArrowLeft, User } from 'lucide-react';

interface Props {
  params: Promise<{ lang: 'zh' | 'en'; slug: string }>;
}

const getFullImageUrl = (url?: string | null) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  const apiBase = process.env.NEXT_PUBLIC_API_URL || '';
  if (apiBase.startsWith('http')) {
    const origin = new URL(apiBase).origin;
    return `${origin}${url}`;
  }
  return url;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang, slug } = await params;
  
  let post = null;
  try {
    const apiUrl = process.env.BACKEND_URL || 'http://backend:4000/api';
    const res = await fetch(`${apiUrl}/blog-posts/by-slug/${slug}`, { cache: 'no-store' });
    if (res.ok) {
      post = await res.json();
    }
  } catch (err) {
    console.error('Failed to load post metadata', err);
  }

  if (!post) {
    return {
      title: lang === 'zh' ? '文章未找到 - FluxBless' : 'Article Not Found - FluxBless',
    };
  }

  const title = lang === 'zh' ? post.titleZh : post.titleEn;
  const summary = lang === 'zh' ? post.summaryZh : post.summaryEn;
  const cover = post.coverImage ? getFullImageUrl(post.coverImage) : undefined;

  return {
    title: `${title} - FluxBless`,
    description: summary,
    openGraph: {
      title: title,
      description: summary,
      type: 'article',
      publishedTime: post.createdAt,
      modifiedTime: post.updatedAt,
      authors: [post.author],
      images: cover ? [{ url: cover }] : undefined,
    }
  };
}

export default async function BlogDetailPage({ params }: Props) {
  const { lang, slug } = await params;
  const dict = await getDictionary(lang);

  // Fetch article content server-side
  let post = null;
  try {
    const apiUrl = process.env.BACKEND_URL || 'http://backend:4000/api';
    const res = await fetch(`${apiUrl}/blog-posts/by-slug/${slug}`, { cache: 'no-store' });
    if (res.ok) {
      post = await res.json();
    }
  } catch (err) {
    console.warn(`Could not load blog post ${slug} from backend API.`, err);
  }

  if (!post) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center py-32 bg-[#121212] text-cream">
        <h2 className="text-xl font-serif tracking-widest text-gold-primary mb-4 uppercase">
          {lang === 'zh' ? '文章未找到' : 'Article Not Found'}
        </h2>
        <Link
          href={`/${lang}/blog`}
          className="text-xs text-zinc-400 hover:text-gold-primary border-b border-gold-primary/30 pb-1 tracking-widest uppercase"
        >
          {lang === 'zh' ? '返回文章列表' : 'Return to Blog'}
        </Link>
      </div>
    );
  }

  const title = lang === 'zh' ? post.titleZh : post.titleEn;
  const summary = lang === 'zh' ? post.summaryZh : post.summaryEn;
  const content = lang === 'zh' ? post.contentZh : post.contentEn;
  const coverImage = post.coverImage ? getFullImageUrl(post.coverImage) : null;

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString(lang === 'zh' ? 'zh-CN' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Construct JSON-LD Schema Markup
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    'headline': title,
    'description': summary,
    'image': coverImage || undefined,
    'datePublished': post.createdAt,
    'dateModified': post.updatedAt,
    'author': {
      '@type': 'Person',
      'name': post.author,
    },
    'publisher': {
      '@type': 'Organization',
      'name': 'FluxBless',
      'logo': {
        '@type': 'ImageObject',
        'url': getFullImageUrl('/logo.png'), // Fallback logo
      }
    },
    'mainEntityOfPage': {
      '@type': 'WebPage',
      '@id': `https://fluxbless.com/${lang}/blog/${post.slug}`,
    }
  };

  return (
    <div className="relative overflow-hidden bg-[#121212] py-16 sm:py-24 min-h-screen text-cream">
      {/* Schema Injection */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Back Link */}
        <div className="mb-8">
          <Link
            href={`/${lang}/blog`}
            className="inline-flex items-center space-x-2 text-[10px] tracking-[0.25em] font-serif uppercase text-zinc-500 hover:text-gold-primary transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>{lang === 'zh' ? '返回博客列表' : 'Back to Blog'}</span>
          </Link>
        </div>

        {/* Article Cover Banner */}
        {coverImage && (
          <div className="relative aspect-[21/9] rounded-xl overflow-hidden mb-12 border border-gold-primary/10">
            <img src={coverImage} alt={title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
          </div>
        )}

        {/* Article Header info */}
        <header className="mb-10">
          {/* Meta data */}
          <div className="flex flex-wrap gap-6 text-[10px] text-zinc-500 font-serif tracking-widest uppercase mb-4 border-b border-gold-primary/5 pb-4">
            <span className="flex items-center space-x-1.5">
              <User className="w-3.5 h-3.5 text-gold-secondary" />
              <span>{post.author}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Calendar className="w-3.5 h-3.5 text-gold-secondary" />
              <span>{formatDate(post.createdAt)}</span>
            </span>
            <span className="flex items-center space-x-1.5">
              <Clock className="w-3.5 h-3.5 text-gold-secondary" />
              <span>{post.readTime} {lang === 'zh' ? '分钟阅读' : 'min read'}</span>
            </span>
          </div>

          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-serif tracking-wide text-gold-primary leading-tight mb-6">
            {title}
          </h1>

          <p className="text-sm text-zinc-400 leading-relaxed font-light italic border-l-2 border-gold-primary/30 pl-4 py-1">
            {summary}
          </p>
        </header>

        {/* Content Body */}
        <article className="blog-content border-t border-gold-primary/5 pt-10">
          <div
            dangerouslySetInnerHTML={{ __html: content }}
          />
        </article>
      </div>

      {/* Decorative details */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-[700px] h-[700px] bg-gold-primary/2 rounded-full blur-[180px] pointer-events-none z-0"></div>
    </div>
  );
}
