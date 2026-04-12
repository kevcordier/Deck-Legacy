import cardsEn from '../i18n/locales/cards.en.json';
import cardsFr from '../i18n/locales/cards.fr.json';
import en from '../i18n/locales/en.json';
import fr from '../i18n/locales/fr.json';
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
