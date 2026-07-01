'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, usePathname, useRouter } from 'next/navigation';
import { ShoppingBag, X, Globe, Plus, Minus, Trash2, ArrowRight, User, LogOut, Lock, Menu, Tag, Sparkles } from 'lucide-react';
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
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Slogan & Coupons state
  const [showSlogan, setShowSlogan] = useState(true);
  const [isCouponsOpen, setIsCouponsOpen] = useState(false);
  const [myCoupons, setMyCoupons] = useState<any[]>([]);
  const [couponsLoading, setCouponsLoading] = useState(false);
  const [couponClaimMsg, setCouponClaimMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Auth modal state
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [authEmail, setAuthEmail] = useState('');
  const [authPassword, setAuthPassword] = useState('');
  const [authName, setAuthName] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const { cart, removeFromCart, updateQuantity, cartCount, cartTotal } = useCart();
  const { user, token, login, register, logout } = useAuth();
  const { getSetting, getSettingL } = useSettings();

  const fetchMyCoupons = async () => {
    if (!token) return;
    setCouponsLoading(true);
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const cleanApiUrl = apiUrl.startsWith('/') || apiUrl.startsWith('http') ? apiUrl : '/' + apiUrl;
      const res = await fetch(`${cleanApiUrl}/coupons/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        setMyCoupons(data);
      }
    } catch (err) {
      console.warn('Failed to load claimed coupons', err);
    } finally {
      setCouponsLoading(false);
    }
  };

  const handleClaimCoupon = async (code: string) => {
    if (!code) return;
    const cleanCode = code.trim().toUpperCase();
    if (!token) {
      // Save code to claim after login
      sessionStorage.setItem('fluxbless_pending_coupon_claim', cleanCode);
      setAuthMode('login');
      setAuthError(lang === 'zh' ? '请先登录以领取您的促销优惠券！' : 'Please sign in first to claim your coupon!');
      setIsAuthOpen(true);
      return;
    }

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
      const cleanApiUrl = apiUrl.startsWith('/') || apiUrl.startsWith('http') ? apiUrl : '/' + apiUrl;
      const res = await fetch(`${cleanApiUrl}/coupons/claim`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ code: cleanCode }),
      });

      const data = await res.json();
      if (res.ok) {
        setCouponClaimMsg({
          type: 'success',
          text: lang === 'zh' 
            ? `领取成功！已获得 $${Number(data.coupon?.discountAmount || 0).toFixed(2)} 优惠券！`
            : `Claimed successfully! Received $${Number(data.coupon?.discountAmount || 0).toFixed(2)} coupon!`,
        });
        fetchMyCoupons();
      } else {
        setCouponClaimMsg({
          type: 'error',
          text: data.message || (lang === 'zh' ? '该优惠券不可重复领取或已过期' : 'This coupon code was already claimed or is expired'),
        });
      }
    } catch (err) {
      setCouponClaimMsg({
        type: 'error',
        text: lang === 'zh' ? '网络错误，请稍后重试' : 'Network error. Please try again later',
      });
    }

    setTimeout(() => {
      setCouponClaimMsg(null);
    }, 5000);
  };

  useEffect(() => {
    if (typeof window !== 'undefined') {
      if (localStorage.getItem('fluxbless_slogan_dismissed') === 'true') {
        setShowSlogan(false);
      }
    }
  }, []);

  useEffect(() => {
    if (user && token) {
      fetchMyCoupons();
      const pendingCode = sessionStorage.getItem('fluxbless_pending_coupon_claim');
      if (pendingCode) {
        sessionStorage.removeItem('fluxbless_pending_coupon_claim');
        handleClaimCoupon(pendingCode);
      }
    } else {
      setMyCoupons([]);
    }
  }, [user, token]);

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
    <div className="min-h-screen flex flex-col bg-background text-foreground">
      {/* Slogan Banner */}
      {showSlogan && getSettingL('top_slogan', lang, dict.hero.motto) && (() => {
        const sloganText = getSettingL('top_slogan', lang, dict.hero.motto);
        const sloganLinkUrl = getSetting('top_slogan_link_url');
        const sloganCouponCode = getSetting('top_slogan_link_coupon_code');

        const handleSloganClick = (e: React.MouseEvent) => {
          if (sloganCouponCode) {
            e.preventDefault();
            handleClaimCoupon(sloganCouponCode);
          } else if (sloganLinkUrl) {
            router.push(sloganLinkUrl);
          }
        };

        const dismissSlogan = (e: React.MouseEvent) => {
          e.stopPropagation();
          setShowSlogan(false);
          localStorage.setItem('fluxbless_slogan_dismissed', 'true');
        };

        return (
          <div 
            onClick={sloganCouponCode || sloganLinkUrl ? handleSloganClick : undefined}
            className={`bg-[#FAF9F5] border-b border-gold-primary/10 text-center py-2.5 px-10 text-xs tracking-widest text-gold-secondary font-serif uppercase relative flex items-center justify-center select-none ${
              sloganCouponCode || sloganLinkUrl ? 'cursor-pointer hover:bg-gold-light/10 transition-colors' : ''
            }`}
          >
            <div className="flex items-center justify-center space-x-2">
              {sloganCouponCode && <Tag className="w-3.5 h-3.5 text-gold-primary animate-pulse" />}
              <span>{sloganText}</span>
              {sloganCouponCode && (
                <span className="text-[9px] bg-gold-primary text-black px-1.5 py-0.5 rounded ml-2 font-sans font-bold normal-case tracking-normal">
                  {lang === 'zh' ? '点击直接领券' : 'Click to Claim'}
                </span>
              )}
            </div>
            <button 
              onClick={dismissSlogan}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-gold-primary p-1.5 transition-colors rounded-full hover:bg-black/5"
              title={lang === 'zh' ? '关闭提示' : 'Dismiss'}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })()}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-background/90 backdrop-blur-md border-b border-gold-primary/10">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
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
          <div className="flex items-center space-x-3 sm:space-x-6">
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
              <div className="flex items-center space-x-2 sm:space-x-4">
                <button
                  onClick={() => setIsCouponsOpen(true)}
                  className="text-zinc-400 hover:text-gold-primary p-2 transition-colors relative"
                  title={lang === 'zh' ? '我的优惠券' : 'My Coupons'}
                >
                  <Tag className="w-4 h-4 text-gold-secondary" />
                  {myCoupons.filter((c) => c.status === 'available').length > 0 && (
                    <span className="absolute top-1 right-1 w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
                  )}
                </button>
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
              className="text-zinc-400 hover:text-gold-primary p-2 relative flex items-center"
              aria-label="Open Cart"
            >
              <ShoppingBag className="w-5 h-5 text-gold-primary" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-gold-primary text-black font-semibold text-[9px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-[#121212] animate-pulse">
                  {cartCount}
                </span>
              )}
            </button>

            {/* Hamburger Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="text-zinc-400 hover:text-gold-primary p-2 md:hidden transition-colors flex items-center cursor-pointer"
              aria-label="Toggle Mobile Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5 text-gold-secondary" /> : <Menu className="w-5 h-5 text-gold-secondary" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Dropdown */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-[#161616] border-b border-gold-primary/10 px-6 py-4 flex flex-col space-y-4 text-sm tracking-widest uppercase animate-fadeIn z-30 relative">
          <Link
            href={`/${lang}`}
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-cream hover:text-gold-primary py-2 transition-colors border-b border-gold-primary/5 flex items-center justify-between"
          >
            <span>{dict.nav.home}</span>
            <ArrowRight className="w-3 h-3 text-gold-secondary" />
          </Link>
          <Link
            href={`/${lang}#catalog`}
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-cream hover:text-gold-primary py-2 transition-colors border-b border-gold-primary/5 flex items-center justify-between"
          >
            <span>{dict.nav.shop}</span>
            <ArrowRight className="w-3 h-3 text-gold-secondary" />
          </Link>
          <Link
            href={`/${lang}/blog`}
            onClick={() => setIsMobileMenuOpen(false)}
            className="text-cream hover:text-gold-primary py-2 transition-colors flex items-center justify-between"
          >
            <span>{lang === 'zh' ? '博客文章' : 'Blog'}</span>
            <ArrowRight className="w-3 h-3 text-gold-secondary" />
          </Link>
        </div>
      )}

      {/* Main page wrapper */}
      <main className="flex-1 flex flex-col">{children}</main>

      {/* Footer */}
      <footer className="bg-[#FAF9F5] border-t border-gold-primary/10 py-12 px-4 mt-auto">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 text-sm">
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
              <div className="pointer-events-auto w-screen max-w-md bg-white text-cream shadow-2xl flex flex-col h-full border-l border-gold-primary/25">
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
                        <div className="w-20 h-20 bg-zinc-100 rounded-lg overflow-hidden border border-gold-primary/10 flex-shrink-0 relative">
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
                          <div className="flex items-center justify-between mt-2">
                            {/* Quantity Controls */}
                            <div className="flex items-center border border-gold-primary/30 rounded-md bg-gold-light/20 overflow-hidden">
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                className="p-1 px-2 text-zinc-600 hover:text-gold-primary hover:bg-gold-primary/10 transition-all font-bold"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <span className="px-2 text-xs font-semibold text-zinc-800">{item.quantity}</span>
                              <button
                                onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                className="p-1 px-2 text-zinc-600 hover:text-gold-primary hover:bg-gold-primary/10 transition-all font-bold"
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
                  <div className="px-6 py-6 border-t border-gold-primary/20 bg-[#FAF9F5]">
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
                <div className="bg-red-50 border border-red-200 text-red-800 text-xs px-4 py-3 rounded-lg font-sans">
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
                    className="w-full bg-white border border-gold-primary/20 focus:border-gold-primary text-sm text-zinc-800 px-4 py-2.5 rounded-md focus:outline-none"
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
                  className="w-full bg-white border border-gold-primary/20 focus:border-gold-primary text-sm text-zinc-800 px-4 py-2.5 rounded-md focus:outline-none"
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
                  className="w-full bg-white border border-gold-primary/20 focus:border-gold-primary text-sm text-zinc-800 px-4 py-2.5 rounded-md focus:outline-none"
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

      {/* My Coupons Modal */}
      {isCouponsOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity duration-300">
          <div className="absolute inset-0" onClick={() => setIsCouponsOpen(false)} />
          <div className="bg-white border border-gold-primary/20 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden relative pointer-events-auto z-10 animate-fadeIn">
            {/* Header */}
            <div className="px-6 py-4 border-b border-gold-primary/10 flex items-center justify-between bg-[#FAF9F5]">
              <h3 className="text-sm font-serif tracking-widest text-gold-primary uppercase font-semibold flex items-center gap-2">
                <Tag className="w-4 h-4 text-gold-secondary" />
                {lang === 'zh' ? '我的优惠券' : 'My Coupons'}
              </h3>
              <button 
                onClick={() => setIsCouponsOpen(false)}
                className="text-zinc-400 hover:text-gold-primary p-1 rounded-full hover:bg-black/5 transition-all"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content List */}
            <div className="p-6">
              {couponsLoading ? (
                <div className="flex justify-center py-8">
                  <div className="w-6 h-6 border-2 border-gold-primary border-t-transparent rounded-full animate-spin"></div>
                </div>
              ) : myCoupons.length === 0 ? (
                <div className="text-center py-10">
                  <Tag className="w-10 h-10 text-zinc-300 mx-auto mb-3 stroke-1" />
                  <p className="text-zinc-500 text-xs tracking-wider">
                    {lang === 'zh' ? '暂无优惠券' : 'No coupons available'}
                  </p>
                </div>
              ) : (
                <div className="space-y-4 max-h-[350px] overflow-y-auto pr-1 scrollbar-none">
                  {myCoupons.map((c) => {
                    const isAvailable = c.status === 'available';
                    const isUsed = c.status === 'used';

                    return (
                      <div 
                        key={c.id} 
                        className={`border rounded-xl p-4 relative overflow-hidden transition-all ${
                          isAvailable 
                            ? 'bg-gradient-to-br from-white to-[#FAF9F5] border-gold-primary/25 hover:border-gold-primary/50 shadow-sm'
                            : 'bg-zinc-50/55 border-zinc-250 text-zinc-400 opacity-60 select-none'
                        }`}
                      >
                        <div className={`absolute left-0 top-0 bottom-0 w-1.5 ${isAvailable ? 'bg-gold-primary' : 'bg-zinc-300'}`}></div>

                        <div className="flex items-start justify-between pl-2">
                          <div>
                            <div className="flex items-baseline space-x-1">
                              <span className={`text-xl font-bold ${isAvailable ? 'text-gold-primary' : 'text-zinc-500'}`}>
                                ${Number(c.discountAmount).toFixed(0)}
                              </span>
                              <span className="text-[10px] text-zinc-400">USD</span>
                            </div>
                            <div className={`text-[10px] font-medium tracking-wide mt-1 ${isAvailable ? 'text-gold-secondary' : 'text-zinc-500'}`}>
                              {Number(c.minOrderAmount) > 0 
                                ? (lang === 'zh' ? `满 $${Number(c.minOrderAmount).toFixed(0)} 可用` : `Min Purchase $${Number(c.minOrderAmount).toFixed(0)}`)
                                : (lang === 'zh' ? '无门槛使用' : 'No Minimum Purchase')}
                            </div>
                          </div>

                          <div className="text-right">
                            <span className={`text-xs font-mono font-bold px-2 py-1 rounded border uppercase tracking-wider ${
                              isAvailable 
                                ? 'bg-gold-light/20 border-gold-primary/20 text-gold-secondary'
                                : 'bg-zinc-100 border-zinc-200 text-zinc-400'
                            }`}>
                              {c.code}
                            </span>
                          </div>
                        </div>

                        <div className="border-t border-gold-primary/5 mt-3 pt-2 pl-2 flex items-center justify-between text-[9px] text-zinc-400 font-serif">
                          <span>
                            {lang === 'zh' ? '有效期至：' : 'Expires: '}
                            {new Date(c.expiresAt).toLocaleDateString()}
                          </span>
                          <span className={`font-sans uppercase font-bold tracking-wider ${
                            isAvailable ? 'text-emerald-600' : isUsed ? 'text-zinc-400' : 'text-red-400'
                          }`}>
                            {isAvailable ? (lang === 'zh' ? '可用' : 'Available') : isUsed ? (lang === 'zh' ? '已使用' : 'Used') : (lang === 'zh' ? '已失效' : 'Expired')}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Coupon Claim Floating Toast Notification */}
      {couponClaimMsg && (
        <div className="fixed bottom-6 right-6 z-50 max-w-sm w-full bg-white border border-gold-primary/30 rounded-xl shadow-2xl p-4 backdrop-blur-md animate-fadeIn flex items-start space-x-3 pointer-events-auto">
          <div className="flex-1">
            <h4 className={`text-xs font-bold uppercase tracking-wider ${
              couponClaimMsg.type === 'success' ? 'text-emerald-600' : 'text-red-500'
            }`}>
              {couponClaimMsg.type === 'success' 
                ? (lang === 'zh' ? '优惠领用成功' : 'Coupon Claimed') 
                : (lang === 'zh' ? '领取遇到问题' : 'Claim Failed')}
            </h4>
            <p className="text-[11px] text-zinc-600 mt-1 font-serif leading-relaxed">
              {couponClaimMsg.text}
            </p>
          </div>
          <button onClick={() => setCouponClaimMsg(null)} className="text-zinc-400 hover:text-gold-primary">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
