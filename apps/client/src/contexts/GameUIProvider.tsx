import { GameUIContext } from '@contexts/GameUIContext';
import { STORAGE_KEYS, storage } from '@services/storage';
import { colorScheme } from 'nativewind';
import { type ReactNode, useEffect, useState } from 'react';

export type Theme = 'light' | 'dark' | 'system';

function getInitialTheme(): Theme {
  const stored = storage.getItem(STORAGE_KEYS.theme);
  if (stored === 'light' || stored === 'dark' || stored === 'system') return stored;
  return 'system';
}

function getInitialTutorial(): boolean {
  return storage.getItem(STORAGE_KEYS.tutorial) !== 'false';
}

export function GameUIProvider({ children }: { readonly children: ReactNode }) {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [stickerStockOpen, setStickerStockOpen] = useState(false);
  const [theme, setTheme] = useState<Theme>(getInitialTheme);
  const [tutorialEnabled, setTutorialEnabled] = useState<boolean>(getInitialTutorial);

  function applyTheme(newTheme: Theme) {
    storage.setItem(STORAGE_KEYS.theme, newTheme);
    setTheme(newTheme);
  }

  useEffect(() => {
    // NativeWind toggles the `dark` class (web) / color scheme (native) and follows the OS in `system`.
    colorScheme.set(theme);
  }, [theme]);

  const handleTutorialChange = (enabled: boolean) => {
    storage.setItem(STORAGE_KEYS.tutorial, String(enabled));
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
