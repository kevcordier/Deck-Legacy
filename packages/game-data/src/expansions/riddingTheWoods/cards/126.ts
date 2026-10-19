import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef } from '@deck-legacy/engine/domain/types';

const discardOnEnemyPlayed = (id: string, count: number): CardAction => ({
  id,
  trigger: Trigger.ON_PLAY,
  triggeredBy: { scope: [TargetScope.DRAWN], tags: [CardTag.ENEMY] },
  condition: { type: 'not', condition: { type: 'justPlayed' } },
  actionEffects: [
    {
      id: 1,
      type: ActionEffectType.DISCARD_CARD,
      cards: { scope: [TargetScope.BOARD, TargetScope.FRIENDLY], pickNumber: count },
    },
  ],
});

const weapons = (amount: number) => ({ resources: [{ [ResourceType.WEAPON]: amount }] });

export const terrifiedTown: CardDef = {
  id: 126,
  name: 'Terrified Town',
  states: [
    {
      id: 1,
      name: 'Terrified Town',
      tags: [CardTag.LAND],
      illustration: 'cards/126_1.jpg',
      productions: [{ [ResourceType.WEAPON]: 1 }],
      actions: [discardOnEnemyPlayed('126-1-1', 3)],
      upgrade: [{ cost: weapons(4), upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Uneasy Town',
      tags: [CardTag.LAND],
      illustration: 'cards/126_2.jpg',
      productions: [{ [ResourceType.WEAPON]: 1 }],
      actions: [discardOnEnemyPlayed('126-2-1', 2)],
      upgrade: [{ cost: weapons(4), upgradeTo: 3 }],
    },
    {
      id: 3,
      name: 'Guarded Town',
      tags: [CardTag.LAND],
      illustration: 'cards/126_3.jpg',
      productions: [{ [ResourceType.WEAPON]: 2 }],
      glory: { amount: 3 },
      actions: [
        {
          id: '126-3-1',
          limitedTime: 1,
          cost: { resources: [{ [ResourceType.WOOD]: 4 }] },
          // Outpost Construction (Ridding the Woods 29)
          actionEffects: [{ id: 1, type: ActionEffectType.DISCOVER_CARD, cards: { ids: [167] } }],
        },
      ],
      upgrade: [{ cost: weapons(6), upgradeTo: 4 }],
    },
    {
      id: 4,
      name: '_____',
      chooseName: true,
      tags: [CardTag.LAND],
      illustration: 'cards/126_4.jpg',
      productions: [{ [ResourceType.WEAPON]: 2 }],
      glory: { amount: 7 },
      actions: [
        {
          id: '126-4-1',
          endsTurn: true,
          limitedTime: 1,
          // Sheriff (Ridding the Woods 27)
          actionEffects: [{ id: 1, type: ActionEffectType.DISCOVER_CARD, cards: { ids: [165] } }],
        },
      ],
    },
  ],
};
