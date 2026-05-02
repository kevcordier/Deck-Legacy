import { ActionEffectType, CardTag, ResourceType, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

const makeStep = (id: number) => ({
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

export const mercenay: CardDef = {
  id: 27,
  name: 'Mercenay',
  states: [
    {
      id: 1,
      name: 'Mercenay',
      tags: [CardTag.PERSON],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/610b2928-1cd1-4d21-af6f-3fb85d074067/anim=false,width=450,optimized=true/01132-3623825044.jpeg',
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
              cards: {
                scope: [TargetScope.SELF],
              },
              pickMin: 1,
              pickMax: 2,
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
        inOrder: true,
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
      name: 'Sir ___',
      chooseName: true,
      tags: [CardTag.PERSON, CardTag.KNIGHT],
      illustration:
        'https://image.civitai.com/xG1nkqKTMzGDvpLrqFT7WA/b30c1e9b-b9fe-4519-9410-e7eb0c944f02/anim=false,width=450,optimized=true/00045-940162767-0000-0000.jpeg',
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
          onTime: true,
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
              stickerIds: [5],
              cards: {
                scope: [TargetScope.SELF],
              },
            },
          ],
        },
        {
          id: '27-2-2',
          endsTurn: true,
          onTime: true,
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
              stickerIds: [5],
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
