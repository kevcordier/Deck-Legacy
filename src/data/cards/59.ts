import { ActionEffectType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const finishingTouch: CardDef = {
  id: 59,
  name: 'Finishing Touch',
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: 'Finishing Touch',
      tags: [CardTag.EVENT],
      illustration: 'cards/59_1.jpg',
      actions: [
        {
          id: '59-1-1',
          cost: {
            destroy: { scope: [TargetScope.SELF] },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_STICKER,
              stickers: { ids: [6, 10], pickNumber: 2 },
              cards: {
                scope: [TargetScope.BOARD, TargetScope.FRIENDLY],
              },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Banquet',
      tags: [CardTag.EVENT],
      illustration: 'cards/59_2.jpg',
      actions: [
        {
          id: '59-2-1',
          cost: {
            destroy: { scope: [TargetScope.SELF] },
          },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  { gold: 1 },
                  { wood: 1 },
                  { stone: 1 },
                  { iron: 1 },
                  { weapon: 1 },
                  { goods: 1 },
                ],
              },
            },
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  { gold: 1 },
                  { wood: 1 },
                  { stone: 1 },
                  { iron: 1 },
                  { weapon: 1 },
                  { goods: 1 },
                ],
              },
            },
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  { gold: 1 },
                  { wood: 1 },
                  { stone: 1 },
                  { iron: 1 },
                  { weapon: 1 },
                  { goods: 1 },
                ],
              },
            },
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: {
                choice: [
                  { gold: 1 },
                  { wood: 1 },
                  { stone: 1 },
                  { iron: 1 },
                  { weapon: 1 },
                  { goods: 1 },
                ],
              },
            },
          ],
        },
      ],
    },
  ],
};
