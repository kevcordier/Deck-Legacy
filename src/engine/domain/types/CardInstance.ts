export type CardInstance = {
  id: string;
  cardId: number;
  stateId: number;
  deckEntryId: number;
  /** Stickers indexed by stateId: stickers[stateId] = array of sticker IDs */
  stickers: Record<number, number[]>;
  /** Current progress on the card's track, or null if no track */
  trackProgress: number | null;
};
