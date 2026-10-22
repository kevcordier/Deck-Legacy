import { CardTag } from '@deck-legacy/engine/domain/enums';
import type { CardSelector } from '@deck-legacy/engine/domain/types';

/** Church foundation (Foundations 64–87): instance ids, printed number + 191. */
export const CHURCH_CARDS = {
  archbishops: 262,
  /** The 6 Archbishops, one per state of a single card (Foundations 72–74). */
  archbishop: 263,
  monastery: 266,
  school: 267,
  mysticScholar: 268,
  students: [269, 270] as [number, number],
  pilgrimage: 271,
  reforestation: 272,
  churchAuthority: 273,
  newParadigm: 274,
  experiments: [275, 276],
  printingPress: 277,
  theologyOfScience: 278,
};

/** The blessing sticker (yellow star). */
export const BLESSING = 38;

/** Blessed cards: with the blessing sticker, or a printed blessing (tag). */
export const BLESSED: CardSelector = { tags: [CardTag.BLESSED], orStickerIds: [BLESSING] };

/** The Archbishop states, in card order: 72 front / back, 73 front / back, 74 front / back. */
export const ARCHBISHOP_NAMES = [
  'Gregorius',
  'Seraphinus',
  'Benedictus',
  'Valerian',
  'Arbrosius',
  'Silvanus',
];
