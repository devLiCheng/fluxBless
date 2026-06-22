'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ShoppingBag, ArrowLeft, CreditCard, ShieldCheck } from 'lucide-react';
import { useCart } from '../../../context/CartContext';
import { getDictionary } from '../../../lib/dictionary';

export default function CheckoutPage() {
  const params = useParams();
  const router = useRouter();
  const lang = (params?.lang as 'zh' | 'en') || 'zh';

  const [dict, setDict] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [password, setPassword] = useState(''); // Only if email exists and needs password
  const [needPassword, setNeedPassword] = useState(false);

  const [paymentMethod, setPaymentMethod] = useState('stripe');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const { cart, cartTotal, clearCart } = useCart();

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

  if (cart.length === 0) {
    return (
      <div className="max-w-md mx-auto py-24 px-4 text-center">
        <ShoppingBag className="w-12 h-12 text-zinc-600 mx-auto mb-4" />
        <p className="text-zinc-500 mb-6">{dict.cart.empty}</p>
        <button
          onClick={() => router.push(`/${lang}`)}
          className="gold-gradient text-black font-semibold text-xs tracking-widest uppercase px-6 py-3 rounded-full hover:scale-105 transition-all"
        >
          {dict.cart.keepShopping}
        </button>
      </div>
    );
  }

  // Handle Checkout submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMsg('');

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';

    try {
      // 1. Frictionless login/registration
      let token = localStorage.getItem('fluxbless_token');

      if (!token) {
        // Try registering a guest account first
        const guestPassword = password || 'guestPassword123!';
        try {
          const regRes = await fetch(`${apiUrl}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email,
              password: guestPassword,
              name: fullName || 'Guest User',
            }),
          });

          if (regRes.ok) {
            const data = await regRes.json();
            token = data.access_token;
            localStorage.setItem('fluxbless_token', token || '');
          } else if (regRes.status === 409) {
            // Email conflicts, need login
            if (!password) {
              // Try auto-logging in with default guest password
              const logRes = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password: guestPassword }),
              });

              if (logRes.ok) {
                const data = await logRes.json();
                token = data.access_token;
                localStorage.setItem('fluxbless_token', token || '');
              } else {
                // Really exists, ask for custom password
                setNeedPassword(true);
                setIsSubmitting(false);
                setErrorMsg(lang === 'zh' ? '该邮箱已注册，请输入密码登录' : 'Email registered. Please enter password');
                return;
              }
            } else {
              // Custom password login
              const logRes = await fetch(`${apiUrl}/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
              });

              if (logRes.ok) {
                const data = await logRes.json();
                token = data.access_token;
                localStorage.setItem('fluxbless_token', token || '');
              } else {
                throw new Error(lang === 'zh' ? '登录密码错误，请重试' : 'Invalid password. Try again.');
              }
            }
          } else {
            throw new Error('Registration failed');
          }
        } catch (err: any) {
          throw new Error(err.message || 'Authentication error');
        }
      }

      // 2. Create Order
      const orderItems = cart.map((item) => ({
        productId: item.id,
        quantity: item.quantity,
      }));

      const orderRes = await fetch(`${apiUrl}/orders`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          items: orderItems,
          paymentMethod,
          shippingAddress: address,
          contactPhone: phone,
          contactEmail: email,
        }),
      });

      if (!orderRes.ok) {
        const errorData = await orderRes.json();
        throw new Error(errorData.message || 'Order creation failed');
      }

      const order = await orderRes.json();

      // 3. Initiate payment
      const successUrl = `${window.location.origin}/${lang}/checkout/success`;
      const cancelUrl = window.location.href;

      const payRes = await fetch(`${apiUrl}/payment/checkout/${order.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ successUrl, cancelUrl }),
      });

      if (!payRes.ok) {
        throw new Error('Payment session creation failed');
      }

      const paySession = await payRes.json();

      // Clear the local cart
      clearCart();

      // 4. Redirect to payment checkout url (Stripe or Mock fallback)
      if (paySession.url) {
        window.location.href = paySession.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (err: any) {
      console.error(err);
      setErrorMsg(err.message || dict.checkout.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* Back button */}
      <button
        onClick={() => router.back()}
        className="inline-flex items-center space-x-2 text-zinc-400 hover:text-gold-primary transition-colors text-sm mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>{lang === 'zh' ? '返回购物车' : 'Back to Cart'}</span>
      </button>

      <h1 className="text-3xl font-serif tracking-widest text-gold-primary gold-text-gradient mb-12 uppercase text-center md:text-left">
        {dict.checkout.title}
      </h1>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        {/* Checkout Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
          <div className="gold-glass p-6 sm:p-8 rounded-2xl border border-gold-primary/15 space-y-6">
            <h2 className="text-sm font-serif tracking-widest text-gold-secondary uppercase border-b border-gold-primary/10 pb-3">
              {dict.checkout.shipping}
            </h2>

            {errorMsg && (
              <div className="bg-red-950/40 border border-red-500/40 text-red-300 text-xs px-4 py-3 rounded-lg">
                {errorMsg}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
                  {dict.checkout.fullName}
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-black/60 border border-gold-primary/20 focus:border-gold-primary text-sm text-cream px-4 py-3 rounded-lg focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
                  {dict.checkout.phone}
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full bg-black/60 border border-gold-primary/20 focus:border-gold-primary text-sm text-cream px-4 py-3 rounded-lg focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
                {dict.checkout.email}
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black/60 border border-gold-primary/20 focus:border-gold-primary text-sm text-cream px-4 py-3 rounded-lg focus:outline-none"
              />
            </div>

            {needPassword && (
              <div>
                <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
                  {lang === 'zh' ? '登录密码' : 'Account Password'}
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-black/60 border border-gold-primary/20 focus:border-gold-primary text-sm text-cream px-4 py-3 rounded-lg focus:outline-none"
                />
              </div>
            )}

            <div>
              <label className="block text-xs uppercase tracking-wider text-zinc-400 mb-2">
                {dict.checkout.address}
              </label>
              <textarea
                required
                rows={3}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="w-full bg-black/60 border border-gold-primary/20 focus:border-gold-primary text-sm text-cream px-4 py-3 rounded-lg focus:outline-none resize-none"
              />
            </div>
          </div>

          {/* Payment Method */}
          <div className="gold-glass p-6 sm:p-8 rounded-2xl border border-gold-primary/15 space-y-6">
            <h2 className="text-sm font-serif tracking-widest text-gold-secondary uppercase border-b border-gold-primary/10 pb-3">
              Payment Method
            </h2>

            <div className="space-y-4">
              <label className="flex items-center justify-between p-4 bg-black/40 border border-gold-primary/20 rounded-xl cursor-pointer hover:border-gold-primary/50 transition-colors">
                <div className="flex items-center space-x-3">
                  <input
                    type="radio"
                    name="payment"
                    value="stripe"
                    checked={paymentMethod === 'stripe'}
                    onChange={() => setPaymentMethod('stripe')}
                    className="accent-gold-primary"
                  />
                  <div className="text-sm">
                    <span className="font-semibold block text-cream">Stripe</span>
                    <span className="text-[10px] text-zinc-500">Pay securely with Visa, MasterCard, Apple Pay</span>
                  </div>
                </div>
                <CreditCard className="w-5 h-5 text-gold-primary" />
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full gold-gradient hover:gold-border-glow text-black font-bold uppercase tracking-widest py-4 rounded-xl flex items-center justify-center space-x-2 transition-all hover:scale-[1.01] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isSubmitting ? dict.checkout.submitting : dict.checkout.payNow}</span>
          </button>
        </form>

        {/* Order Summary */}
        <div className="lg:col-span-5 space-y-6">
          <div className="gold-glass p-6 rounded-2xl border border-gold-primary/15">
            <h2 className="text-sm font-serif tracking-widest text-gold-primary uppercase border-b border-gold-primary/10 pb-3 mb-6">
              Order Summary
            </h2>

            <div className="divide-y divide-gold-primary/5 max-h-96 overflow-y-auto pr-2 space-y-4">
              {cart.map((item) => (
                <div key={item.id} className="flex space-x-4 pt-4 first:pt-0">
                  <div className="w-14 h-14 bg-zinc-900 border border-gold-primary/10 rounded-lg overflow-hidden flex-shrink-0">
                    <img
                      src={item.image}
                      alt={lang === 'zh' ? item.nameZh : item.nameEn}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.src = 'https://images.unsplash.com/photo-1599643478518-a784e5dc4c8f?q=80&w=200&auto=format&fit=crop';
                      }}
                    />
                  </div>
                  <div className="flex-1 text-xs">
                    <h3 className="font-medium text-cream line-clamp-1">
                      {lang === 'zh' ? item.nameZh : item.nameEn}
                    </h3>
                    <p className="text-zinc-500 mt-0.5">Qty: {item.quantity}</p>
                    <p className="text-gold-secondary mt-1 font-semibold">${item.price}</p>
                  </div>
                </div>
              ))}
            </div>

            <div className="border-t border-gold-primary/10 mt-6 pt-6 space-y-3 text-sm">
              <div className="flex justify-between text-zinc-400">
                <span>{dict.cart.subtotal}</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-zinc-400">
                <span>Shipping</span>
                <span className="text-emerald-400 uppercase font-medium">Free</span>
              </div>
              <div className="flex justify-between text-base font-serif tracking-wider pt-3 border-t border-gold-primary/5 text-gold-primary font-bold">
                <span>{dict.cart.total}</span>
                <span>${cartTotal.toFixed(2)}</span>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-gold-primary/5 flex items-center space-x-2 text-[10px] text-zinc-500">
              <ShieldCheck className="w-4 h-4 text-gold-secondary" />
              <span>Checkout is processed securely. Natural energy is guaranteed.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
