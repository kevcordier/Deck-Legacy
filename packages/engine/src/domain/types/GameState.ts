import type { Phase, ResourceType } from '../enums';
import type { CardAction, Passive } from './Card';
import type { CardInstance } from './CardInstance';
import type { Resources } from './Resource';
import type { StickerStock } from './Sticker';

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
    focus?: PurgeFocus;
  };
  parameters?: Partial<GameParameters>;
  deck: ExpansionDeckEntry[];
  stickers?: StickerStock; // stickers added to the stock when the expansion starts
  onStart?: {
    discover?: {
      ids: number[];
    };
  };
};

/** "Focus N resource": while fewer than `count` selected cards produce `resource`, pick one of them when the batch has any. */
export type PurgeFocus = {
  resource: ResourceType;
  count: number;
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
  focus?: PurgeFocus;
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
