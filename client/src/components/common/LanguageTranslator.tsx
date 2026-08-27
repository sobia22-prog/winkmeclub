import React, { useEffect } from 'react';
import { useSystemSettings } from '../../contexts/SystemSettingsContext';

const langCodeMap: Record<string, string> = {
  English: 'en',
  Hindi: 'hi',
  Tamil: 'ta',
  Telugu: 'te',
  Bengali: 'bn',
};

export const LanguageTranslator: React.FC = () => {
  const { settings } = useSystemSettings();

  useEffect(() => {
    const lang = settings.defaultLanguage || 'English';
    const targetCode = langCodeMap[lang] || 'en';

    // 1. Set Google Translate cookies for instant seamless translation
    const host = window.location.hostname;
    document.cookie = `googtrans=/en/${targetCode}; path=/; domain=${host}`;
    document.cookie = `googtrans=/en/${targetCode}; path=/`;

    // 2. Programmatically dispatch language change event on Google Translate combo box if present
    const triggerTranslate = () => {
      const select = document.querySelector('.goog-te-combo') as HTMLSelectElement;
      if (select) {
        select.value = targetCode;
        select.dispatchEvent(new Event('change'));
      }
    };

    triggerTranslate();
    const timer1 = setTimeout(triggerTranslate, 500);
    const timer2 = setTimeout(triggerTranslate, 1500);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [settings.defaultLanguage]);

  return null;
};
