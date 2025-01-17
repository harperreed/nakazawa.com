import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import enTranslation from '../locales/en/translation.json';

const i18nInstance = i18n
  .use(LanguageDetector)
  .init({
    debug: true,
    fallbackLng: 'en',
    resources: {
      en: {
        translation: enTranslation
      }
    },
    interpolation: {
      escapeValue: false
    }
  });

export { i18nInstance };
export default i18n;
