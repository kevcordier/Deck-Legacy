import type { GameEventType } from '@engine/domain/enums';
import type { GameState, Phase, Resources, TriggerEntry } from '@engine/domain/types';

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

export interface RoundEndedEvent extends GameEvent {
  type: GameEventType.ROUND_ENDED;
  round: number;
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
}

export interface SkipTriggerEvent extends GameEvent {
  type: GameEventType.SKIP_TRIGGER;
  triggerId: string;
}

export interface TurnEndedEvent extends GameEvent {
  type: GameEventType.TURN_ENDED;
}

export interface TriggerEventsEvent extends GameEvent {
  type: GameEventType.TRIGGER_EVENTS;
  triggerPile: Record<string, TriggerEntry>;
  phase: Phase;
}
