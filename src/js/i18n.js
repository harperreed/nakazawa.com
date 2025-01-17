import translations from "../translations.json";

class I18n {
    constructor() {
        this._currentLang = localStorage.getItem("language") || "en";
        this._fallbackLang = "en";
        this._translations = translations;
        
        // Validate current language exists
        if (!this._translations[this._currentLang]) {
            console.warn(`Language "${this._currentLang}" not found, falling back to ${this._fallbackLang}`);
            this._currentLang = this._fallbackLang;
            localStorage.setItem("language", this._currentLang);
        }
    }

    get currentLang() {
        return this._currentLang;
    }

    setLanguage(lang) {
        if (!this._translations[lang]) {
            console.error(`Language "${lang}" not supported`);
            return false;
        }
        
        this._currentLang = lang;
        localStorage.setItem("language", lang);
        
        return true;
    }

    getText(key, section = "ui") {
        // Try current language
        const text = this._translations[this._currentLang]?.[section]?.[key];
        if (text) return text;

        // Try fallback language
        const fallbackText = this._translations[this._fallbackLang]?.[section]?.[key];
        if (fallbackText) {
            console.warn(
                `Missing translation for key "${key}" in language "${this._currentLang}", using fallback`
            );
            return fallbackText;
        }

        // Last resort - return the key itself
        console.error(
            `No translation found for key "${key}" in any language`
        );
        return key;
    }

    getSupportedLanguages() {
        return Object.keys(this._translations);
    }
}

export const i18n = new I18n();
