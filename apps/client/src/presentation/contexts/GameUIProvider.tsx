import { GameUIContext } from './GameUIContext';
import { storage } from '@infrastructure/storage/storage';
import { STORAGE_KEYS } from '@infrastructure/storage/storageKeys';
import { type ReactNode, useState } from 'react';

function getInitialTutorial(): boolean {
  return storage.getItem(STORAGE_KEYS.tutorial) !== 'false';
}

function getInitialResourceWarning(): boolean {
  return storage.getItem(STORAGE_KEYS.resourceWarning) !== 'false';
}

export function GameUIProvider({ children }: { readonly children: ReactNode }) {
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [stickerStockOpen, setStickerStockOpen] = useState(false);
  const [tutorialEnabled, setTutorialEnabled] = useState<boolean>(getInitialTutorial);
  const [resourceWarningEnabled, setResourceWarningEnabled] =
    useState<boolean>(getInitialResourceWarning);

  const handleTutorialChange = (enabled: boolean) => {
    storage.setItem(STORAGE_KEYS.tutorial, String(enabled));
    setTutorialEnabled(enabled);
  };

  const handleResourceWarningChange = (enabled: boolean) => {
    storage.setItem(STORAGE_KEYS.resourceWarning, String(enabled));
    setResourceWarningEnabled(enabled);
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
        tutorialEnabled,
        setTutorialEnabled: handleTutorialChange,
        resourceWarningEnabled,
        setResourceWarningEnabled: handleResourceWarningChange,
      }}
    >
      {children}
    </GameUIContext>
  );
}
