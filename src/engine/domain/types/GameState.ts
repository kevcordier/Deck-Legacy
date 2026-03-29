import type { CardInstance, EffectDef, Resources, StickerStock } from '@engine/domain/types';

export type GameState = {
  drawPile: string[];
  discoveryPile: string[];
  destroyedPile: string[];
  discardPile: string[];
  board: string[];
  permanents: string[];
  instances: Record<string, CardInstance>;
  resources: Resources;
  stickerStock: StickerStock;
  blockingCards: Record<string, string>;
  triggerPile: Record<string, EffectDef[]>;
  lastAddedUids: string[];
  round: number;
  turn: number;
};
