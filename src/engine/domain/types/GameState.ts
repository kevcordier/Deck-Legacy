import type { CardAction, Passive } from './Card';
import type { CardInstance } from './CardInstance';
import type { Resources } from './Resource';
import type { StickerStock } from './Sticker';
import type { Phase } from '@engine/domain/types/Phase';

export type TriggerEntry = {
  effectDef: CardAction;
  sourceInstanceId: number;
};

export type ExpansionDeckEntry = {
  id: number;
  cardId: number;
};

export type ExpansionConfig = {
  expansionMaxRound?: number;
  purge: {
    permanent: number;
    purge: number;
  };
  parameters?: Partial<GameParameters>;
  deck: ExpansionDeckEntry[];
  onStart?: {
    discover?: {
      ids: number[];
    };
  };
};

export type PurgeState = {
  batchSize: number;
  permanentToPurge: number;
  shuffledPool: number[];
  completedBatchStarts: number[];
  selectedCardIds: number[];
  selectedPermanentIds: number[];
  onPurgeTriggered: boolean;
  onStartDiscoverIds: number[];
};

export type GameState = {
  drawPile: number[];
  discoveryPile: number[];
  destroyedPile: number[];
  discardPile: number[];
  board: number[];
  permanents: number[];
  instances: Record<number, CardInstance>;
  resources: Resources;
  stickerStock: StickerStock;
  boardEffects: Record<number, Passive[]>;
  triggerPile: Record<string, TriggerEntry>;
  lastAddedCards: number[];
  lastDrawnCards: number[];
  lastDiscardedCards: number[];
  round: number;
  turn: number;
  isLastRound: boolean;
  phase: Phase;
  onGoingParchment?: number;
  parameterOverrides: Partial<GameParameters>;
  campaignScores: Record<string, number>;
  activeExpansion?: string;
  expansionMaxRound?: number;
  purgedCards: number[];
  purgedGlory: number[];
  purgeState?: PurgeState;
};

export type GameParameters = {
  displayedDrawDeckCards: number;
  advanceCardDrawn: number;
  turnCardDrawn: number;
  discoverPerRound: number;
};
