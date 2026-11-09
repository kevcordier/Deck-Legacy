import { chooseArchbishop } from './chooseArchbishop';
import { CHURCH_CARDS } from './churchConstants';
import { flipTo } from './flipTo';
import { ActionEffectType, CardTag, Trigger } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Archbishops (Foundations 71): discovers the Archbishop card, then keeps the rule as a reminder. */
export const archbishops: CardDef = {
  id: 244,
  name: 'STOP!',
  states: [
    {
      id: 1,
      name: 'STOP!',
      illustration: 'cards/244_1.jpg',
      actions: [
        {
          id: '244-1-1',
          limitedTime: 1,
          trigger: Trigger.ON_DISCOVER,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: { ids: [CHURCH_CARDS.archbishop], autoPick: true },
            },
            chooseArchbishop(2, false),
            flipTo(3, 2),
          ],
        },
      ],
    },
    { id: 2, name: 'Archbishops', illustration: 'cards/244_2.jpg', tags: [CardTag.PERMANENT] },
  ],
};
