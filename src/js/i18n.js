import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from '../locales/en/translation.json';
import jaTranslation from '../locales/ja/translation.json';
import esTranslation from '../locales/es/translation.json';
import zhTranslation from '../locales/zh/translation.json';
import idTranslation from '../locales/id/translation.json';
import koTranslation from '../locales/ko/translation.json';
import hiTranslation from '../locales/hi/translation.json';
import ptTranslation from '../locales/pt/translation.json';
import deTranslation from '../locales/de/translation.json';
import frTranslation from '../locales/fr/translation.json';
import plTranslation from '../locales/pl/translation.json';
import zhTWTranslation from '../locales/zh-TW/translation.json';
import itTranslation from '../locales/it/translation.json';

export const languages = {
  en: { nativeName: 'English' },
  ja: { nativeName: '日本語' },
  es: { nativeName: 'Español' },
  zh: { nativeName: '中文' },
  id: { nativeName: 'Bahasa Indonesia' },
  ko: { nativeName: '한국어' },
  hi: { nativeName: 'हिन्दी' },
  pt: { nativeName: 'Português' },
  de: { nativeName: 'Deutsch' },
  fr: { nativeName: 'Français' },
  pl: { nativeName: 'Polski' },
  'zh-TW': { nativeName: '繁體中文' },
  it: { nativeName: 'Italiano' }
};

const i18nInstance = i18n
  .use(LanguageDetector)
  .init({
    debug: true,
    fallbackLng: 'en',
    resources: {
      en: { translation: enTranslation },
      ja: { translation: jaTranslation },
      es: { translation: esTranslation },
      zh: { translation: zhTranslation },
      id: { translation: idTranslation },
      ko: { translation: koTranslation },
      hi: { translation: hiTranslation },
      pt: { translation: ptTranslation },
      de: { translation: deTranslation },
      fr: { translation: frTranslation },
      pl: { translation: plTranslation },
      'zh-TW': { translation: zhTWTranslation },
      it: { translation: itTranslation }
    },
    interpolation: {
      escapeValue: false
    }
  });

export { i18nInstance };
export default i18n;
