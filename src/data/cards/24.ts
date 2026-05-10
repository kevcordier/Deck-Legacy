import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
} from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';
import { CardPassives } from '@engine/domain/types/effects';

export const scientist: CardDef = {
  id: 24,
  name: 'Scientist',
  states: [
    {
      id: 1,
      name: 'Scientist',
      tags: [CardTag.PERSON],
      illustration:
        'https://img.freepik.com/free-photo/portrait-male-scribe-medieval-times_23-2150931875.jpg?semt=ais_hybrid&w=740&q=80',
      passives: [
        {
          ...CardPassives[PassiveType.ADJUST_PRODUCTION],
          id: '24-1-1',
          resources: {
            [ResourceType.GOLD]: 1,
          },
          cards: {
            scope: [TargetScope.BOARD, TargetScope.SELF],
            tags: [CardTag.PERSON],
          },
        },
      ],
      upgrade: [
        {
          cost: {
            resources: [
              {
                [ResourceType.IRON]: 1,
                [ResourceType.WOOD]: 1,
                [ResourceType.STONE]: 2,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Observatory',
      tags: [CardTag.BUILDING],
      illustration: 'https://corwyn.wdfiles.com/local--files/skyreach-observatory/OBSERVATORY.jpg',
      glory: { amount: 5 },
      productions: [
        {
          gold: 1,
          goods: 1,
        },
      ],
      actions: [
        {
          id: '24-2-1',
          limitedTime: 1,
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [95],
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
                [ResourceType.IRON]: 2,
                [ResourceType.GOLD]: 1,
                [ResourceType.STONE]: 2,
              },
            ],
          },
          upgradeTo: 3,
        },
      ],
    },
    {
      id: 3,
      name: 'Lab',
      tags: [CardTag.BUILDING],
      illustration:
        'https://img.freepik.com/premium-vector/scientific-laboratory-medieval-science-laboratory-fantasy-lab-with-different-glassware-solutio_899391-2466.jpg',
      glory: { amount: 10 },
      productions: [
        {
          gold: 1,
          goods: 2,
        },
      ],
      actions: [
        {
          id: '24-3-1',
          limitedTime: 1,
          endsTurn: true,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [96],
              },
            },
          ],
        },
      ],
    },
  ],
};
