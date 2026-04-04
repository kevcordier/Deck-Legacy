import type { CardeSelector, Resources } from '@engine/domain/types';

export type Cost = {
  /** Resource costs: `resources[0]` = fixed cost, subsequent indices are reserved for variants. */
  resources?: Resources[];
  /** Cards to discard to pay the cost (resolved one at a time via `discard_for_cost`). */
  discard?: CardeSelector;
  /** Card to destroy on use (e.g. self-destruction cost). */
  destroy?: CardeSelector;
};

export type ResolvedCost = {
  resources: Resources;
  discardedCardIds: number[];
  destroyedCardIds: number[];
};
