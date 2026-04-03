export type CardInstance = {
  id: number;
  cardId: number;
  stateId: number;
  /** Stickers indexed by stateId: stickers[stateId] = array of sticker IDs */
  stickers: Record<number, number[]>;
  /** IDs of validated track steps */
  trackProgress: number[];
};
