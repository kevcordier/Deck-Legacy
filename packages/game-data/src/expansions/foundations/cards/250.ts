import { hasStepsLeft } from './hasStepsLeft';
import {
  ActionEffectType,
  CardTag,
  PassiveType,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef, Passive } from '@deck-legacy/engine/domain/types';

const { GOLD, WOOD, STONE, IRON, WEAPON, GOODS, HERB, SCIENCE } = ResourceType;
const MYSTIC_SCHOLAR = 268;

/** "You cannot gain science": every other resource stays allowed. */
const noScience = (id: string): Passive => ({
  id,
  type: PassiveType.RESTRICT_GAIN,
  resources: { [GOLD]: 1, [WOOD]: 1, [STONE]: 1, [IRON]: 1, [WEAPON]: 1, [GOODS]: 1, [HERB]: 1 },
});

/** Mystic Scholar (Foundations 77). */
export const mysticScholar: CardDef = {
  id: 250,
  name: 'Mystic Scholar',
  states: [
    {
      id: 1,
      name: 'Mystic Scholar',
      tags: [CardTag.PERSON],
      passives: [noScience('250-1-1')],
      track: { inOrder: true, steps: [{ id: 1 }, { id: 2 }, { id: 3 }] },
      actions: [
        {
          id: '250-1-1',
          trigger: Trigger.END_OF_TURN,
          condition: hasStepsLeft(MYSTIC_SCHOLAR),
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
            {
              id: 2,
              type: ActionEffectType.ADD_STICKER,
              cards: {
                scope: [TargetScope.BOARD, TargetScope.PERMANENTS, TargetScope.FRIENDLY],
                pickNumber: 1,
              },
              stickers: { ids: [6] },
            },
          ],
        },
      ],
      upgrade: [
        {
          cost: { discard: [{ having: { minProduction: 1 }, pickNumber: 5 }] },
          upgradeTo: 2,
        },
      ],
    },
    {
      id: 2,
      name: 'Mystic Scholar',
      tags: [CardTag.PERSON, CardTag.MAGE],
      glory: { amount: 5 },
      passives: [noScience('250-2-1')],
      actions: [
        {
          id: '250-2-1',
          cost: { discard: [{ produces: [SCIENCE], pickMin: 1, pickMax: 99 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.ADD_RESOURCES,
              resources: { choice: [{ any: 1 }] },
              repeat: 'valuePerElement',
              valuePerElement: {
                amount: 1,
                cards: { scope: [TargetScope.DISCARDED] },
                productionTotal: SCIENCE,
              },
            },
          ],
        },
      ],
    },
  ],
};
