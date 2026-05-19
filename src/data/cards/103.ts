import { ActionEffectType, CardTag, TargetScope } from '@engine/domain/enums';
import type { CardDef } from '@engine/domain/types';

export const investor: CardDef = {
  id: 103,
  name: 'Investor',
  states: [
    {
      id: 1,
      name: 'Investor',
      tags: [CardTag.PERSON, CardTag.LADY],
      illustration: 'cards/103_1.jpg',
      actions: [
        {
          id: '103-1-1',
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
              id: 2,
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
              id: 3,
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
              id: 4,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [2] },
            },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Investor',
      tags: [CardTag.PERSON, CardTag.LADY],
      illustration: 'cards/103_2.jpg',
      actions: [
        {
          id: '103-2-1',
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
              id: 2,
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
              id: 3,
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
              id: 4,
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
      name: 'Investor',
      tags: [CardTag.PERSON, CardTag.LADY],
      illustration: 'cards/103_3.jpg',
      actions: [
        {
          id: '103-3-1',
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
              id: 2,
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
              id: 3,
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
              id: 4,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [4] },
            },
          ],
        },
      ],
    },
    {
      id: 4,
      name: 'Investor',
      tags: [CardTag.PERSON, CardTag.LADY],
      illustration: 'cards/103_4.jpg',
      actions: [
        {
          id: '103-4-1',
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
          ],
        },
      ],
    },
  ],
};
