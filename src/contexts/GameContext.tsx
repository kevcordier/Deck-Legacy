import type { GameAggregate } from '@engine/application/aggregates/GameAggregate';
import type { GameState } from '@engine/domain/types';
import type { loadCardDefs, loadStickerDefs } from '@engine/infrastructure/loaders';
import { createContext, type Dispatch, type SetStateAction } from 'react';

type GameContextType = {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  defs: ReturnType<typeof loadCardDefs>;
  stickerDefs: ReturnType<typeof loadStickerDefs>;
  aggRef: React.MutableRefObject<GameAggregate>;
};

export const GameContext = createContext<GameContextType>({} as GameContextType);
