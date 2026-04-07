import { GameUIContext } from '@contexts/GameUIContext';
import { useContext } from 'react';

type GameUIHook = {
  setOptionsOpen: (open: boolean) => void;
  setRulesOpen: (open: boolean) => void;
  optionsOpen: boolean;
  rulesOpen: boolean;
};

export function useGameUI(): GameUIHook {
  const { setOptionsOpen, setRulesOpen, optionsOpen, rulesOpen } = useContext(GameUIContext);

  return {
    setOptionsOpen,
    setRulesOpen,
    optionsOpen,
    rulesOpen,
  };
}
