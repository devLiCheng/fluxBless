'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { Sparkles, Home, ShieldCheck } from 'lucide-react';
import { getDictionary } from '../../../../lib/dictionary';

export default function SuccessPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const lang = (params?.lang as 'zh' | 'en') || 'zh';
  const sessionId = searchParams.get('session_id') || '';

  const [dict, setDict] = useState<any>(null);

  useEffect(() => {
    getDictionary(lang).then(setDict);
  }, [lang]);

  if (!dict) {
    return (
      <div className="flex-1 flex items-center justify-center bg-black min-h-screen">
        <div className="w-10 h-10 border-4 border-gold-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-24 px-4 bg-[#121212] min-h-[80vh] relative overflow-hidden">
      {/* Ripple Animation Container */}
      <div className="relative w-64 h-64 mb-12 flex items-center justify-center">
        {/* Rippling Circles */}
        <div className="absolute w-48 h-48 rounded-full border-2 border-gold-primary/30 ripple-circle"></div>
        <div className="absolute w-48 h-48 rounded-full border-2 border-gold-primary/20 ripple-circle-delayed"></div>

        {/* Central Core */}
        <div className="w-32 h-32 rounded-full gold-glass border border-gold-primary/40 flex items-center justify-center shadow-lg shadow-gold-primary/20 relative z-10 animate-pulse">
          <Sparkles className="w-16 h-16 text-gold-primary" />
        </div>
      </div>

      {/* Blessing Cards */}
      <div className="max-w-2xl text-center space-y-6 relative z-10 px-4">
        <h1 className="text-3xl sm:text-4xl font-serif tracking-widest text-gold-primary gold-text-gradient uppercase leading-tight">
          {dict.success.title}
        </h1>

        <div className="text-zinc-400 text-sm leading-relaxed max-w-lg mx-auto space-y-4">
          <p>{dict.success.message1}</p>
          <p className="text-xs text-zinc-500">{dict.success.message2}</p>
        </div>

        {/* Spiritual Blessing Card */}
        <div className="gold-glass max-w-md mx-auto p-6 rounded-xl border border-gold-primary/30 mt-8 relative">
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-[#121212] px-3 text-[10px] tracking-[0.2em] text-gold-primary uppercase font-serif">
            Aura Blessing
          </div>
          <p className="text-sm font-serif italic text-gold-secondary leading-relaxed tracking-wider">
            &ldquo;{dict.success.blessing}&rdquo;
          </p>
        </div>

        {/* Action row */}
        <div className="pt-8">
          <button
            onClick={() => router.push(`/${lang}`)}
            className="inline-flex items-center space-x-2 gold-gradient hover:gold-border-glow text-black font-bold uppercase tracking-widest px-8 py-4 rounded-full transition-all hover:scale-105"
          >
            <Home className="w-4 h-4" />
            <span>{dict.success.goHome}</span>
          </button>
        </div>
      </div>

      {/* Background soft lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gold-primary/5 rounded-full blur-[140px] pointer-events-none z-0"></div>
    </div>
  );
}
