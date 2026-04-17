import { GameUIContext } from '@contexts/GameUIContext';
import { type ReactNode, useEffect, useState } from 'react';

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
  const [theme, setTheme] = useState<Theme>(getInitialTheme);

  function applyTheme(newTheme: Theme) {
    localStorage.setItem('deck_legacy_theme', newTheme);
    setTheme(newTheme);
  }

  useEffect(() => {
    const apply = () => {
      document.documentElement.dataset.theme = resolveTheme(theme);
    };

    apply();

    if (theme === 'system') {
      const mq = window.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme]);

  return (
    <GameUIContext
      value={{
        optionsOpen,
        setOptionsOpen,
        rulesOpen,
        setRulesOpen,
        theme,
        applyTheme,
      }}
    >
      {children}
    </GameUIContext>
  );
}
