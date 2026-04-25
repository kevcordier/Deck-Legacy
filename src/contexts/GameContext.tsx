import type { GameAggregate } from '@engine/application/aggregates/GameAggregate';
import type { PendingChoiceType } from '@engine/domain/enums';
import type {
  CardDef,
  GameEvent,
  GameState,
  PendingChoice,
  ResolvedActionEffect,
  ResolvedCost,
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
  deleteSave: () => void;
  startGame: () => void;
  startRound: () => void;
  startTurn: () => void;
  resolveProduction: (instanceId: number, chosenResource: number) => void;
  resolveAction: (instanceId: number, actionId: string) => void;
  resolveUpgrade: (instanceId: number, chosenUpgradeTo?: number) => void;
  setCardName: (instanceId: number, chosenName: string) => void;
  getCardName: (instanceId: number) => string | undefined;
  progress: () => void;
  endTurnVoluntary: () => void;
  resolvePlayerChoice: (choice: ResolvedActionEffect, choiceType: PendingChoiceType) => void;
  resolvePayCost: (resolved: ResolvedCost) => void;
  skipTrigger: (uuid: string) => void;
  skipChoice: (uuid: string) => void;
  parchmentTextPending: CardDef | null;
  dismissParchmentText: () => void;
  canRewind: () => boolean;
  rewindEvent: () => void;
  getEvents: () => GameEvent[];
};

export const GameContext = createContext<GameContextType>({} as GameContextType);
