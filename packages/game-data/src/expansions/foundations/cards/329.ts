import { equipAction } from './equipAction';
import { hasStepsLeft } from './hasStepsLeft';
import { isEquipped } from './isEquipped';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

const TOY = 347;
const TAGS = [CardTag.ITEM, CardTag.INVENTION];

/** Children's Toy / Painted Model (Foundations 156): a person's equipment, side chosen on discovery. */
export const childrensToy: CardDef = {
  id: 329,
  name: "Children's Toy",
  chooseState: [1, 2],
  states: [
    {
      id: 1,
      name: "Children's Toy",
      tags: TAGS,
      equip: CardTag.PERSON,
      glory: { amount: 0, valuePerElement: { amount: 1, markedSteps: true } },
      track: {
        inOrder: true,
        steps: Array.from({ length: 30 }, (_, index) => ({ id: index + 1 })),
      },
      actions: [
        equipAction('329-1-1', CardTag.PERSON, TOY),
        {
          id: '329-1-2',
          trigger: Trigger.END_OF_TURN,
          condition: { type: 'and', conditions: [isEquipped(TOY), hasStepsLeft(TOY)] },
          actionEffects: [
            { id: 1, type: ActionEffectType.TRACK_ADVANCE, cards: { scope: [TargetScope.SELF] } },
          ],
        },
      ],
    },
    {
      id: 2,
      name: 'Painted Model',
      tags: TAGS,
      equip: CardTag.PERSON,
      productions: [{ [ResourceType.GOODS]: 1, [ResourceType.SCIENCE]: 1 }],
      actions: [equipAction('329-2-1', CardTag.PERSON, TOY)],
    },
  ],
};
