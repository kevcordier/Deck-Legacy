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

export const assassin: CardDef = {
  id: 48,
  name: 'Assassin',
  states: [
    {
      id: 1,
      name: 'Assassin',
      tags: [CardTag.ENEMY],
      negative: true,
      illustration: 'cards/48_1.jpg',
      passives: [
        {
          id: '48-1-1',
          type: PassiveType.ADD_TRIGGER,
          trigger: {
            id: '48-1-2',
            type: Trigger.ON_PLAY,
            cards: {
              scope: [TargetScope.DRAWN],
              tags: [CardTag.PERSON],
            },
            actions: [
              {
                id: 1,
                type: ActionEffectType.DESTROY_CARD,
                cards: {
                  scope: [TargetScope.SELF],
                },
              },
              {
                id: 2,
                type: ActionEffectType.UPGRADE_CARD,
                cards: {
                  scope: [TargetScope.TRIGGER_SOURCE],
                },
                states: { ids: [2] },
              },
            ],
          },
        },
      ],
      actions: [
        {
          id: '48-1-1',
          defeat: true,
          cost: {
            resources: [
              {
                [ResourceType.WEAPON]: 3,
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
      name: 'Enemy soldier',
      tags: [CardTag.ENEMY],
      illustration: 'cards/48_2.jpg',
      negative: true,
      glory: {
        amount: -2,
      },
      passives: [CardPassives[PassiveType.STAY_IN_PLAY]],
      actions: [
        {
          id: '48-2-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.BLOCK_CARD,
              cards: {
                scope: [TargetScope.BOARD],
                tags: [CardTag.BUILDING, CardTag.LAND],
              },
            },
          ],
        },
        {
          id: '48-2-2',
          trigger: Trigger.END_OF_ROUND,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
              cards: {
                scope: [TargetScope.BLOCKED_BY_THIS],
              },
            },
          ],
        },
        {
          id: '48-2-3',
          defeat: true,
          cost: {
            resources: [
              {
                [ResourceType.WEAPON]: 2,
              },
            ],
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DESTROY_CARD,
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
