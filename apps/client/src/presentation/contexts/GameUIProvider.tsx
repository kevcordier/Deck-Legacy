import { GameUIContext } from './GameUIContext';
import { useAppServices } from '@hooks/useAppServices';
import { type ReactNode, useState } from 'react';

export function GameUIProvider({ children }: { readonly children: ReactNode }) {
  const { preferences } = useAppServices();
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [rulesOpen, setRulesOpen] = useState(false);
  const [stickerStockOpen, setStickerStockOpen] = useState(false);
  const [tutorialEnabled, setTutorialEnabled] = useState<boolean>(
    () => preferences.get('tutorial') !== 'false',
  );
  const [resourceWarningEnabled, setResourceWarningEnabled] = useState<boolean>(
    () => preferences.get('resourceWarning') !== 'false',
  );

  const handleTutorialChange = (enabled: boolean) => {
    preferences.set('tutorial', String(enabled));
    setTutorialEnabled(enabled);
  };

  const handleResourceWarningChange = (enabled: boolean) => {
    preferences.set('resourceWarning', String(enabled));
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
