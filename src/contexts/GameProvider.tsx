import { GameContext } from '@contexts/GameContext';
import { EMPTY_STATE, GameAggregate } from '@engine/application/aggregates/GameAggregate';
import type { CardDef, GameState } from '@engine/domain/types';
import { loadCardDefs, loadStickerDefs } from '@engine/infrastructure/loaders';
import { useMemo, useRef, useState, type ReactNode } from 'react';

function makeAggregate(
  state: GameState = { ...EMPTY_STATE },
  cardDefs: Record<number, CardDef>,
): GameAggregate {
  return new GameAggregate([], JSON.parse(JSON.stringify(state)) as GameState, cardDefs);
}

export function GameProvider({
  children,
  initialState,
}: {
  children: ReactNode;
  initialState?: GameState;
}) {
  const defs = useMemo(() => loadCardDefs(), []);
  const stickerDefs = useMemo(() => loadStickerDefs(), []);
  const [gameState, setGameState] = useState<GameState>({ ...EMPTY_STATE, ...initialState });
  const aggRef = useRef<GameAggregate>(makeAggregate(gameState, defs));

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState,
        defs,
        stickerDefs,
        aggRef,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
