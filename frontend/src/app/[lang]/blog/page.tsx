import React from 'react';
import { Metadata } from 'next';
import { getDictionary } from '../../../lib/dictionary';
import { BlogListClient } from '../../../components/BlogListClient';
import { Sparkles } from 'lucide-react';

interface Props {
  params: Promise<{ lang: 'zh' | 'en' }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const isZh = lang === 'zh';
  const siteUrl = process.env.FRONTEND_URL || 'https://fluxbless.com';
  const baseDomain = siteUrl.endsWith('/') ? siteUrl.slice(0, -1) : siteUrl;
  
  return {
    metadataBase: new URL(baseDomain),
    title: isZh 
      ? '东方美学专栏 & 手工手串配饰指南 | FluxBless 博客' 
      : 'Eastern Aesthetics Journal & Handcrafted Accessories | FluxBless Blog',
    description: isZh
      ? '探寻传统手作之美。FluxBless 官方博客为您分享古法琉璃、天然玛瑙、朱砂手串与和田白玉的文化背景、工艺流程、佩戴规范以及声波净化保养常识。'
      : 'Explore the beauty of traditional handcrafted jewelry. Learn about the cultural history, crafting methods, wearing guides, and caring tips for colored glaze, agate, cinnabar, and white jade accessories.',
    keywords: isZh
      ? '手串保养, 玛瑙文化, 琉璃工艺, 朱砂佩戴, 和田白玉, 东方美学, 传统手作'
      : 'bracelet care, agate history, ancient glaze beads, cinnabar meaning, Hetian white jade, Eastern aesthetics, handcrafted jewelry',
    alternates: {
      canonical: `/${lang}/blog`,
      languages: {
        'zh': `/zh/blog`,
        'en': `/en/blog`,
      },
    },
    openGraph: {
      title: isZh ? 'FluxBless 东方美学志' : 'FluxBless Aesthetics Journal',
      description: isZh ? '传统手工配饰背后的工艺故事与文化寓意' : 'The craft stories and cultural history behind traditional handcrafted jewelry',
      type: 'website',
    }
  };
}

export default async function BlogIndexPage({ params }: Props) {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  // Fetch initial posts (page 1, limit 6) from backend
  let initialPosts = [];
  let total = 0;
  
  try {
    const apiUrl = process.env.BACKEND_URL || 'http://backend:4000/api';
    const res = await fetch(`${apiUrl}/blog-posts?page=1&limit=6`, { next: { revalidate: 600 } });
    if (res.ok) {
      const data = await res.json();
      initialPosts = data.items || [];
      total = data.total || 0;
    }
  } catch (err) {
    console.warn('Could not load blog posts from backend API in Server Component. Rendering empty list.', err);
  }

  const hasMoreInitial = initialPosts.length < total;

  return (
    <div className="relative overflow-hidden bg-background py-16 sm:py-24 border-b border-gold-primary/5 min-h-screen">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        
        {/* Header section */}
        <header className="text-center max-w-3xl mx-auto flex flex-col items-center mb-16">
          <div className="inline-flex items-center space-x-2 border border-gold-primary/20 rounded-md px-4 py-1 bg-[#FAF9F5] mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-gold-primary animate-pulse" />
            <span className="text-[10px] sm:text-xs tracking-[0.2em] text-gold-secondary font-serif uppercase">
              {lang === 'zh' ? '东方美学志' : 'Aesthetics Journal'}
            </span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-serif tracking-widest text-gold-primary mb-4 uppercase">
            <span className="gold-text-gradient block">
              {lang === 'zh' ? '探寻传统手作美学' : 'Discover Traditional Handcraft'}
            </span>
          </h1>

          <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed tracking-wider max-w-xl font-light">
            {lang === 'zh'
              ? '汇集手串配饰的材料故事、古法琉璃与玉石玛瑙的制作工艺、佩戴讲究以及净化保养的实用常识。'
              : 'Discover stories of accessories, colored glaze artisanship, agate crystals, white jade aesthetics, and purification guides.'}
          </p>
        </header>

        {/* Blog Post List Client Container */}
        <main>
          <BlogListClient
            initialPosts={initialPosts}
            lang={lang}
            hasMoreInitial={hasMoreInitial}
          />
        </main>
      </div>

      {/* Decorative details */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-gold-primary/3 rounded-full blur-[150px] pointer-events-none z-0"></div>
    </div>
  );
}
