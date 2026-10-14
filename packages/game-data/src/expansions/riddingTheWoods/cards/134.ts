import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, Passive } from '@deck-legacy/engine/domain/types';

const leavesWithoutEnemy = (id: string): Passive => ({
  id,
  type: PassiveType.REQUIRES_IN_PLAY,
  cards: { scope: [TargetScope.BOARD], tags: [CardTag.ENEMY] },
});

export const lousyGuard: CardDef = {
  id: 134,
  name: 'Lousy Guard',
  states: [
    {
      id: 1,
      name: 'Lousy Guard',
      tags: [CardTag.PERSON],
      illustration: 'cards/134_1.jpg',
      productions: [{ [ResourceType.WEAPON]: 1 }],
      passives: [leavesWithoutEnemy('134-1-1')],
      upgrade: [{ cost: { resources: [{ [ResourceType.IRON]: 2 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Impatient Guard',
      tags: [CardTag.PERSON],
      illustration: 'cards/134_2.jpg',
      productions: [{ [ResourceType.WEAPON]: 1 }],
      passives: [leavesWithoutEnemy('134-2-1')],
      upgrade: [{ cost: { resources: [{ [ResourceType.WEAPON]: 3 }] }, upgradeTo: 3 }],
    },
    {
      id: 3,
      name: 'Guard',
      tags: [CardTag.PERSON],
      illustration: 'cards/134_3.jpg',
      productions: [{ [ResourceType.WEAPON]: 1 }],
      glory: { amount: 3 },
      upgrade: [
        {
          cost: { discard: [{ scope: [TargetScope.BOARD], tags: [CardTag.ENEMY], pickNumber: 1 }] },
          upgradeTo: 4,
        },
      ],
    },
    {
      id: 4,
      name: 'Brave Knight',
      tags: [CardTag.PERSON, CardTag.KNIGHT],
      illustration: 'cards/134_4.jpg',
      productions: [{ [ResourceType.WEAPON]: 2 }],
      glory: { amount: 13 },
      actions: [
        {
          id: '134-4-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: { scope: [TargetScope.DISCARD], tags: [CardTag.ENEMY], pickNumber: 1 },
            },
          ],
        },
      ],
    },
  ],
};
