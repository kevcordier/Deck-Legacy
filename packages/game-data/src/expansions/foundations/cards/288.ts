import { CardTag, ResourceType, TargetScope } from '@deck-legacy/engine/domain/enums';
import type { CardDef, GloryDef, UpgradeDef } from '@deck-legacy/engine/domain/types';

const TAGS = [CardTag.INVENTION];

/** Upgrade by discarding the Glassblower, or with `goods` goods: the player chooses. */
const upgrades = (goods: number, upgradeTo: number): UpgradeDef[] => [
  { cost: { discard: [{ name: 'Glassblower', pickNumber: 1 }] }, upgradeTo },
  { cost: { resources: [{ [ResourceType.GOODS]: goods }] }, upgradeTo },
];

/** Worth `amount` glory for each building in your kingdom. */
const perBuilding = (amount: number): GloryDef => ({
  amount: 0,
  valuePerElement: { amount, cards: { scope: [TargetScope.ANY], tags: [CardTag.BUILDING] } },
});

/** Plain Windows (Foundations 115, Glass Windows). */
export const glassWindows: CardDef = {
  id: 288,
  name: 'Plain Windows',
  states: [
    {
      id: 1,
      name: 'Plain Windows',
      illustration: 'cards/288_1.jpg',
      tags: TAGS,
      upgrade: upgrades(8, 2),
    },
    {
      id: 2,
      name: 'Colored Glass',
      illustration: 'cards/288_2.jpg',
      tags: TAGS,
      glory: perBuilding(1),
      upgrade: upgrades(10, 3),
    },
    {
      id: 3,
      name: 'Stained Glass',
      illustration: 'cards/288_3.jpg',
      tags: TAGS,
      glory: perBuilding(2),
      upgrade: upgrades(12, 4),
    },
    {
      id: 4,
      name: 'Window Art',
      illustration: 'cards/288_4.jpg',
      tags: TAGS,
      glory: perBuilding(3),
    },
  ],
};
