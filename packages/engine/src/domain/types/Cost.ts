import type { CardSelector, ResourceCost, Resources } from './';

export type Cost = {
  /** Resource costs: `resources[0]` = fixed cost, subsequent indices are reserved for variants. */
  resources?: ResourceCost[];
  /** Cards to discard to pay the cost (resolved one at a time via `discard_for_cost`). */
  discard?: CardSelector[];
  /** Card to destroy on use (e.g. self-destruction cost). */
  destroy?: CardSelector;
  /** Cumulated resources or points to add (positive) or set (negative). */
  accumulated?: number;
  /** Set on upgrade costs: resources reserved by RESTRICT_SPEND can pay them. */
  forUpgrade?: boolean;
};

export type ResolvedCost = {
  resources: Resources;
  discardedCardIds: number[];
  destroyedCardIds: number[];
};
