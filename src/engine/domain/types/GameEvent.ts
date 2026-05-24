import type { GameEventType } from '@engine/domain/enums';
import type {
  ExpansionDeckEntry,
  GameParameters,
  GameState,
  Resources,
  TriggerEntry,
} from '@engine/domain/types';

export interface GameEvent {
  id: string;
  type: string;
  timestamp: number;
}

export interface GameStartedEvent extends GameEvent {
  type: GameEventType.GAME_STARTED;
  initialDeck: number[];
  deck: { id: number; cardId: number }[];
  stickerStock: Record<string, number>;
  discoveryPile: number[];
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

export interface ParchmentCardDiscoveredEvent extends GameEvent {
  type: GameEventType.PARCHMENT_CARD_DISCOVERED;
  cardInstanceId: number;
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
  purgeBatchSize: number;
  purgePermanentCount: number;
  purgePool: number[];
  parameterOverrides?: Partial<GameParameters>;
  onStartDiscoverIds: number[];
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
}
