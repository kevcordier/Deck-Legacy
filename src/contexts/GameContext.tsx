import type { GameAggregate } from '@engine/application/aggregates/GameAggregate';
import type { PendingChoiceType } from '@engine/domain/enums';
import type {
  CardDef,
  GameEvent,
  GameParameters,
  GameState,
  PendingChoice,
  ResolvedActionEffect,
  ResolvedCost,
  TriggerEntry,
} from '@engine/domain/types';
import type { loadCardDefs, loadStickerDefs } from '@engine/infrastructure/loaders';
import { createContext } from 'react';

export type GameContextType = {
  id?: string;
  gameState: GameState;
  defs: ReturnType<typeof loadCardDefs>;
  stickerDefs: ReturnType<typeof loadStickerDefs>;
  aggRef: React.RefObject<GameAggregate>;
  pendingChoices: PendingChoice[] | null;
  triggerPile: Record<string, TriggerEntry> | null;
  deleteSave: () => void;
  startTutorial: () => void;
  startGame: () => void;
  startRound: () => void;
  startTurn: () => void;
  chooseState: (instanceId: number, stateId: number) => void;
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
  skipChoice: () => void;
  parchmentTextPending: CardDef | null;
  dismissParchmentText: () => void;
  canRewind: () => boolean;
  rewindEvent: () => void;
  score: number;
  displayNewCards: boolean;
  setDisplayNewCards: (value: boolean) => void;
  getEvents: () => GameEvent[];
  parameters: GameParameters;
};

export const GameContext = createContext<GameContextType>({} as GameContextType);
