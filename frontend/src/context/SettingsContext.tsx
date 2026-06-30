'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';

interface SettingsContextType {
  settings: Record<string, string>;
  loading: boolean;
  getSetting: (key: string, fallback?: string) => string;
  getSettingL: (keyBase: string, lang: 'zh' | 'en', fallback?: string) => string;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || '/api';
        const res = await fetch(`${apiUrl}/settings`);
        if (res.ok) {
          const data = await res.json();
          setSettings(data);
        }
      } catch (err) {
        console.warn('Failed to load system settings from API', err);
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const getSetting = (key: string, fallback: string = ''): string => {
    return settings[key] !== undefined ? settings[key] : fallback;
  };

  const getSettingL = (keyBase: string, lang: 'zh' | 'en', fallback: string = ''): string => {
    const key = `${keyBase}_${lang}`;
    if (settings[key] !== undefined) return settings[key];
    // Fallback to keyBase directly if no language suffix is found
    if (settings[keyBase] !== undefined) return settings[keyBase];
    return fallback;
  };

  return (
    <SettingsContext.Provider value={{ settings, loading, getSetting, getSettingL }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
