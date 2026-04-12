import type {
  CardAction,
  CardInstance,
  Passive,
  Resources,
  StickerStock,
} from '@engine/domain/types';

export type TriggerEntry = {
  effectDef: CardAction;
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
  boardEffects: Record<number, Passive[]>;
  triggerPile: Record<string, TriggerEntry>;
  lastAddedIds: number[];
  round: number;
  turn: number;
};
