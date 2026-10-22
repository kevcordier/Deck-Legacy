import { CardTag } from '@deck-legacy/engine/domain/enums';
import type { CardSelector } from '@deck-legacy/engine/domain/types';

/** Romance foundation (Foundations 88–105): instance ids, printed number + 191. */
export const ROMANCE_CARDS = {
  roundTable: 289,
  /** The quests and their ladies 99–104, in scarf order. */
  ladies: [290, 291, 292, 293, 294, 295],
  brotherhood: 296,
};

/** The scarves 59a–59f (red, yellow, pink, green, purple, white), in lady order. */
export const SCARVES = [591, 592, 593, 594, 595, 596];

export const KNIGHT: CardSelector = { tags: [CardTag.KNIGHT] };
export const LADY: CardSelector = { tags: [CardTag.LADY] };
export const KNIGHT_WITHOUT_SCARF: CardSelector = { ...KNIGHT, withoutStickerIds: SCARVES };
