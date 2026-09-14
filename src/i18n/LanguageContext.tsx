import React, { createContext, useContext, useEffect, useState, useMemo, useCallback } from 'react';
import * as SecureStore from 'expo-secure-store';
import {
  translations,
  SUPPORTED_LANGUAGES,
  LanguageCode,
  LanguageOption,
  TranslationsType,
} from './translations';

interface LanguageContextType {
  language: LanguageCode;
  t: TranslationsType;
  setLanguage: (lang: LanguageCode) => Promise<void>;
  languages: LanguageOption[];
  currentLanguageOption: LanguageOption;
  isRTL: boolean;
}

const STORAGE_KEY = 'medverify_preferred_language';

const LanguageContext = createContext<LanguageContextType | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLangState] = useState<LanguageCode>('en');

  useEffect(() => {
    (async () => {
      try {
        const saved = await SecureStore.getItemAsync(STORAGE_KEY);
        if (saved && (saved in translations)) {
          setLangState(saved as LanguageCode);
        }
      } catch {
        // Fallback to default English
      }
    })();
  }, []);

  const setLanguage = useCallback(async (newLang: LanguageCode) => {
    if (newLang in translations) {
      setLangState(newLang);
      try {
        await SecureStore.setItemAsync(STORAGE_KEY, newLang);
      } catch {
        // Ignore persistence errors
      }
    }
  }, []);

  const t = useMemo(() => {
    return translations[language] || translations.en;
  }, [language]);

  const currentLanguageOption = useMemo(() => {
    return SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];
  }, [language]);

  const isRTL = language === 'ar';

  const value = useMemo(
    () => ({
      language,
      t,
      setLanguage,
      languages: SUPPORTED_LANGUAGES,
      currentLanguageOption,
      isRTL,
    }),
    [language, t, setLanguage, currentLanguageOption, isRTL]
  );

  return (
    <LanguageContext.Provider value={value}>
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
