import type { CardSelector, ResourceCost, Resources } from '.';

export type Cost = {
  /** Resource costs: `resources[0]` = fixed cost, subsequent indices are reserved for variants. */
  resources?: ResourceCost[];
  /** Cards to discard to pay the cost (resolved one at a time via `discard_for_cost`). */
  discard?: CardSelector[];
  /** Card to destroy on use (e.g. self-destruction cost). */
  destroy?: CardSelector;
  /** Cumulated resources or points to add (positive) or set (negative). */
  accumulated?: number;
  /** Resources of any types to pay, `anyResources` in total, split by the player (Cursed Lands). */
  anyResources?: number;
  /** Units of `resources[0]` the player does not pay, choosing which (Crane: upgrades cost 2 less). */
  discount?: number;
  /** Set on upgrade costs: resources reserved by RESTRICT_SPEND can pay them. */
  forUpgrade?: boolean;
};

export type ResolvedCost = {
  resources: Resources;
  discardedCardIds: number[];
  destroyedCardIds: number[];
};
