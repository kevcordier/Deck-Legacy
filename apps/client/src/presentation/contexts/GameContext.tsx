import type { PendingChoiceType } from '@deck-legacy/engine/domain/enums';
import type {
  CardDef,
  GameEvent,
  GameParameters,
  GameState,
  PendingChoice,
  ResolvedActionEffect,
  ResolvedCost,
  Sticker,
  TriggerEntry,
} from '@deck-legacy/engine/domain/types';
import type { UpgradeReveal } from '@presentation/board/findUpgradeReveal';
import { createContext } from 'react';

export type GameContextType = {
  id?: string;
  gameState: GameState;
  defs: Record<number, CardDef>;
  stickerDefs: Record<number, Sticker>;
  pendingChoices: PendingChoice[] | null;
  triggerPile: Record<string, TriggerEntry> | null;
  /** The tutorial round is being played (not saved until the player keeps it). */
  isTutorial: boolean;
  /** Starts a new game for the kingdom (end of the tutorial). */
  startGame: () => void;
  /** Keeps the tutorial game as the kingdom's game (end of the tutorial). */
  continueGame: () => void;
  endRound: () => void;
  startRound: () => void;
  startTurn: () => void;
  chooseState: (instanceId: number, stateId: number) => void;
  resolveProduction: (instanceId: number, chosenResource: number) => void;
  resolveAction: (
    instanceId: number,
    actionId: string,
    triggerId?: string,
    amount?: number,
  ) => void;
  resolveUpgrade: (instanceId: number, chosenUpgradeTo?: number, upgradeIndex?: number) => void;
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
  /** Card upgraded by the last command, shown turning over to its new state. */
  /** Cards drawn by the last command (board animation), in draw order. */
  drawnCardIds: number[];
  upgradeReveal: UpgradeReveal | null;
  dismissUpgradeReveal: () => void;
  displayNewCards: boolean;
  setDisplayNewCards: (value: boolean) => void;
  /** Event log of the current game (cheat panel). */
  getEvents: () => GameEvent[];
  /** Each card's state just before each event, by event id (history). */
  getStateIdsBeforeEvents: () => Record<string, Record<number, number>>;
  parameters: GameParameters;
  campaignScores: Record<string, number>;
  availableExpansions: string[];
  continueCampaign: () => void;
  selectExpansion: (expansionName: string) => void;
  purgeBatch: number[];
  purgeCandidates: number[];
  purgePermanentCandidates: number[];
  selectedPurgeIds: number[];
  canSelectPermanentForPurge: boolean;
  isPurgeSelectionComplete: boolean;
  selectPurgeCard: (instanceId: number) => void;
  selectPurgePermanent: (instanceId: number) => void;
  finalizePurge: () => void;
};

export const GameContext = createContext<GameContextType>({} as GameContextType);
