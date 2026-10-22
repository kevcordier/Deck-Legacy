import type {
  CardAction,
  ExpansionDeckEntry,
  GameParameters,
  GameState,
  PurgeFirstBatch,
  PurgeFocus,
  Resources,
  StickerStock,
  TriggerEntry,
} from '.';
import type { GameEventType, Phase } from '../enums';
import type { GameCommand } from './GameSession';

export interface GameEvent {
  id: string;
  type: string;
  timestamp: number;
  /** Produced by a development cheat command: the server refuses such games. */
  cheat?: true;
  /**
   * Player commands run since the previous event, set on the first event they produced: the
   * server runs them again to check the event log (EDR-051). Trigger ids are replaced by a
   * stable reference (`GameSession`). Absent in older games and on the events of `start()`.
   */
  commands?: GameCommand[];
}

export interface GameStartedEvent extends GameEvent {
  type: GameEventType.GAME_STARTED;
  initialDeck: number[];
  deck: { id: number; cardId: number }[];
  stickerStock: Record<string, number>;
  /** Campaign pile. */
  discoveryPile: number[];
  /** Absent in games started before the two packs (EDR-045). */
  discoverablePile?: number[];
  /** Seed of every shuffle of the game (EDR-051). Absent in older games: they cannot be verified. */
  seed?: string;
}

export interface GameEndedEvent extends GameEvent {
  type: GameEventType.GAME_ENDED;
}

export interface RoundEndedEvent extends GameEvent {
  type: GameEventType.ROUND_ENDED;
  round: number;
  endRoundTriggers: Record<string, TriggerEntry>;
}

export interface RoundStartedEvent extends GameEvent {
  type: GameEventType.ROUND_STARTED;
  round: number;
  newDrawPile: number[];
  lastAddedCards?: number[];
}

/** Start of a round: the first cards of the campaign pile are discovered. */
export interface StoryAdvancedEvent extends GameEvent {
  type: GameEventType.STORY_ADVANCED;
  discoveredIds: number[];
}

export interface ParchmentCardDiscoveredEvent extends GameEvent {
  type: GameEventType.PARCHMENT_CARD_DISCOVERED;
  cardInstanceId: number;
  /** Discovered by an effect: the phase the game goes back to once it is resolved (EDR-059). */
  resumePhase?: Phase;
}

/** A parchment discovered by an effect is resolved: the game goes back to `resumePhase`. */
export interface ParchmentResolvedEvent extends GameEvent {
  type: GameEventType.PARCHMENT_RESOLVED;
}

export interface TurnStartedEvent extends GameEvent {
  type: GameEventType.TURN_STARTED;
  turn: number;
  turnCards: number[];
}

export interface CardProducedEvent extends GameEvent {
  type: GameEventType.CARD_PRODUCED;
  cardInstanceId: number;
  productions: Resources;
}

export interface AdvanceEvent extends GameEvent {
  type: GameEventType.ADVANCE;
  turnCards: number[];
}

export interface UpgradeCardEvent extends GameEvent {
  type: GameEventType.UPGRADE_CARD;
  cardInstanceId: number;
  stateId: number;
  cost: Resources;
  discardedCardIds?: number[];
  destroyedCardIds?: number[];
  endTurnTrigger: Record<string, TriggerEntry>;
  /** The upgrade did not end the turn (Renowned School). Absent in older events. */
  keepsTurn?: boolean;
}

export interface ChooseStateEvent extends GameEvent {
  type: GameEventType.CHOOSE_STATE;
  cardInstanceId: number;
  stateId: number;
}

export interface CardActionEvent extends GameEvent {
  type: GameEventType.CARD_ACTION;
  gameStateChanges: Partial<GameState>;
  sourceInstanceId: number;
  actionId: string;
  triggers: Record<string, TriggerEntry>;
  endTurn?: boolean;
  endRound?: boolean;
}

export interface SkipTriggerEvent extends GameEvent {
  type: GameEventType.SKIP_TRIGGER;
  triggerId: string;
  /**
   * Identify the skipped trigger on replay: trigger keys are regenerated when events are
   * applied, so `triggerId` only matches during the live game. Absent in older events.
   */
  sourceInstanceId?: number;
  actionId?: string;
  endTurn?: boolean;
  endRound?: boolean;
}

export interface TurnEndedEvent extends GameEvent {
  type: GameEventType.TURN_ENDED;
  endTurnTrigger: Record<string, TriggerEntry>;
}

export interface CampaignScoreSavedEvent extends GameEvent {
  type: GameEventType.CAMPAIGN_SCORE_SAVED;
  segment: string;
  score: number;
  openExpansionChoice: boolean;
}

export interface ExpansionSelectedEvent extends GameEvent {
  type: GameEventType.EXPANSION_SELECTED;
  expansionName: string;
  expansionMaxRound?: number;
  deckEntries: ExpansionDeckEntry[];
  /** Entries of the discoverable pack; absent in older events (one discovery pile). */
  discoverableIds?: number[];
  /** `ExpansionConfig.expansion`: recorded on the created instances. */
  expansion?: string;
  purgeBatchSize: number;
  purgePermanentCount: number;
  purgePool: number[];
  parameterOverrides?: Partial<GameParameters>;
  onStartDiscoverIds: number[];
  addedStickers?: StickerStock;
  purgeFocus?: PurgeFocus;
  /** The first purge batch, fixed when the expansion is selected (Invasion, Nature's Revenge). */
  purgeFirstBatch?: PurgeFirstBatch;
  onStartActions?: CardAction[];
  expansionDiscoveryFirst?: boolean; // expansion cards go before the remaining base cards
}

export interface PurgeCardSelectedEvent extends GameEvent {
  type: GameEventType.PURGE_CARD_SELECTED;
  instanceId: number;
  batchStart: number;
}

export interface PurgePermanentSelectedEvent extends GameEvent {
  type: GameEventType.PURGE_PERMANENT_SELECTED;
  instanceId: number;
}

export interface PurgeOnTriggeredEvent extends GameEvent {
  type: GameEventType.PURGE_ON_TRIGGERED;
  triggers: Record<string, TriggerEntry>;
}

export interface PurgeFinalizedEvent extends GameEvent {
  type: GameEventType.PURGE_FINALIZED;
  purgedIds: number[];
  glory: number;
  onStartDiscoverIds: number[];
  /** Setup actions of the campaign, queued before the first round (EDR-059). */
  onStartTriggers?: Record<string, TriggerEntry>;
}
