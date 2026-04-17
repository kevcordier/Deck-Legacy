import type { Theme } from '@contexts/GameUIProvider';
import { createContext } from 'react';

type GameUIContextType = {
  optionsOpen: boolean;
  setOptionsOpen: (open: boolean) => void;
  rulesOpen: boolean;
  setRulesOpen: (open: boolean) => void;
  theme: Theme;
  applyTheme: (theme: Theme) => void;
};

export const GameUIContext = createContext<GameUIContextType>({} as GameUIContextType);
