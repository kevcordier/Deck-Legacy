import { GameUIContext } from '@contexts/GameUIContext';
import { useState, useEffect, type ReactNode } from 'react';

export type Theme = 'light' | 'dark' | 'system';

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('deck_legacy_theme');
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function GameUIProvider({ children }: { children: ReactNode }) {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [theme, setThemeState] = useState<Theme>(getInitialTheme);

  function setTheme(newTheme: Theme) {
    localStorage.setItem('deck_legacy_theme', newTheme);
    setThemeState(newTheme);
  }

  useEffect(() => {
    const apply = () => {
      document.documentElement.setAttribute('data-theme', resolveTheme(theme));
    };

    apply();

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme]);

  return (
    <GameUIContext.Provider
      value={{
        optionsOpen,
        setOptionsOpen,
        rulesOpen,
        setRulesOpen,
        theme,
        setTheme,
      }}
    >
      {children}
    </GameUIContext.Provider>
  );
}
