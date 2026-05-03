import type { CardAction, Passive } from './Card';
import type { CardInstance } from './CardInstance';
import type { Resources } from './Resource';
import type { StickerStock } from './Sticker';
import type { Phase } from '@engine/domain/types/Phase';

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
  lastAddedCards: number[];
  lastDrawnCards: number[];
  lastDiscardedCards: number[];
  round: number;
  turn: number;
  phase: Phase;
};

export type GameParameters = {
  displayedDrawDeckCards: number;
  advanceCardDrawn: number;
  turnCardDrawn: number;
};
