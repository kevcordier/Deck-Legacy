import { prisonerState } from './124';
import {
  ActionEffectType,
  CardTag,
  ResourceType,
  TargetScope,
  Trigger,
} from '@deck-legacy/engine/domain/enums';
import type { CardDef } from '@deck-legacy/engine/domain/types';

/** Rescuer (Ridding the Woods 21 and 22): frees a Prisoner, defeated for 3 iron. */
export const makeRescuer = (cardId: number): CardDef => ({
  id: cardId,
  name: 'Rescuer',
  states: [
    {
      id: 1,
      name: 'Rescuer',
      tags: [CardTag.ENEMY],
      negative: true,
      illustration: `cards/${cardId}_1.jpg`,
      glory: { amount: -2 },
      actions: [
        {
          id: `${cardId}-1-1`,
          trigger: Trigger.ON_PLAY,
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.PLAY_CARD,
              cards: { scope: [TargetScope.DISCARD], name: 'Prisoner', pickNumber: 1 },
            },
          ],
        },
        {
          id: `${cardId}-1-2`,
          endsTurn: true,
          defeat: true,
          cost: { resources: [{ [ResourceType.IRON]: 3 }] },
          actionEffects: [
            {
              id: 1,
              type: ActionEffectType.UPGRADE_CARD,
              cards: { scope: [TargetScope.SELF] },
              states: { ids: [2] },
            },
          ],
        },
      ],
    },
    prisonerState(cardId),
  ],
});

export const rescuer = makeRescuer(142);
