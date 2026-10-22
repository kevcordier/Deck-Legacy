import { equipAction } from './equipAction';
import { CardTag, ResourceType } from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const { IRON, WEAPON, SCIENCE } = ResourceType;
const SIEGE_ENGINE = 345;

/** Siege Engine (Foundations 154): a land's equipment producing weapons. */
export const siegeEngine: CardDef = {
  id: 327,
  name: 'Siege Engine',
  states: [
    {
      id: 1,
      name: 'Siege Engine',
      tags: [CardTag.INVENTION],
      equip: CardTag.LAND,
      productions: [{ [WEAPON]: 2 }],
      glory: { amount: 3 },
      actions: [equipAction('327-1-1', CardTag.LAND, SIEGE_ENGINE)],
      upgrade: [{ cost: { resources: [{ [IRON]: 3, [SCIENCE]: 3 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Siege Engine',
      tags: [CardTag.INVENTION],
      equip: CardTag.LAND,
      productions: [{ [WEAPON]: 4 }],
      glory: { amount: 10 },
      actions: [equipAction('327-2-1', CardTag.LAND, SIEGE_ENGINE)],
    },
  ],
};
