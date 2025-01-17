import i18n from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

i18n
  .use(LanguageDetector)
  .init({
    debug: true,
    fallbackLng: 'en',
    resources: {
      en: {
        translation: require('../locales/en/translation.json')
      }
    },
    interpolation: {
      escapeValue: false
    }
  });

export default i18n;
