import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from '../locales/en/translation.json';
import jaTranslation from '../locales/ja/translation.json';
import esTranslation from '../locales/es/translation.json';
import zhTranslation from '../locales/zh/translation.json';

export const languages = {
  en: { nativeName: 'English' },
  ja: { nativeName: '日本語' },
  es: { nativeName: 'Español' },
  zh: { nativeName: '中文' }
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
      zh: { translation: zhTranslation }
    },
    interpolation: {
      escapeValue: false
    }
  });

export { i18nInstance };
export default i18n;
