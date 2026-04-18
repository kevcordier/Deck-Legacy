import cardsEn from '../data/locales/cards.en.json';
import cardsFr from '../data/locales/cards.fr.json';
import en from '../data/locales/en.json';
import fr from '../data/locales/fr.json';
import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const LANG_KEY = 'deck_legacy_lang';

const savedLng = localStorage.getItem(LANG_KEY) ?? 'en';

i18n.use(initReactI18next).init({
  resources: {
    en: { translation: en, cards: cardsEn },
    fr: { translation: fr, cards: cardsFr },
  },
  lng: savedLng,
  fallbackLng: 'en',
  interpolation: {
    escapeValue: false,
  },
});

i18n.on('languageChanged', lng => {
  localStorage.setItem(LANG_KEY, lng);
});

export default i18n;
