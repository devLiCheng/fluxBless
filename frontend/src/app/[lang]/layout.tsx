import React from 'react';
import { AuthProvider } from '../../context/AuthContext';
import { SettingsProvider } from '../../context/SettingsContext';
import { CartProvider } from '../../context/CartContext';
import { getDictionary } from '../../lib/dictionary';
import { LayoutShellClient, Telemetry } from '../../components/LayoutShellClient';

interface Props {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export default async function LocalizedLayout({
  children,
  params,
}: Props) {
  const { lang } = await params;
  const typedLang = (lang as 'zh' | 'en') || 'zh';
  const dict = await getDictionary(typedLang);

  return (
    <AuthProvider>
      <SettingsProvider>
        <CartProvider>
          <Telemetry />
          <LayoutShellClient dict={dict} lang={typedLang}>
            {children}
          </LayoutShellClient>
        </CartProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
