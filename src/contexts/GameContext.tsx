import type { GameAggregate } from '@engine/application/aggregates/GameAggregate';
import type {
  Effect,
  GameState,
  PendingChoice,
  ResolvedAction,
  ResolvedCost,
  Resources,
  TriggerEntry,
} from '@engine/domain/types';
import type { loadCardDefs, loadStickerDefs } from '@engine/infrastructure/loaders';
import { createContext, type Dispatch, type SetStateAction } from 'react';

type GameContextType = {
  gameState: GameState;
  setGameState: Dispatch<SetStateAction<GameState>>;
  defs: ReturnType<typeof loadCardDefs>;
  stickerDefs: ReturnType<typeof loadStickerDefs>;
  aggRef: React.RefObject<GameAggregate>;
  pendingChoices: PendingChoice[] | null;
  setPendingChoices: Dispatch<SetStateAction<PendingChoice[] | null>>;
  triggerPile: Record<string, TriggerEntry> | null;
  setTriggerPile: Dispatch<SetStateAction<Record<string, TriggerEntry> | null>>;
  currentProductionRef: React.RefObject<{
    instanceId: number;
    resources: Resources;
  } | null>;
  currentActionRef: React.RefObject<{
    instanceId: number;
    action: Effect;
    resolvedCost: ResolvedCost | null;
    resolvedAction: ResolvedAction[];
    triggerId: string;
  } | null>;
};

export const GameContext = createContext<GameContextType>({} as GameContextType);
