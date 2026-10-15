import {
  ActionEffectType,
  CardTag,
  Options,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

export const darkPrince: CardDef = {
  id: 52,
  name: 'Dark Prince',
  states: [
    {
      id: 1,
      name: 'Dark Prince',
      illustration: 'cards/52_1.jpg',
      tags: [CardTag.ENEMY],
      negative: true,
      glory: { amount: -7 },
      passives: [
        {
          ...CardPassives[PassiveType.DESACTIVATE_OPTION],
          id: '52-1-1',
          options: [Options.ADVANCE, Options.UPGRADE, Options.END_TURN_ACTION],
        },
      ],
      actions: [
        {
          id: '52-1-1',
          defeat: true,
          cost: {
            resources: [
              {
                [ResourceType.WEAPON]: 5,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: {
                scope: [TargetScope.SELF],
              },
              states: { ids: [2] },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Impressed Boy',
      illustration: 'cards/52_2.jpg',
      tags: [CardTag.PERSON],
      actions: [
        {
          id: '52-2-1',
          cost: {
            destroy: {
              scope: [TargetScope.SELF],
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                [ResourceType.WEAPON]: 2,
              },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.IRON]: 1,
                [ResourceType.WEAPON]: 1,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Squire',
      illustration: 'cards/52_3.jpg',
      tags: [CardTag.PERSON],
      productions: [
        {
          [ResourceType.WEAPON]: 1,
        },
      ],
      glory: { amount: 3 },
      actions: [
        {
          id: '52-3-1',
          cost: {
            destroy: {
              scope: [TargetScope.SELF],
            },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                [ResourceType.WEAPON]: 3,
              },
            },
          ],
        },
      ],
    },
  ],
};
