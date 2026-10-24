import { GameUIContext } from './GameUIContext';
import { useAppServices } from '@hooks/useAppServices';
import { type ReactNode, useState } from 'react';
import { ReduceMotion, ReducedMotionConfig } from 'react-native-reanimated';

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
  const [animationsEnabled, setAnimationsEnabled] = useState<boolean>(
    () => preferences.get('animations') !== 'false',
  );

  const handleTutorialChange = (enabled: boolean) => {
    preferences.set('tutorial', String(enabled));
    setTutorialEnabled(enabled);
  };

  const handleResourceWarningChange = (enabled: boolean) => {
    preferences.set('resourceWarning', String(enabled));
    setResourceWarningEnabled(enabled);
  };

  const handleAnimationsChange = (enabled: boolean) => {
    preferences.set('animations', String(enabled));
    setAnimationsEnabled(enabled);
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
        animationsEnabled,
        setAnimationsEnabled: handleAnimationsChange,
      }}
    >
      {!animationsEnabled && <ReducedMotionConfig mode={ReduceMotion.Always} />}
      {children}
    </GameUIContext>
  );
}
