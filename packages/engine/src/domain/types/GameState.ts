import type { CardTag, Phase, ResourceType } from '../enums';
import type { CardAction, Passive } from './Card';
import type { CardInstance } from './CardInstance';
import type { Resources } from './Resource';
import type { StickerStock } from './Sticker';

export type TriggerEntry = {
  effectDef: CardAction;
  sourceInstanceId: number;
  /** Queued by an upgrade the player made: resolving or skipping it ends the deferred turn. */
  endsTurn?: boolean;
};

export type ExpansionDeckEntry = {
  /** Instance id, unique across the base game and every expansion: card selectors use it. */
  id: number;
  /** Card definition (file `cards/<cardId>.ts`), unique across the base game and expansions. */
  cardId: number;
  /** Number printed on the card, scoped to its expansion; the instance id in the base game. */
  number?: number;
};

export type ExpansionConfig = {
  expansionMaxRound?: number;
  purge: {
    permanent: number;
    purge: number;
    focus?: PurgeFocus;
    /**
     * Before the batches: purge `picks` friendly non-permanent cards among the `mostGlory` with the
     * most glory (Invasion), or among those with one of `tags` (Nature's Revenge: events).
     */
    firstBatch?: { picks: number; mostGlory?: number; tags?: CardTag[] };
  };
  parameters?: Partial<GameParameters>;
  /** Expansion that brings the deck (instances record it); absent for the base game campaigns. */
  expansion?: string;
  /** Campaign pack: the start of the round discovers its first cards ("advance the story"). */
  campaign: ExpansionDeckEntry[];
  /** Discoverable pack: cards only discovered by card effects. */
  discoverable?: ExpansionDeckEntry[];
  stickers?: StickerStock; // stickers added to the stock when the expansion starts
  onStart?: {
    discover?: {
      ids: number[];
    };
    /**
     * Setup actions of the campaign (Foundations: choose a foundation), resolved for the first card
     * of `discover.ids` before the first round starts (EDR-059).
     */
    actions?: CardAction[];
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
  onStartActions?: CardAction[];
  focus?: PurgeFocus;
  /** First batch: `picks` cards to choose among `ids` (the most glory, or cards with `tags`). */
  firstBatch?: PurgeFirstBatch;
  /** Saved from the purge, but their glory still counts in it (Countess, Lady Elara). */
  keptGloryIds?: number[];
};

export type PurgeFirstBatch = { ids: number[]; picks: number; tags?: CardTag[] };

export type GameState = {
  /** Seed of the shuffles (EDR-051); absent in older games, which shuffle with `Math.random`. */
  seed?: string;
  drawPile: number[];
  /** Campaign pile: the start of each round discovers its first cards; empty, the campaign ends. */
  discoveryPile: number[];
  /**
   * Discoverable pile: cards only discovered by card effects. Absent in games started before the
   * two packs (EDR-045): their single `discoveryPile` keeps the former rules.
   */
  discoverablePile?: number[];
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
  /** Phase to go back to once the ongoing parchment (discovered by an effect) is resolved. */
  parchmentResumePhase?: Phase;
  parameterOverrides: Partial<GameParameters>;
  campaignScores: Record<string, number>;
  activeExpansion?: string;
  expansionMaxRound?: number;
  purgedCards: number[];
  purgedGlory: number[];
  purgeState?: PurgeState;
  /** Resources offered beyond the six base ones once a foundation unlocks them (EDR-059). */
  unlockedResources?: ResourceType[];
  /** Equipped cards (Artisans): equipment id → holder id, while both are in play. */
  equipped?: Record<number, number>;
  /** The stickers just added, by card (ON_STICKER_ADDED triggers read them). */
  lastAddedStickers?: Record<number, number[]>;
  /** Actions with a `perTurn` limit used this turn (`instanceId|actionId`), cleared each turn. */
  turnUsedActions?: string[];
  /** Resource units the next gains of this turn lose (Too Much Mead). */
  resourcesToLose?: number;
};

export type GameParameters = {
  displayedDrawDeckCards: number;
  advanceCardDrawn: number;
  turnCardDrawn: number;
  discoverPerRound: number;
};
