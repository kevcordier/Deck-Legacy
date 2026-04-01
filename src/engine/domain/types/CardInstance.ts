export type CardInstance = {
  id: number;
  cardId: number;
  stateId: number;
  /** Stickers indexed by stateId: stickers[stateId] = array of sticker IDs */
  stickers: Record<number, number[]>;
  /** Current progress on the card's track, or null if no track */
  trackProgress: number | null;
};
