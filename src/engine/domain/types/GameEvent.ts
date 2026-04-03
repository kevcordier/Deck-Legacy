import type { GameEventType } from '@engine/domain/enums';
import type {
  CardDef,
  CardInstance,
  GameState,
  ResolvedCost,
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
  cardInstances: CardInstance[];
  initialDeck: number[];
  stickerStock: Record<string, number>;
  discoveryPile: number[];
}

export interface RoundStartedEvent extends GameEvent {
  type: GameEventType.ROUND_STARTED;
  round: number;
  newCards: number[];
  onDiscoverEvents: TriggerEntry[];
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

export interface UseCardEffectEvent extends GameEvent {
  type: GameEventType.USE_CARD_EFFECT;
  gameState: GameState;
  cardDefs: Record<number, CardDef>;
  resolvedCost: ResolvedCost;
  triggerId: string;
  sourceInstanceId: number;
  isDiscarded?: boolean;
  isDestroyed?: boolean;
  validatedStepId?: number;
}

export interface SkipTriggerEvent extends GameEvent {
  type: GameEventType.SKIP_TRIGGER;
  triggerId: string;
}

export interface PassEvent extends GameEvent {
  type: GameEventType.PASS;
}
