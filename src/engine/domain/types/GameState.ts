import type { CardInstance, Effect, Resources, StickerStock } from '@engine/domain/types';

export type TriggerEntry = {
  effectDef: Effect;
  sourceInstanceId: number;
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
  blockingCards: Record<number, number>;
  triggerPile: Record<string, TriggerEntry>;
  lastAddedIds: number[];
  round: number;
  turn: number;
};
