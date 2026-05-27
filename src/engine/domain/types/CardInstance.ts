import type { ResourceType } from '@engine/domain/enums';

export type RemovedResourcesByScope = {
  production?: ResourceType[];
  actionCost?: ResourceType[];
  upgradeCost?: ResourceType[];
};

export type CardInstance = {
  id: number;
  cardId: number;
  stateId: number;
  /** Stickers indexed by stateId: stickers[stateId] = array of sticker IDs */
  stickers: Record<number, number[]>;
  /** IDs of validated track steps */
  trackProgress: number[];
  /** Cumulated resources or points */
  cumulated: number;
  /** Card action IDs already consumed by one-time actions */
  usedActionIds: string[];
  /** Resource keys removed for each state and scope; duplicate keys reduce by 1 cumulatively. */
  removedResourcesByState?: Record<number, RemovedResourcesByScope>;
  /** Empty glory values */
  glories: number[];
};
