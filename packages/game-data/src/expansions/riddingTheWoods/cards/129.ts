import { CardTag, PassiveType, ResourceType } from '@deck-legacy/engine/domain/enums';
import type { CardDef, Passive } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

const weaponsOnlyForUpgrades = (id: string): Passive => ({
  id,
  type: PassiveType.RESTRICT_SPEND,
  resources: { [ResourceType.WEAPON]: 1 },
});

export const largeRobberCamp: CardDef = {
  id: 129,
  name: 'Large Robber Camp',
  states: [
    {
      id: 1,
      name: 'Large Robber Camp',
      tags: [CardTag.LAND, CardTag.ENEMY],
      negative: true,
      illustration: 'cards/129_1.jpg',
      passives: [weaponsOnlyForUpgrades('129-1-1')],
      upgrade: [{ cost: { resources: [{ [ResourceType.WEAPON]: 4 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Small Robber Camp',
      tags: [CardTag.LAND, CardTag.ENEMY],
      negative: true,
      illustration: 'cards/129_2.jpg',
      passives: [weaponsOnlyForUpgrades('129-2-1')],
      upgrade: [{ cost: { resources: [{ [ResourceType.WEAPON]: 3 }] }, upgradeTo: 3 }],
    },
    {
      id: 3,
      name: 'Empty Camp',
      tags: [CardTag.LAND],
      illustration: 'cards/129_3.jpg',
      productions: [{ [ResourceType.WOOD]: 1 }],
      upgrade: [{ cost: { resources: [{ [ResourceType.GOLD]: 6 }] }, upgradeTo: 4 }],
    },
    {
      id: 4,
      name: 'Rich Forest',
      tags: [CardTag.LAND],
      illustration: 'cards/129_4.jpg',
      productions: [{ [ResourceType.GOLD]: 1, [ResourceType.WOOD]: 1 }],
      glory: { amount: 3 },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
    },
  ],
};
