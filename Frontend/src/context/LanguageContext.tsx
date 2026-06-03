import React, { createContext, useContext, useState, useEffect } from 'react';
import { Language, translations } from '../services/translations';
import { safeLocalStorage } from '../utils/safeStorage';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => 
    (safeLocalStorage.getItem('labzero_language') as Language) || 'en'
  );

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    safeLocalStorage.setItem('labzero_language', lang);
  };

  // Sync state changes back to localStorage automatically just in case
  useEffect(() => {
    safeLocalStorage.setItem('labzero_language', language);
  }, [language]);

  const t = (key: string): string => {
    const normalizedKey = key.replace(/\r/g, '').trim();
    const result = translations[normalizedKey]?.[language];
    if (!result && key.length > 30) {
      console.warn("Translation lookup failed for key:", JSON.stringify(normalizedKey));
      console.log("Total keys in database:", Object.keys(translations).length);
      const partial = normalizedKey.substring(0, 20);
      const matches = Object.keys(translations).filter(k => k.includes(partial));
      console.log(`Partial matches for '${partial}':`, matches.map(m => JSON.stringify(m)));
    }
    return result || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
