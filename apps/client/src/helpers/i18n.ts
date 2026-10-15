import en from '@data/locales/en.json';
import fr from '@data/locales/fr.json';
import { cardTexts } from '@deck-legacy/game-data';
import { STORAGE_KEYS, storage } from '@services/storage';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

/** Initializes i18next once, using the language stored in the (hydrated) app storage. */
export function initI18n(): typeof i18n {
  if (i18n.isInitialized) return i18n;

  void i18n.use(initReactI18next).init({
    resources: {
      en: { translation: en, cards: cardTexts.en },
      fr: { translation: fr, cards: cardTexts.fr },
    },
    lng: storage.getItem(STORAGE_KEYS.lang) ?? 'en',
    fallbackLng: 'en',
    initAsync: false,
    interpolation: {
      escapeValue: false,
    },
  });

  i18n.on('languageChanged', lng => {
    storage.setItem(STORAGE_KEYS.lang, lng);
  });

  return i18n;
}

export default i18n;
