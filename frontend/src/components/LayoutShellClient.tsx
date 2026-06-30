'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, X, Globe, Plus, Minus, Trash2, ArrowRight, User, LogOut, Lock } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';

// Subcomponent for Telemetry
export const Telemetry: React.FC = () => {
  const pathname = usePathname();

  useEffect(() => {
    const logPageView = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        await fetch(`${apiUrl}/logger/pageview`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            path: pathname,
            referrer: document.referrer,
            screenSize: `${window.innerWidth}x${window.innerHeight}`,
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

interface LayoutShellClientProps {
  children: React.ReactNode;
  dict: any;
  lang: 'zh' | 'en';
}

export const LayoutShellClient: React.FC<LayoutShellClientProps> = ({
  children,
  dict,
  lang,
}) => {
  const router = useRouter();
  const pathname = usePathname();

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Auth modal state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const { cart, removeFromCart, updateQuantity, cartCount, cartTotal } = useCart();
  const { user, login, register, logout } = useAuth();
  const { getSetting, getSettingL } = useSettings();

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError('');
    setAuthSubmitting(true);
    try {
      if (authMode === 'login') {
        await login(authEmail, authPassword);
      } else {
        await register(authName, authEmail, authPassword);
      }
      setIsAuthOpen(false);
      setAuthPassword('');
      setAuthName('');
    } catch (err: any) {
      setAuthError(err.message || 'Authentication failed');
    } finally {
      setAuthSubmitting(false);
    }
  };

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
        {getSettingL('top_slogan', lang, dict.hero.motto)}
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#121212]/90 backdrop-blur-md border-b border-gold-primary/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href={`/${lang}`} className="flex flex-col">
            <span className="text-2xl sm:text-3xl font-bold font-serif tracking-widest text-gold-primary gold-text-gradient">
              {getSetting('header_logo_title', 'FluxBless')}
            </span>
            <span className="text-[9px] tracking-[0.2em] uppercase text-gold-secondary font-serif text-center sm:text-left mt-0.5">
              {getSetting('header_logo_subtitle', 'Eastern Aesthetics')}
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
          </nav>

          {/* Action buttons */}
          <div className="flex items-center space-x-6">
            {/* Language Switcher */}
            <button
              onClick={toggleLanguage}
              className="text-zinc-400 hover:text-gold-primary p-2 transition-colors flex items-center space-x-1 text-xs tracking-widest uppercase font-serif"
              aria-label="Switch Language"
            >
              <Globe className="w-4 h-4 text-gold-secondary" />
              <span className="hidden sm:inline">{lang === 'zh' ? 'English' : '中文'}</span>
            </button>

            {/* User Account Button */}
            {user ? (
              <div className="flex items-center space-x-4">
                <span className="text-xs text-zinc-400 font-medium hidden lg:inline">
                  {lang === 'zh' ? '您好, ' : 'Hello, '}{user.name}
                </span>
                <button
                  onClick={logout}
                  className="text-zinc-400 hover:text-red-400 p-2 transition-colors flex items-center space-x-1 text-xs"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setAuthMode('login');
                  setAuthError('');
                  setIsAuthOpen(true);
                }}
                className="text-zinc-400 hover:text-gold-primary p-2 transition-colors"
                aria-label="User Sign In"
              >
                <User className="w-4 h-4 text-gold-secondary" />
              </button>
            )}

            {/* Shopping Cart Button */}
            <button
              onClick={() => setIsCartOpen(true)}
              className="text-zinc-400 hover:text-gold-primary p-2 transition-colors relative flex items-center"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-5 h-5 text-gold-primary" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gold-primary text-black font-semibold text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#121212] animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main page wrapper */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Footer */}
      <footer className="bg-[#0D0D0D] border-t border-gold-primary/10 py-12 px-4 mt-auto">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
          <div>
            <h3 className="font-serif text-lg text-gold-primary tracking-widest mb-4">
              {getSetting('footer_logo_title', 'FluxBless')}
            </h3>
            <p className="text-zinc-500 leading-relaxed max-w-sm">
              {getSettingL('footer_desc', lang, dict.hero.description)}
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
            <p className="text-zinc-500 mb-2">Email: {getSetting('footer_contact_email', 'contact@fluxbless.com')}</p>
            <div className="mb-3">
              <Link href={`/${lang}/blog`} className="text-gold-primary hover:text-gold-secondary transition-colors text-xs font-serif tracking-widest uppercase">
                {lang === 'zh' ? '博客文章' : 'Our Blog'}
              </Link>
            </div>
            <p className="text-zinc-500">{getSettingL('footer_copyright', lang, '© 2026 FluxBless. All rights reserved.')}</p>
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

      {/* Auth Modal Panel */}
      {isAuthOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden" role="dialog" aria-modal="true">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/70 backdrop-blur-md transition-opacity"
            onClick={() => setIsAuthOpen(false)}
          />

          {/* Modal Box */}
          <div className="relative pointer-events-auto w-full max-w-sm gold-glass text-cream shadow-2xl border border-gold-primary/20 rounded-2xl mx-4 overflow-hidden z-10">
            {/* Header */}
            <div className="px-6 py-5 border-b border-gold-primary/10 flex items-center justify-between">
              <h2 className="text-base font-serif tracking-widest text-gold-primary uppercase">
                {authMode === 'login' ? (lang === 'zh' ? '用户登录' : 'User Login') : (lang === 'zh' ? '用户注册' : 'User Register')}
              </h2>
              <button
                onClick={() => setIsAuthOpen(false)}
                className="text-zinc-400 hover:text-gold-primary p-1.5 rounded-full hover:bg-white/5 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Form Content */}
            <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
              {authError && (
                <div className="bg-red-950/40 border border-red-500/40 text-red-300 text-xs px-4 py-3 rounded-lg">
                  {authError}
                </div>
              )}

              {authMode === 'register' && (
                <div>
                  <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                    {lang === 'zh' ? '昵称' : 'Full Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    className="w-full bg-black/60 border border-gold-primary/20 focus:border-gold-primary text-sm text-cream px-4 py-2.5 rounded-lg focus:outline-none"
                    placeholder={lang === 'zh' ? '请输入您的昵称' : 'Enter your name'}
                  />
                </div>
              )}

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                  {lang === 'zh' ? '电子邮箱' : 'Email Address'}
                </label>
                <input
                  type="email"
                  required
                  value={authEmail}
                  onChange={(e) => setAuthEmail(e.target.value)}
                  className="w-full bg-black/60 border border-gold-primary/20 focus:border-gold-primary text-sm text-cream px-4 py-2.5 rounded-lg focus:outline-none"
                  placeholder="name@example.com"
                />
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-1.5">
                  {lang === 'zh' ? '密码' : 'Password'}
                </label>
                <input
                  type="password"
                  required
                  minLength={6}
                  value={authPassword}
                  onChange={(e) => setAuthPassword(e.target.value)}
                  className="w-full bg-black/60 border border-gold-primary/20 focus:border-gold-primary text-sm text-cream px-4 py-2.5 rounded-lg focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full mt-2 gold-gradient hover:gold-border-glow text-black font-semibold uppercase tracking-widest py-3 rounded-lg flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] disabled:opacity-50"
              >
                <span>{authSubmitting ? (lang === 'zh' ? '处理中...' : 'Processing...') : (authMode === 'login' ? (lang === 'zh' ? '立即登录' : 'Sign In') : (lang === 'zh' ? '立即注册' : 'Sign Up'))}</span>
              </button>

              {/* Toggle Mode */}
              <div className="text-center pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode(authMode === 'login' ? 'register' : 'login');
                    setAuthError('');
                  }}
                  className="text-xs text-gold-secondary hover:text-gold-light border-b border-gold-primary/30 pb-0.5"
                >
                  {authMode === 'login'
                    ? (lang === 'zh' ? '没有账号？立即注册' : "Don't have an account? Sign Up")
                    : (lang === 'zh' ? '已有账号？立即登录' : 'Already have an account? Sign In')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
