import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type Theme = 'light' | 'dark';
type Language = 'en' | 'ar';

interface AppContextType {
  theme: Theme;
  language: Language;
  setTheme: (t: Theme) => void;
  setLanguage: (l: Language) => void;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>(() =>
    (localStorage.getItem('wihda_theme') as Theme) || 'light'
  );
  const [language, setLanguageState] = useState<Language>(() =>
    (localStorage.getItem('wihda_language') as Language) || 'en'
  );

  // Apply theme to <html>
  useEffect(() => {
    const html = document.documentElement;
    if (theme === 'dark') {
      html.classList.add('dark');
    } else {
      html.classList.remove('dark');
    }
    localStorage.setItem('wihda_theme', theme);
  }, [theme]);

  // Apply language / RTL
  useEffect(() => {
    const html = document.documentElement;
    if (language === 'ar') {
      html.setAttribute('dir', 'rtl');
      html.setAttribute('lang', 'ar');
      html.style.setProperty('--font-body', "'Tajawal', sans-serif");
    } else {
      html.setAttribute('dir', 'ltr');
      html.setAttribute('lang', 'en');
      html.style.removeProperty('--font-body');
    }
    localStorage.setItem('wihda_language', language);
  }, [language]);

  const setTheme = (t: Theme) => setThemeState(t);
  const setLanguage = (l: Language) => setLanguageState(l);

  return (
    <AppContext.Provider value={{ theme, language, setTheme, setLanguage }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
