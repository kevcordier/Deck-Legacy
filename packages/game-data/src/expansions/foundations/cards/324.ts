import { destroySelf } from './destroySelf';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { ActionEffect, CardDef, CardState } from '@deck-legacy/engine/domain/types';

const { IRON, SCIENCE } = ResourceType;

/** {{destroy}}: boost `count` productions on 1 building / land in play without stickers. */
const boosts = (count: number): ActionEffect[] => [
  ...Array.from({ length: count }, (_, index): ActionEffect => ({
    id: index + 1,
    type: ActionEffectType.BOOST_CARD,
    cards:
      index === 0
        ? {
            scope: [TargetScope.BOARD, TargetScope.PERMANENTS],
            tags: [CardTag.BUILDING, CardTag.LAND],
            having: { maxStickers: 0 },
            pickNumber: 1,
          }
        : { scope: [TargetScope.LAST_SELECTED] },
  })),
  destroySelf(count + 1),
];

/** Hydraulics (Foundations 151): each stage boosts one more production. */
export const hydraulics: CardDef = {
  id: 324,
  name: 'Hydraulics',
  states: [0, 1, 2, 3].map((index): CardState => ({
    id: index + 1,
    name: 'Hydraulics',
    tags: [CardTag.INVENTION],
    actions: [{ id: `324-${index + 1}-1`, actionEffects: boosts(index + 1) }],
    ...(index < 3 && {
      upgrade: [{ cost: { resources: [{ [IRON]: 2, [SCIENCE]: 2 }] }, upgradeTo: index + 2 }],
    }),
  })),
};
