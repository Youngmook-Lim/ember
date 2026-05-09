import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './locales/en.json';
import ko from './locales/ko.json';

const applyLang = (lng) => { document.documentElement.lang = lng || 'en'; };

// Set lang synchronously from localStorage BEFORE i18next init,
// so :lang(ko) CSS applies on the very first paint.
const stored = localStorage.getItem('ember_language');
if (stored === 'en' || stored === 'ko') applyLang(stored);

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      en: { translation: en },
      ko: { translation: ko },
    },
    fallbackLng: 'en',
    supportedLngs: ['en', 'ko'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'ember_language',
      caches: ['localStorage'],
    },
    interpolation: { escapeValue: false },
  });

i18n.on('languageChanged', applyLang);

export default i18n;
