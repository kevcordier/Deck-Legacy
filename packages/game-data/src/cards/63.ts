import {
  ActionEffectType,
  CardTag,
  PassiveType,
  TargetScope,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';
import { CardPassives } from '@deck-legacy/engine/domain/types/effects';

export const pirate: CardDef = {
  id: 63,
  name: 'Pirate',
  states: [
    {
      id: 1,
      name: 'Pirate',
      tags: [CardTag.ENEMY],
      negative: true,
      illustration: 'cards/63_1.jpg',
      glory: { amount: -2 },
      passives: [
        CardPassives[PassiveType.STAY_IN_PLAY],
        {
          id: '63-1-2',
          type: PassiveType.ADJUST_PRODUCTION,
          resources: {
            gold: -1,
          },
        },
        {
          id: '63-1-3',
          type: PassiveType.ADJUST_ADD_RESOURCES,
          resources: {
            gold: -1,
          },
        },
      ],
      actions: [
        {
          id: '63-1-1',
          defeat: true,
          cost: {
            resources: [
              {
                weapon: 2,
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
            {
              id: 2,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [77],
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
                gold: 4,
                iron: 1,
              },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Skilled Ally',
      tags: [CardTag.PERSON, CardTag.SEAFARING],
      illustration: 'cards/63_2.jpg',
      glory: { amount: 3 },
      productions: [
        {
          weapon: 1,
        },
        {
          iron: 1,
        },
      ],
      actions: [
        {
          id: '63-2-1',
          limitedTime: 1,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCOVER_CARD,
              cards: {
                ids: [93],
              },
            },
          ],
        },
      ],
    },
  ],
};
