import { create } from 'zustand';
import { translations, type Language } from './translations';

const storageKey = 'royal-water-villa-language';

type LanguageStore = {
  language: Language;
  setLanguage: (language: Language) => void;
};

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'he';
  }

  const saved = window.localStorage.getItem(storageKey);
  return saved === 'he' || saved === 'en' || saved === 'fr' ? saved : 'he';
}

export const useLanguageStore = create<LanguageStore>((set) => ({
  language: getInitialLanguage(),
  setLanguage: (language) => {
    window.localStorage.setItem(storageKey, language);
    set({ language });
  }
}));

export function useI18n() {
  const language = useLanguageStore((state) => state.language);
  return {
    language,
    t: translations[language],
    dir: translations[language].dir
  };
}
