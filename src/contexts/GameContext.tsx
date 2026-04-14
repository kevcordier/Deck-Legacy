import type { GameAggregate } from '@engine/application/aggregates/GameAggregate';
import type {
  CardAction,
  CardDef,
  GameState,
  PendingChoice,
  ResolvedAction,
  ResolvedCost,
  Resources,
  TriggerEntry,
} from '@engine/domain/types';
import type { loadCardDefs, loadStickerDefs } from '@engine/infrastructure/loaders';
import { createContext } from 'react';

type GameContextType = {
  gameState: GameState;
  defs: ReturnType<typeof loadCardDefs>;
  stickerDefs: ReturnType<typeof loadStickerDefs>;
  aggRef: React.RefObject<GameAggregate>;
  pendingChoices: PendingChoice[] | null;
  triggerPile: Record<string, TriggerEntry> | null;
  currentProductionRef: React.RefObject<{
    instanceId: number;
    resources: Resources;
  } | null>;
  currentActionRef: React.RefObject<{
    instanceId: number;
    action: CardAction;
    resolvedCost: ResolvedCost | null;
    resolvedAction: ResolvedAction[];
    triggerId: string;
  } | null>;
  triggerAction: (
    instanceId: number,
    effect: CardAction,
    resolvedCost: ResolvedCost,
    triggerId: string,
  ) => void;
  loadGame: () => void;
  deleteSave: () => void;
  startGame: () => void;
  startRound: () => void;
  startTurn: () => void;
  resolveProduction: (instanceId: number, chosenResource: number) => void;
  resolveAction: (instanceId: number, actionId: string) => void;
  resolveTrackStep: (instanceId: number, stepId: number) => void;
  resolveUpgrade: (instanceId: number, chosenUpgradeTo?: number) => void;
  progress: () => void;
  endTurnVoluntary: () => void;
  resolvePlayerChoice: (choice: ResolvedAction) => void;
  resolvePayCost: (resolved: ResolvedCost) => void;
  skipTrigger: (uuid: string) => void;
  skipChoice: (uuid: string) => void;
  parchmentTextPending: CardDef | null;
  dismissParchmentText: () => void;
  canRewind: () => boolean;
  rewindEvent: () => void;
};

export const GameContext = createContext<GameContextType>({} as GameContextType);
