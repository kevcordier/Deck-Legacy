import type { GameEventType } from '@engine/domain/enums';
import type { CardInstance, GameState, Resources, TriggerEntry } from '@engine/domain/types';

export interface GameEvent {
  id: string;
  type: string;
  timestamp: number;
}

export interface GameStartedEvent extends GameEvent {
  type: GameEventType.GAME_STARTED;
  cardInstances: CardInstance[];
  initialDeck: number[];
  stickerStock: Record<string, number>;
  discoveryPile: number[];
}

export interface RoundEndedEvent extends GameEvent {
  type: GameEventType.ROUND_ENDED;
  newCards: number[];
  onDiscoverEvents: TriggerEntry[];
}

export interface RoundStartedEvent extends GameEvent {
  type: GameEventType.ROUND_STARTED;
  round: number;
  newDrawPile: number[];
}

export interface TurnStartedEvent extends GameEvent {
  type: GameEventType.TURN_STARTED;
  turn: number;
  turnCards: number[];
  onPlayEvents: TriggerEntry[];
}

export interface CardProducedEvent extends GameEvent {
  type: GameEventType.CARD_PRODUCED;
  cardInstanceId: number;
  productions: Resources;
}

export interface AdvanceEvent extends GameEvent {
  type: GameEventType.ADVANCE;
  turnCards: number[];
  onPlayEvents: TriggerEntry[];
}

export interface UpgradeCardEvent extends GameEvent {
  type: GameEventType.UPGRADE_CARD;
  cardInstanceId: number;
  stateId: number;
  cost: Resources;
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
  onTurnEndedEvents: TriggerEntry[];
}
