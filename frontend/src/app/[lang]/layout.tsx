'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, X, Globe, Plus, Minus, Trash2, ArrowRight } from 'lucide-react';
import { CartProvider, useCart } from '../../context/CartContext';
import { getDictionary } from '../../lib/dictionary';

// Subcomponent for Telemetry
const Telemetry: React.FC = () => {
  const pathname = usePathname();

  useEffect(() => {
    const logPageView = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api';
        await fetch(`${apiUrl}/logs/client`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            level: 'info',
            message: `Visitor landed on page: ${pathname}`,
            url: window.location.href,
            userAgent: navigator.userAgent,
          }),
        });
      } catch (err) {
        console.warn('Telemetry logging failed', err);
      }
    };
    logPageView();
  }, [pathname]);

  return null;
};

// Navbar & Drawer Layout wrapper
const LayoutShell: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const params = useParams();
  const router = useRouter();
  const pathname = usePathname();
  const lang = (params?.lang as 'zh' | 'en') || 'zh';

  const [dict, setDict] = useState<any>(null);
  const [isCartOpen, setIsCartOpen] = useState(false);

  const { cart, removeFromCart, updateQuantity, cartCount, cartTotal } = useCart();

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

  // Toggle language between zh and en
  const toggleLanguage = () => {
    const segments = pathname.split('/');
    segments[1] = lang === 'zh' ? 'en' : 'zh';
    const newPath = segments.join('/');
    document.cookie = `lang=${segments[1]}; path=/; max-age=31536000`;
    router.push(newPath);
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#121212] text-[#FAF9F6]">
      {/* Slogan Banner */}
      <div className="bg-[#0D0D0D] border-b border-gold-primary/10 text-center py-2 px-4 text-xs tracking-widest text-gold-secondary font-serif uppercase">
        {dict.hero.motto}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#121212]/90 backdrop-blur-md border-b border-gold-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${lang}`} className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-bold font-serif tracking-widest text-gold-primary gold-text-gradient">
              FluxBless
            </span>
            <span className="text-[9px] tracking-[0.2em] uppercase text-gold-secondary font-serif text-center sm:text-left mt-0.5">
              Let energy flow
            </span>
          </Link>

          {/* Nav Links */}
          <nav className="hidden md:flex space-x-8 text-sm tracking-widest uppercase">
            <Link href={`/${lang}`} className="text-cream hover:text-gold-primary transition-colors">
              {dict.nav.home}
            </Link>
            <Link href={`/${lang}#catalog`} className="text-cream hover:text-gold-primary transition-colors">
              {dict.nav.shop}
            </Link>
            <Link href={`http://localhost:5173`} target="_blank" className="text-gold-secondary hover:text-gold-primary transition-colors">
              {dict.nav.admin}
            </Link>
          </nav>

          {/* Action buttons */}
          <div className="flex items-center space-x-4 sm:space-x-6">
            {/* Language toggle */}
            <button
              onClick={toggleLanguage}
              className="flex items-center space-x-1 text-sm text-gold-secondary hover:text-gold-primary border border-gold-primary/20 hover:border-gold-primary/50 rounded-full px-3 py-1 transition-all"
              aria-label="Toggle language"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="text-xs uppercase font-medium">{lang === 'zh' ? 'English' : '中文'}</span>
            </button>

            {/* Cart Icon */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative p-2 text-gold-primary hover:text-gold-light transition-colors"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-6 h-6" />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gold-dark text-black text-[10px] font-bold w-5 h-5 flex items-center justify-center rounded-full border border-black animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Footer */}
      <footer className="bg-[#0D0D0D] border-t border-gold-primary/10 py-12 px-4 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <h3 className="font-serif text-lg text-gold-primary tracking-widest mb-4">FluxBless</h3>
            <p className="text-zinc-500 leading-relaxed max-w-sm">
              {dict.hero.description}
            </p>
          </div>
          <div>
            <h4 className="font-serif text-gold-secondary tracking-widest mb-4 uppercase">
              {dict.nav.shop}
            </h4>
            <div className="grid grid-cols-2 gap-2 text-zinc-400">
              <Link href={`/${lang}#catalog`} className="hover:text-gold-primary transition-colors">
                {dict.categories['agate-accessories']}
              </Link>
              <Link href={`/${lang}#catalog`} className="hover:text-gold-primary transition-colors">
                {dict.categories['five-elements-beads']}
              </Link>
              <Link href={`/${lang}#catalog`} className="hover:text-gold-primary transition-colors">
                {dict.categories['colored-glaze-bracelets']}
              </Link>
              <Link href={`/${lang}#catalog`} className="hover:text-gold-primary transition-colors">
                {dict.categories['cinnabar-bracelets']}
              </Link>
            </div>
          </div>
          <div>
            <h4 className="font-serif text-gold-secondary tracking-widest mb-4 uppercase">
              Contact
            </h4>
            <p className="text-zinc-500 mb-2">Email: contact@fluxbless.com</p>
            <p className="text-zinc-500">© 2026 FluxBless. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* Cart Drawer Panel */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden" role="dialog" aria-modal="true">
          <div className="absolute inset-0 overflow-hidden">
            {/* Backdrop */}
            <div
              className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
              onClick={() => setIsCartOpen(false)}
            />

            {/* Slide-over Container */}
            <div className="pointer-events-none fixed inset-y-0 right-0 flex max-w-full pl-10">
              <div className="pointer-events-auto w-screen max-w-md gold-glass text-cream shadow-2xl flex flex-col h-full border-l border-gold-primary/20">
                {/* Header */}
                <div className="px-6 py-6 border-b border-gold-primary/10 flex items-center justify-between">
                  <h2 className="text-lg font-serif tracking-widest text-gold-primary uppercase">
                    {dict.cart.title}
                  </h2>
                  <button
                    onClick={() => setIsCartOpen(false)}
                    className="text-zinc-400 hover:text-gold-primary p-2 rounded-full hover:bg-white/5 transition-all"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Items List */}
                <div className="flex-1 overflow-y-auto py-6 px-6 space-y-6">
                  {cart.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center">
                      <ShoppingBag className="w-12 h-12 text-zinc-600 mb-4 stroke-1" />
                      <p className="text-zinc-500 tracking-wider text-sm">{dict.cart.empty}</p>
                      <button
                        onClick={() => setIsCartOpen(false)}
                        className="mt-6 text-xs text-gold-primary hover:text-gold-light border-b border-gold-primary/50 hover:border-gold-primary pb-1 uppercase tracking-widest"
                      >
                        {dict.cart.keepShopping}
                      </button>
                    </div>
                  ) : (
                    cart.map((item) => (
                      <div key={item.id} className="flex space-x-4 border-b border-gold-primary/5 pb-6">
                        <div className="w-20 h-20 bg-zinc-900 rounded-lg overflow-hidden border border-gold-primary/10 flex-shrink-0 relative">
                          <img
                            src={item.image}
                            alt={lang === 'zh' ? item.nameZh : item.nameEn}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              // Fallback image generator or placeholder
                              e.currentTarget.src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=200&auto=format&fit=crop';
                            }}
                          />
                        </div>
                        <div className="flex-1 flex flex-col justify-between text-sm">
                          <div>
                            <h3 className="font-medium text-cream line-clamp-1">
                              {lang === 'zh' ? item.nameZh : item.nameEn}
                            </h3>
                            <p className="text-gold-secondary mt-1 font-semibold">${item.price}</p>
                          </div>
                          <div className="flex items-center justify-between">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gold-primary/20 rounded-md bg-black/40 overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 px-2 text-zinc-400 hover:text-gold-primary hover:bg-white/5 transition-all"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 px-2 text-zinc-400 hover:text-gold-primary hover:bg-white/5 transition-all"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>

                            {/* Remove button */}
                            <button
                              onClick={() => removeFromCart(item.id)}
                              className="text-zinc-500 hover:text-red-400 p-1.5 transition-colors"
                              aria-label="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>

                {/* Footer Drawer */}
                {cart.length > 0 && (
                  <div className="px-6 py-6 border-t border-gold-primary/10 bg-black/40">
                    <div className="flex justify-between text-base font-serif tracking-wider mb-6">
                      <span className="text-zinc-400">{dict.cart.total}</span>
                      <span className="text-gold-primary font-bold">${cartTotal.toFixed(2)}</span>
                    </div>

                    <Link
                      href={`/${lang}/checkout`}
                      onClick={() => setIsCartOpen(false)}
                      className="w-full gold-gradient hover:gold-border-glow text-black font-semibold uppercase tracking-widest text-center py-4 rounded-lg flex items-center justify-center space-x-2 transition-all hover:scale-[1.01]"
                    >
                      <span>{dict.cart.checkout}</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default function LocalizedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <CartProvider>
      <Telemetry />
      <LayoutShell>{children}</LayoutShell>
    </CartProvider>
  );
}
