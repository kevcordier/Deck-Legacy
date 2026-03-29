import type { GameEventType } from '@engine/domain/enums';
import type {
  CardInstance,
  EffectDef,
  GameState,
  ResolvedCost,
  Resources,
} from '@engine/domain/types';

export interface GameEvent {
  id: string;
  type: string;
  timestamp: number;
}

export interface GameStartedEvent extends GameEvent {
  type: GameEventType.GAME_STARTED;
  cardInstances: CardInstance[];
  initialDeck: string[];
  stickerStock: Record<string, number>;
  discoveryPile: string[];
}

export interface RoundStartedEvent extends GameEvent {
  type: GameEventType.ROUND_STARTED;
  round: number;
  newCards: string[];
  onDiscoverEvents: EffectDef[];
}

export interface TurnStartedEvent extends GameEvent {
  type: GameEventType.TURN_STARTED;
  turn: number;
  turnCards: string[];
  onPlayEvents: EffectDef[];
}

export interface CardProducedEvent extends GameEvent {
  type: GameEventType.CARD_PRODUCED;
  cardInstanceId: string;
  productions: Resources;
}

export interface AdvanceEvent extends GameEvent {
  type: GameEventType.ADVANCE;
  turnCards: string[];
  onPlayEvents: EffectDef[];
}

export interface UpgradeCardEvent extends GameEvent {
  type: GameEventType.UPGRADE_CARD;
  cardInstanceId: string;
  stateId: number;
  cost: Resources;
}

export interface UseCardEffectEvent extends GameEvent {
  type: GameEventType.USE_CARD_EFFECT;
  gameState: GameState;
  resolvedCost: ResolvedCost;
  triggerId: string;
}

export interface PassEvent extends GameEvent {
  type: GameEventType.PASS;
}
