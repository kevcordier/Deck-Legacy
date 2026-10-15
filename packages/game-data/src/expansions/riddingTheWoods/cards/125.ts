import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

export const robberForest: CardDef = {
  id: 125,
  name: 'Robber Forest',
  states: [
    {
      id: 1,
      name: 'Robber Forest',
      tags: [CardTag.LAND, CardTag.ENEMY],
      negative: true,
      illustration: 'cards/125_1.jpg',
      actions: [
        {
          id: '125-1-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: { scope: [TargetScope.DISCARD], name: "Robbin' Leader", autoPick: true },
            },
          ],
        },
      ],
      upgrade: [{ cost: { resources: [{ [ResourceType.WEAPON]: 4 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Unsafe Forest',
      tags: [CardTag.LAND, CardTag.ENEMY],
      negative: true,
      illustration: 'cards/125_2.jpg',
      actions: [
        {
          id: '125-2-1',
          trigger: Trigger.ON_DEFEAT,
          optional: true,
          cost: { resources: [{ [ResourceType.GOLD]: 4, [ResourceType.WEAPON]: 2 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [3] },
            },
          ],
        },
      ],
    },
    {
      id: 3,
      name: 'Calm Forest',
      tags: [CardTag.LAND],
      illustration: 'cards/125_3.jpg',
      productions: [{ [ResourceType.WOOD]: 1 }],
      upgrade: [{ cost: { resources: [{ [ResourceType.GOLD]: 8 }] }, upgradeTo: 4 }],
    },
    {
      id: 4,
      name: 'Peaceful Forest',
      tags: [CardTag.LAND],
      illustration: 'cards/125_4.jpg',
      productions: [{ [ResourceType.WOOD]: 1 }],
      glory: { amount: 10 },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
    },
  ],
};
