import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef } from '@deck-legacy/engine/domain/types';

const discardStayingCards = (id: string): CardAction => ({
  id,
  trigger: Trigger.ON_PLAY,
  actionEffects: [
    {
      id: 1,
      type: ActionEffectType.DISCARD_CARD,
      cards: { scope: [TargetScope.BOARD, TargetScope.STAYING], autoPick: true },
    },
  ],
});

export const druidCamp: CardDef = {
  id: 145,
  name: 'Druid Camp',
  states: [
    {
      id: 1,
      name: 'Druid Camp',
      tags: [CardTag.LAND, CardTag.ENEMY],
      negative: true,
      illustration: 'cards/145_1.jpg',
      actions: [discardStayingCards('145-1-1')],
      upgrade: [
        {
          cost: {
            resources: [
              { [ResourceType.GOODS]: 2, [ResourceType.GOLD]: 2, [ResourceType.WEAPON]: 2 },
            ],
          },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Druid Sanctuary',
      tags: [CardTag.LAND, CardTag.ENEMY],
      negative: true,
      illustration: 'cards/145_2.jpg',
      actions: [
        discardStayingCards('145-2-1'),
        {
          id: '145-2-2',
          trigger: Trigger.ON_UPGRADE,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              cards: { scope: [TargetScope.BOARD, TargetScope.FRIENDLY], pickNumber: 2 },
              stickers: { ids: [6], pickNumber: 1 },
            },
          ],
        },
      ],
      upgrade: [{ cost: { resources: [{ [ResourceType.WEAPON]: 4 }] }, upgradeTo: 3 }],
    },
    {
      id: 3,
      name: 'Secluded Forest',
      tags: [CardTag.LAND],
      illustration: 'cards/145_3.jpg',
      productions: [{ [ResourceType.WOOD]: 1 }],
      actions: [
        {
          id: '145-3-1',
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.DISCARD_CARD,
              cards: { scope: [TargetScope.BOARD, TargetScope.STAYING], pickNumber: 1 },
            },
          ],
        },
      ],
      upgrade: [{ cost: { resources: [{ [ResourceType.GOLD]: 6 }] }, upgradeTo: 4 }],
    },
    {
      id: 4,
      name: 'Singing Forest',
      tags: [CardTag.LAND],
      illustration: 'cards/145_4.jpg',
      productions: [{ [ResourceType.WOOD]: 1, [ResourceType.GOODS]: 2 }],
      glory: { amount: 5 },
    },
  ],
};
