import { GameUIContext } from '@contexts/GameUIContext';
import { type ReactNode, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

function getInitialTheme(): Theme {
  const stored = localStorage.getItem('deck_legacy_theme');
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

function getInitialTutorial(): boolean {
  const stored = localStorage.getItem('deck_legacy_tutorial');
  return stored !== 'false';
}

function resolveTheme(theme: Theme): 'light' | 'dark' {
  if (theme !== 'system') return theme;
  return globalThis.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export function GameUIProvider({ children }: { readonly children: ReactNode }) {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [stickerStockOpen, setStickerStockOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [tutorialEnabled, setTutorialEnabled] = useState<boolean>(getInitialTutorial);

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
      const mq = globalThis.matchMedia('(prefers-color-scheme: dark)');
      mq.addEventListener('change', apply);
      return () => mq.removeEventListener('change', apply);
    }
  }, [theme]);

  const handleTutorialChange = (enabled: boolean) => {
    localStorage.setItem('deck_legacy_tutorial', String(enabled));
    setTutorialEnabled(enabled);
  };

  return (
    <GameUIContext
      value={{
        optionsOpen,
        setOptionsOpen,
        rulesOpen,
        setRulesOpen,
        stickerStockOpen,
        setStickerStockOpen,
        theme,
        applyTheme,
        tutorialEnabled,
        setTutorialEnabled: handleTutorialChange,
      }}
    >
      {children}
    </GameUIContext>
  );
}
