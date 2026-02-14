import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import deTranslation from "../locales/de/translation.json";
import enTranslation from "../locales/en/translation.json";
import esTranslation from "../locales/es/translation.json";
import frTranslation from "../locales/fr/translation.json";
import hiTranslation from "../locales/hi/translation.json";
import idTranslation from "../locales/id/translation.json";
import itTranslation from "../locales/it/translation.json";
import jaTranslation from "../locales/ja/translation.json";
import koTranslation from "../locales/ko/translation.json";
import pirateTranslation from "../locales/pirate/translation.json";
import plTranslation from "../locales/pl/translation.json";
import ptTranslation from "../locales/pt/translation.json";
import zhTWTranslation from "../locales/zh-TW/translation.json";
import zhTranslation from "../locales/zh/translation.json";

export const languages = {
	en: { nativeName: "English" },
	ja: { nativeName: "日本語" },
	es: { nativeName: "Español" },
	zh: { nativeName: "中文" },
	id: { nativeName: "Bahasa Indonesia" },
	ko: { nativeName: "한국어" },
	hi: { nativeName: "हिन्दी" },
	pt: { nativeName: "Português" },
	de: { nativeName: "Deutsch" },
	fr: { nativeName: "Français" },
	pl: { nativeName: "Polski" },
	"zh-TW": { nativeName: "繁體中文" },
	it: { nativeName: "Italiano" },
	pirate: { nativeName: "Pirate" },
};

// You can override the language by adding ?lng=LANGUAGE_CODE to the URL
// For example: ?lng=ja for Japanese, ?lng=es for Spanish
const i18nInstance = i18n.use(LanguageDetector).init({
	detection: {
		order: ["querystring", "navigator"],
		lookupQuerystring: "lng",
	},
	debug: true,
	fallbackLng: {
		"zh-TW": ["zh"],
		default: ["en"],
	},
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
		"zh-TW": { translation: zhTWTranslation },
		it: { translation: itTranslation },
		pirate: { translation: pirateTranslation },
	},
	interpolation: {
		escapeValue: false,
	},
});

// Set the language dropdown to match the detected/selected language
i18nInstance.then(() => {
	const languageSelect = document.getElementById("language-select");
	if (languageSelect) {
		languageSelect.value = i18n.language;
	}
});

export { i18nInstance };
export default i18n;
