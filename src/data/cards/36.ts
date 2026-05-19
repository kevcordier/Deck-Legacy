import { ActionEffectType, CardTag, Options, PassiveType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const darkKnight: CardDef = {
  id: 36,
  name: 'Dark Knight',
  states: [
    {
      id: 1,
      name: 'Dark Knight',
      tags: [CardTag.ENEMY],
      negative: true,
      illustration: 'cards/36_1.jpg',
      glory: { amount: -3 },
      passives: [
        {
          ...CardPassives[PassiveType.DESACTIVATE_OPTION],
          id: '36-1-1',
          options: [Options.ADVANCE, Options.UPGRADE, Options.END_TURN_ACTION],
        },
      ],
      actions: [
        {
          id: '36-1-1',
          cost: {
            resources: [
              {
                weapon: 3,
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
      tags: [CardTag.PERSON],
      illustration: 'cards/36_2.jpg',
      actions: [
        {
          id: '36-2-1',
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
                weapon: 2,
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
                iron: 1,
                weapon: 1,
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
      tags: [CardTag.PERSON],
      illustration: 'cards/36_3.jpg',
      productions: [
        {
          weapon: 1,
        },
      ],
      glory: { amount: 3 },
      actions: [
        {
          id: '36-3-1',
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
                weapon: 3,
              },
            },
          ],
        },
      ],
    },
  ],
};
