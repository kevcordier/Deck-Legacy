import { destroySelf } from './destroySelf';
import { flipTo } from './flipTo';
import { SCIENCE, SCIENCE_CARDS } from './scienceConstants';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef, CardState } from '@deck-legacy/engine/domain/types';

/** Discard 1 person to upgrade another person in play for free, then turn to `next`. */
const teach = (id: string, next: number): CardAction => ({
  id,
  endsTurn: true,
  cost: { discard: [{ tags: [CardTag.PERSON], pickNumber: 1 }] },
  actionEffects: [
    {
      id: 1,
      type: ActionEffectType.UPGRADE_CARD,
      cards: {
        scope: [TargetScope.BOARD, TargetScope.UPGRADABLE],
        tags: [CardTag.PERSON],
        pickNumber: 1,
      },
    },
    flipTo(2, next),
  ],
});

const school = (id: number, name: string, extra: Partial<CardState>): CardState => ({
  id,
  name,
  tags: [CardTag.BUILDING],
  actions: [teach(`222-${id}-1`, id + 1)],
  ...extra,
});

/** School (Foundations 49): teaches the persons, then discovers the University. */
export const school49: CardDef = {
  id: 222,
  name: 'Small School',
  states: [
    school(1, 'Small School', {}),
    school(2, 'School', { productions: [{ [ResourceType.GOLD]: 1 }] }),
    school(3, 'Large School', { productions: [{ [ResourceType.GOLD]: 1 }], glory: { amount: 4 } }),
    {
      id: 4,
      name: 'Renowned School',
      tags: [CardTag.BUILDING],
      productions: [{ [SCIENCE]: 1 }],
      glory: { amount: 6 },
      actions: [
        {
          id: '222-4-1',
          cost: { resources: [{ [SCIENCE]: 3 }] },
          actionEffects: [
            destroySelf(1),
            {
              id: 2,
              type: ActionEffectType.DISCOVER_CARD,
              cards: { ids: [SCIENCE_CARDS.university] },
            },
          ],
        },
      ],
    },
  ],
};
