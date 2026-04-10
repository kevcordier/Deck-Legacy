import { GameContext } from '@contexts/GameContext';
import { EMPTY_STATE, GameAggregate } from '@engine/application/aggregates/GameAggregate';
import type {
  CardDef,
  Effect,
  GameEvent,
  GameState,
  PendingChoice,
  ResolvedAction,
  ResolvedCost,
  TriggerEntry,
} from '@engine/domain/types';
import { loadCardDefs, loadStickerDefs } from '@engine/infrastructure/loaders';
import type { Resources } from 'i18next';
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
  initialEvents = [],
}: {
  children: ReactNode;
  initialState?: GameState;
  initialEvents?: GameEvent[];
}) {
  const defs = useMemo(() => loadCardDefs(), []);
  const stickerDefs = useMemo(() => loadStickerDefs(), []);
  const agg = makeAggregate(initialState, defs);
  agg.loadFromHistory(initialEvents);
  const aggRef = useRef<GameAggregate>(agg);
  const [gameState, setGameState] = useState<GameState>(agg.getGameState());
  const [pendingChoices, setPendingChoices] = useState<PendingChoice[] | null>(null);
  const [triggerPile, setTriggerPile] = useState<Record<string, TriggerEntry> | null>(null);
  const currentProductionRef = useRef<{
    instanceId: number;
    resources: Resources;
  } | null>(null);
  const currentActionRef = useRef<{
    instanceId: number;
    action: Effect;
    resolvedCost: ResolvedCost | null;
    resolvedAction: ResolvedAction[];
    triggerId: string;
  } | null>(null);

  return (
    <GameContext.Provider
      value={{
        gameState,
        setGameState,
        defs,
        stickerDefs,
        aggRef,
        pendingChoices,
        setPendingChoices,
        triggerPile,
        setTriggerPile,
        currentProductionRef,
        currentActionRef,
      }}
    >
      {children}
    </GameContext.Provider>
  );
}
