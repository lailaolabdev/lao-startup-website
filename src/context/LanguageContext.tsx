'use client';

import { createContext, useContext, useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export type Language = 'EN' | 'LA';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children, initialLang }: { children: React.ReactNode; initialLang: Language }) {
  const [language, setLanguageState] = useState<Language>(initialLang);
  const router = useRouter();

  // Keep state in sync with cookie when loaded
  useEffect(() => {
    const match = document.cookie.match(/(?:^|; )lang=([^;]*)/);
    if (match && (match[1] === 'EN' || match[1] === 'LA')) {
      setLanguageState(match[1] as Language);
    }
  }, []);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    document.cookie = `lang=${lang}; path=/; max-age=31536000; SameSite=Lax`;
    router.refresh();
  };

  const toggleLanguage = () => {
    const nextLang = language === 'EN' ? 'LA' : 'EN';
    setLanguage(nextLang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, toggleLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
