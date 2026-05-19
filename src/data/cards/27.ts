import { ActionEffectType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef, StepDef } from '@engine/domain/types';

const makeStep = (id: number): StepDef => ({
  id,
  effects: [
    {
      id: 1,
      type: ActionEffectType.ADD_RESOURCES,
      cards: {
        scope: [TargetScope.SELF],
      },
      resources: {
        [ResourceType.WEAPON]: 1,
      },
    },
  ],
});

export const mercenary: CardDef = {
  id: 27,
  name: 'Mercenary',
  states: [
    {
      id: 1,
      name: 'Mercenary',
      tags: [CardTag.PERSON],
      illustration: 'cards/27_1.jpg',
      actions: [
        {
          id: '27-1-1',
          cost: {
            resources: [
              {
                [ResourceType.GOLD]: 2,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.TRACK_ADVANCE,
              cards: { scope: [TargetScope.SELF] },
              steps: {
                pickMin: 1,
                pickMax: 2,
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
                [ResourceType.GOLD]: 3,
                [ResourceType.IRON]: 1,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
      track: {
        inOrder: false,
        steps: [
          makeStep(1),
          makeStep(2),
          makeStep(3),
          makeStep(4),
          makeStep(5),
          makeStep(6),
          makeStep(7),
          makeStep(8),
        ],
      },
    },
    {
      id: 2,
      name: 'Sir _____',
      chooseName: true,
      tags: [CardTag.PERSON, CardTag.KNIGHT],
      illustration: 'cards/27_2.jpg',
      productions: [
        {
          [ResourceType.WEAPON]: 1,
        },
      ],
      glory: { amount: 3 },
      actions: [
        {
          id: '27-2-1',
          endsTurn: true,
          limitedTime: 1,
          cost: {
            resources: [
              {
                [ResourceType.IRON]: 3,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              stickers: { ids: [5] },
              cards: {
                scope: [TargetScope.SELF],
              },
            },
          ],
        },
        {
          id: '27-2-2',
          endsTurn: true,
          limitedTime: 1,
          cost: {
            resources: [
              {
                [ResourceType.IRON]: 4,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              stickers: { ids: [5] },
              cards: {
                scope: [TargetScope.SELF],
              },
            },
          ],
        },
      ],
    },
  ],
};
