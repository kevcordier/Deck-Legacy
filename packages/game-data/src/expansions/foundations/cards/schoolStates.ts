import { flipTo } from './flipTo';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardState } from '@deck-legacy/engine/domain/types';

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

const school = (
  cardId: number,
  id: number,
  name: string,
  extra: Partial<CardState>,
): CardState => ({
  id,
  name,
  tags: [CardTag.BUILDING],
  actions: [teach(`${cardId}-${id}-1`, id + 1)],
  ...extra,
});

/** Small School → School → Large School, each teaching persons (Foundations 49, 76). */
export const schoolStates = (cardId: number): CardState[] => [
  school(cardId, 1, 'Small School', {}),
  school(cardId, 2, 'School', { productions: [{ [ResourceType.GOLD]: 1 }] }),
  school(cardId, 3, 'Large School', {
    productions: [{ [ResourceType.GOLD]: 1 }],
    glory: { amount: 4 },
  }),
];
