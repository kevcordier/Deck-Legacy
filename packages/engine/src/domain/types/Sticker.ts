import type { CardAction } from './Card';

export type Sticker = {
  id: number;
  icon?: string;
  label?: string;
  description?: string;
  production?: string;
  glory?: number;
  additionalGlory?: number;
  tags?: string[];
  /** 'stays_in_play' (id 7) or 'starts_in_play': the card begins each round already in play. */
  effectId?: string;
  /** Action the sticker gives the card it is on. */
  action?: CardAction;
};

export type StickerStock = Record<number, number>;
