import type { CardeSelector, Resources } from '@engine/domain/types';

export type Cost = {
  /** Coûts en ressources : `resources[0]` = coût fixe, les indices suivants sont réservés aux variantes. */
  resources?: Resources[];
  /** Cartes à défausser pour payer le coût (résolues une par une via `discard_for_cost`). */
  discard?: CardeSelector;
  /** Carte à détruire lors de l'utilisation (ex: coût de l'auto-destruction). */
  destroy?: CardeSelector;
};

export type ResolvedCost = {
  resources: Resources;
  discardedCardIds: number[];
  destroyedCardIds: number[];
};
