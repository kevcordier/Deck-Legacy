import { GameUIContext } from '@contexts/GameUIContext';
import { use } from 'react';

type GameUIHook = {
  setOptionsOpen: (open: boolean) => void;
  setRulesOpen: (open: boolean) => void;
  optionsOpen: boolean;
  rulesOpen: boolean;
  stickerStockOpen: boolean;
  setStickerStockOpen: (open: boolean) => void;
};

export function useGameUI(): GameUIHook {
  const {
    setOptionsOpen,
    setRulesOpen,
    optionsOpen,
    rulesOpen,
    stickerStockOpen,
    setStickerStockOpen,
  } = use(GameUIContext);

  return {
    setOptionsOpen,
    setRulesOpen,
    optionsOpen,
    rulesOpen,
    stickerStockOpen,
    setStickerStockOpen,
  };
}
