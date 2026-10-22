import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardAction, CardDef } from '@deck-legacy/engine/domain/types';

const { GOLD, WOOD } = ResourceType;

/** "When you upgrade this, add sticker 2 (wood) to 1 land in play." */
const plantWood = (id: string): CardAction => ({
  id,
  trigger: Trigger.ON_UPGRADE,
  optional: true,
  actionEffects: [
    {
      id: 1,
      type: ActionEffectType.ADD_STICKER,
      stickers: { ids: [2] },
      cards: { scope: [TargetScope.BOARD], tags: [CardTag.LAND], pickNumber: 1 },
    },
  ],
});

/** New Forest (Foundations 81, Reforestation). */
export const newForest: CardDef = {
  id: 254,
  name: 'New Forest',
  states: [
    {
      id: 1,
      name: 'New Forest',
      tags: [CardTag.LAND],
      actions: [plantWood('254-1-1')],
      upgrade: [{ cost: { resources: [{ [GOLD]: 4 }] }, upgradeTo: 2 }],
    },
    {
      id: 2,
      name: 'Young Forest',
      tags: [CardTag.LAND],
      productions: [{ [WOOD]: 1 }],
      actions: [plantWood('254-2-1')],
      upgrade: [{ cost: { resources: [{ [GOLD]: 3 }] }, upgradeTo: 3 }],
    },
    {
      id: 3,
      name: 'Growing Forest',
      tags: [CardTag.LAND],
      productions: [{ [WOOD]: 2 }],
      actions: [plantWood('254-3-1')],
      upgrade: [{ cost: { resources: [{ [GOLD]: 2 }] }, upgradeTo: 4 }],
    },
    {
      id: 4,
      name: 'Thick Forest',
      tags: [CardTag.LAND],
      productions: [{ [WOOD]: 3 }],
      glory: { amount: 3 },
    },
  ],
};
