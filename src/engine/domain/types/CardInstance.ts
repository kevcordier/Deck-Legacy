export type CardInstance = {
  id: number;
  cardId: number;
  stateId: number;
  /** Stickers indexed by stateId: stickers[stateId] = array of sticker IDs */
  stickers: Record<number, number[]>;
  /** IDs of validated track steps */
  trackProgress: number[];
  /** Cumulated resources or points */
  cumulated: Record<string, number>;
  /** Card action IDs already consumed by one-time actions */
  usedActionIds: string[];
};
